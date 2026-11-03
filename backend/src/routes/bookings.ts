import { Router, Response } from 'express';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createBookingSchema } from '../lib/schemas';
import { sendBookingConfirmation } from '../lib/email';
import { getRazorpayClient } from './payments';
import { notify } from '../lib/notify';
import { PLATFORM_FEE_FLAT, BOOKING_HOLD_MS, eventClosedReason } from '../lib/booking';
import { cancelBooking } from '../lib/refunds';

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

class CapacityFullError extends Error {
  constructor(public remaining: number) {
    super('Event is at full capacity');
  }
}
class EventNotFoundError extends Error {}
class EventClosedError extends Error {}

const router = Router();

// POST /api/bookings — create booking (requireAuth)
//
// Pricing is computed here, never taken from the request:
//   ticketPrice = event.price * guestCount
//   platformFee = PLATFORM_FEE_FLAT (once per booking, not per guest)
//   totalAmount = ticketPrice + platformFee
// A free booking (free event, or no event) is never charged: all three are 0,
// so it cannot show up as revenue.
//
// Capacity is checked and (for free events) reserved inside ONE transaction
// that first locks the event row, so concurrent bookings for the last seats
// are serialised and cannot oversell. "Taken" seats are attendees (paid and
// free bookings) plus the guestCount of unpaid, pending bookings younger than
// BOOKING_HOLD_MS — the same bookings the expiry sweep has not yet expired.
//
// Free events are reserved (attendees incremented by guestCount) here, since
// there is no later "payment succeeded" moment to do it at — the booking is
// confirmed+paid immediately. Paid events do NOT increment attendees here;
// that only happens on payment success (POST /verify, or the webhook's
// payment.captured). Until then they hold their seats only via the derived
// pending count above, so an abandoned checkout frees them when it expires
// and there is no counter to decrement.
router.post('/', requireAuth, validateBody(createBookingSchema), async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { eventId, guestName, guestEmail, guestPhone, notes, paymentMethod, guestCount } =
      req.body as z.infer<typeof createBookingSchema>;

    // Pre-generated so qrCode can be set in the same insert instead of an
    // insert-then-update round trip to learn the id Prisma would have
    // assigned.
    const bookingId = crypto.randomUUID();

    const booking = await prisma.$transaction(async (tx) => {
      let ticketPrice = 0;
      let isFreeEvent = true;

      if (eventId) {
        // Row lock: a concurrent booking for the same event waits here until
        // this transaction commits, then sees its seats.
        await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
        const event = await tx.event.findUnique({ where: { id: eventId } });
        if (!event) throw new EventNotFoundError();

        // Applies to free events too: nothing is booked on an event that is
        // cancelled, not published, or already over.
        const closedReason = eventClosedReason(event);
        if (closedReason) throw new EventClosedError(closedReason);

        // A retry (payment dismissed, then "Pay" again) creates a fresh
        // booking; without this the user's own abandoned one would still hold
        // its seats and could block them from rebooking the last spots.
        await tx.booking.updateMany({
          where: { userId: req.user!.id, eventId, paymentStatus: 'unpaid', status: 'pending' },
          data: { status: 'expired' },
        });

        const held = await tx.booking.aggregate({
          where: {
            eventId,
            paymentStatus: 'unpaid',
            status: 'pending',
            createdAt: { gte: new Date(Date.now() - BOOKING_HOLD_MS) },
          },
          _sum: { guestCount: true },
        });
        const remaining = event.capacity - event.attendees - (held._sum.guestCount ?? 0);
        if (guestCount > remaining) throw new CapacityFullError(Math.max(remaining, 0));

        isFreeEvent = event.isFree || event.price === 0;
        // A free booking is never charged, so it records no price and no fee.
        ticketPrice = isFreeEvent ? 0 : event.price * guestCount;

        if (isFreeEvent) {
          await tx.event.update({
            where: { id: eventId },
            data: { attendees: { increment: guestCount } },
          });
        }
      }

      const platformFee = isFreeEvent ? 0 : PLATFORM_FEE_FLAT;
      const totalAmount = ticketPrice + platformFee;

      return tx.booking.create({
        data: {
          id: bookingId,
          userId: req.user!.id,
          eventId: eventId ?? null,
          guestName,
          guestEmail,
          guestPhone,
          notes: notes ?? null,
          guestCount,
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
    if (booking.paymentStatus === 'paid') {
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

      notify(
        booking.userId,
        'booking',
        "You're in!",
        `Your spot for "${event?.title ?? 'the event'}" is confirmed.`,
      );
    }

    return res.status(201).json({ booking, message: 'Booking created successfully' });
  } catch (err: unknown) {
    if (err instanceof EventNotFoundError) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (err instanceof EventClosedError) {
      return res.status(400).json({ message: err.message });
    }
    if (err instanceof CapacityFullError) {
      const message = err.remaining === 0
        ? 'Event is at full capacity'
        : `Only ${err.remaining} spot${err.remaining === 1 ? '' : 's'} left for this event`;
      return res.status(400).json({ message });
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

// PATCH /api/bookings/:id/cancel — cancel booking (requireAuth, must own or admin)
//
// cancelBooking (lib/refunds.ts) claims the booking first and refunds after, so
// a double or concurrent cancel releases seats and refunds at most once. If
// the refund itself fails the booking stays cancelled with its payment still
// held; cancelling again retries only the refund.
router.patch('/:id/cancel', requireAuth, async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.userId !== user.id && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const result = await cancelBooking(getRazorpayClient, id);

    if (result.outcome === 'not_found') return res.status(404).json({ message: 'Booking not found' });
    if (result.outcome === 'nothing_to_do') return res.status(400).json({ message: 'Booking is already cancelled' });
    if (result.outcome === 'in_progress') {
      return res.status(409).json({ message: 'This booking is already being cancelled — please check again in a minute' });
    }
    if (result.refund === 'failed') {
      return res.status(502).json({
        message: 'Your booking is cancelled, but the refund did not complete. Please try cancelling again in a few minutes, or contact support.',
        booking: result.booking,
      });
    }
    if (result.withheld) {
      return res.json({
        booking: result.booking,
        refunded: false,
        message: result.withheld === 'event_day'
          ? 'Booking cancelled. The event is today, so no refund is due under our refund policy.'
          : 'Booking cancelled. The event has already taken place, so no refund is due under our refund policy.',
      });
    }
    return res.json({
      booking: result.booking,
      refunded: result.refund === 'done',
      message: result.refund === 'done' ? 'Booking cancelled and refunded' : 'Booking cancelled successfully',
    });
  } catch (err: unknown) {
    console.error('PATCH /bookings/:id/cancel error:', errorMessage(err));
    return res.status(500).json({ message: 'Cancellation failed — please try again or contact support' });
  }
});

export default router;
