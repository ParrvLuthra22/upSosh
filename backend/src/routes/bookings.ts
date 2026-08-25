import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createBookingSchema } from '../lib/schemas';
import { sendBookingConfirmation } from '../lib/email';
import { getRazorpayClient } from './payments';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

class CapacityFullError extends Error {}

const router = Router();

// POST /api/bookings — create booking (requireAuth)
//
// Free events are reserved (attendees incremented) here, at creation, since
// there is no later "payment succeeded" moment to do it at — the booking is
// confirmed+paid immediately. Paid events are NOT reserved here; that only
// happens on payment success (POST /verify, or the webhook's
// payment.captured) — see the atomic updateMany there. Reserving at creation
// used to mean an abandoned checkout permanently held a seat forever.
router.post('/', requireAuth, validateBody(createBookingSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { eventId, guestName, guestEmail, guestPhone, notes, paymentMethod } = req.body as z.infer<typeof createBookingSchema>;

    let ticketPrice = 0;
    let isFreeEvent = true;
    let eventCapacity = 0;

    if (eventId) {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (!event) return res.status(404).json({ message: 'Event not found' });
      // Best-effort, non-binding check — gives an immediate "sold out" reply
      // instead of making the user go through checkout first. The binding
      // check is the atomic updateMany inside the transaction below (free
      // events) or in /verify and the webhook (paid events); either can
      // still reject even if this passed, if capacity filled in between.
      if (event.attendees >= event.capacity) {
        return res.status(400).json({ message: 'Event is at full capacity' });
      }
      ticketPrice = event.price;
      isFreeEvent = event.isFree || event.price === 0;
      eventCapacity = event.capacity;
    }

    const platformFee = 25;
    const totalAmount = ticketPrice + platformFee;
    // Pre-generated so qrCode can be set in the same insert instead of an
    // insert-then-update round trip to learn the id Prisma would have
    // assigned.
    const bookingId = crypto.randomUUID();

    const booking = await prisma.$transaction(async (tx) => {
      if (eventId && isFreeEvent) {
        const { count } = await tx.event.updateMany({
          where: { id: eventId, attendees: { lt: eventCapacity } },
          data: { attendees: { increment: 1 } },
        });
        if (count === 0) throw new CapacityFullError();
      }

      return tx.booking.create({
        data: {
          id: bookingId,
          userId: req.user!.id,
          eventId: eventId ?? null,
          guestName,
          guestEmail,
          guestPhone,
          notes: notes ?? null,
          ticketPrice,
          platformFee,
          totalAmount,
          paymentMethod: paymentMethod ?? (isFreeEvent ? 'free' : null),
          status: isFreeEvent ? 'confirmed' : 'pending',
          paymentStatus: isFreeEvent ? 'paid' : 'unpaid',
          qrCode: `UPSOSH-${bookingId}`,
        },
        include: { event: true },
      });
    });

    // Send confirmation email (fire-and-forget — don't block the response).
    // Only for free events, which are confirmed+paid immediately above —
    // paid events get this from /verify and the webhook on actual payment
    // success, not here, so an abandoned checkout no longer emails "Booking
    // confirmed" for money that was never charged.
    if (isFreeEvent) {
      const event = booking.event;
      sendBookingConfirmation({
        guestName: booking.guestName,
        guestEmail: booking.guestEmail,
        eventTitle: event?.title ?? 'your event',
        eventDate: event?.date ? new Date(event.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
        eventTime: event?.time ?? '',
        eventVenue: event?.venue ?? '',
        bookingId: booking.id,
        totalAmount: booking.totalAmount,
        qrCode: booking.qrCode ?? booking.id,
        isFree: true,
      }).catch(() => {});
    }

    return res.status(201).json({ booking, message: 'Booking created successfully' });
  } catch (err: unknown) {
    if (err instanceof CapacityFullError) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }
    console.error('POST /bookings error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings — current user's bookings (requireAuth)
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user!.id },
      include: { event: { include: { host: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ bookings });
  } catch (err: unknown) {
    console.error('GET /bookings error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/bookings/:id — get booking by id (requireAuth, must own or admin)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { event: { include: { host: true } }, user: { select: { id: true, name: true, email: true } } },
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    return res.json({ booking });
  } catch (err: unknown) {
    console.error('GET /bookings/:id error:', errorMessage(err));
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/bookings/:id/cancel — cancel booking (requireAuth, must own)
//
// A seat was only ever actually consumed if paymentStatus reached 'paid' —
// free events reach it at creation, paid events only on payment success (see
// POST / above) — so that's also the only case attendees needs decrementing.
// A still-unpaid booking never held a seat, so cancelling it is a no-op on
// capacity.
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    const heldSeat = booking.paymentStatus === 'paid';
    const needsRefund = booking.paymentStatus === 'paid' && booking.paymentMethod === 'razorpay' && !!booking.paymentId;

    // Issue the refund BEFORE writing anything — if Razorpay rejects it (already
    // refunded, invalid payment, network error), the booking stays exactly as
    // it was rather than showing 'cancelled' with no money actually returned.
    let refundId: string | null = null;
    if (needsRefund) {
      const razorpay = getRazorpayClient();
      const refund = await razorpay.payments.refund(booking.paymentId!, {
        amount: Math.round(booking.totalAmount * 100),
      });
      refundId = refund.id;
    }

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id },
        data: {
          status: 'cancelled',
          ...(needsRefund ? { paymentStatus: 'refunded', refundId } : {}),
        },
      }),
      ...(booking.eventId && heldSeat
        ? [prisma.event.update({ where: { id: booking.eventId }, data: { attendees: { decrement: 1 } } })]
        : []),
    ]);

    return res.json({ booking: updatedBooking, message: 'Booking cancelled successfully' });
  } catch (err: unknown) {
    console.error('PATCH /bookings/:id/cancel error:', errorMessage(err));
    return res.status(500).json({ message: 'Cancellation failed — please try again or contact support' });
  }
});

export default router;
