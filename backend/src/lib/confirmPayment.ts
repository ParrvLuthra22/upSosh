import Razorpay from 'razorpay';
import { Booking, Prisma } from '@prisma/client';
import prisma from './prisma';
import { BOOKING_HOLD_MS } from './booking';
import { issueRefund } from './refunds';

/**
 * What happened when a captured payment was applied to a booking.
 *
 *  - confirmed:       booking is now paid + confirmed and its seats are reserved
 *  - already_settled: it was already paid or refunded (a repeat delivery)
 *  - not_found:       no booking for that order/id
 *  - rejected:        the payment cannot be honoured (booking cancelled, or the
 *                     seats are gone); the caller must refund it
 */
export type ConfirmOutcome =
  | { outcome: 'confirmed' }
  | { outcome: 'already_settled' }
  | { outcome: 'not_found' }
  | { outcome: 'rejected'; reason: 'cancelled' | 'no_capacity'; booking: Booking };

/**
 * Apply a captured payment to a booking. Shared by POST /verify and the
 * payment.captured webhook so both enforce the same rules.
 *
 * Runs in one transaction that locks the event row first (the same lock
 * POST /api/bookings takes), so seat checks here and in booking creation are
 * serialised and attendees cannot pass capacity whatever order they arrive in.
 *
 *  - cancelled booking                         -> rejected
 *  - hold still live (unpaid, pending, young)  -> confirmed: its seats were
 *                                                 counted when it was created
 *  - hold lapsed (expired / failed / old)      -> confirmed only if its seats
 *                                                 are still free after paid
 *                                                 attendees and other live holds
 */
export async function confirmPaidBooking(
  where: Prisma.BookingWhereUniqueInput,
  paymentId: string,
): Promise<ConfirmOutcome> {
  return prisma.$transaction(async (tx) => {
    const found = await tx.booking.findUnique({ where });
    if (!found) return { outcome: 'not_found' as const };

    if (found.eventId) {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${found.eventId} FOR UPDATE`;
    }
    // Re-read after the lock: the state may have changed while waiting for it.
    const booking = await tx.booking.findUniqueOrThrow({ where: { id: found.id } });

    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'refunded') {
      return { outcome: 'already_settled' as const };
    }

    const reject = async (reason: 'cancelled' | 'no_capacity') => {
      // Keep the payment id so the refund (and any retry of it) can be made.
      await tx.booking.updateMany({
        where: { id: booking.id, paymentStatus: { in: ['unpaid', 'failed'] } },
        data: { paymentId },
      });
      return { outcome: 'rejected' as const, reason, booking: { ...booking, paymentId } };
    };

    if (booking.status === 'cancelled') return reject('cancelled');

    if (booking.eventId) {
      const event = await tx.event.findUnique({ where: { id: booking.eventId } });
      if (event) {
        const holdIsLive =
          booking.status === 'pending' &&
          booking.paymentStatus === 'unpaid' &&
          booking.createdAt.getTime() >= Date.now() - BOOKING_HOLD_MS;

        if (!holdIsLive) {
          const others = await tx.booking.aggregate({
            where: {
              eventId: booking.eventId,
              id: { not: booking.id },
              paymentStatus: 'unpaid',
              status: 'pending',
              createdAt: { gte: new Date(Date.now() - BOOKING_HOLD_MS) },
            },
            _sum: { guestCount: true },
          });
          const remaining = event.capacity - event.attendees - (others._sum.guestCount ?? 0);
          if (booking.guestCount > remaining) return reject('no_capacity');
        }
      }
    }

    const { count } = await tx.booking.updateMany({
      where: { id: booking.id, paymentStatus: { in: ['unpaid', 'failed'] }, status: { not: 'cancelled' } },
      data: {
        paymentStatus: 'paid',
        paymentId,
        status: 'confirmed',
        paymentMethod: 'razorpay',
        paidAt: new Date(),
      },
    });
    if (count === 0) return { outcome: 'already_settled' as const };

    if (booking.eventId) {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { attendees: { increment: booking.guestCount } },
      });
    }
    return { outcome: 'confirmed' as const };
  });
}

/**
 * Refund a payment that could not be applied to its booking, and record it.
 *
 * Idempotent: a booking that is already refunded is left alone, and Razorpay's
 * "already refunded" answer counts as success. On any other failure it throws
 * with the booking left unconfirmed and its payment id stored (still unpaid or
 * failed, still cancelled or expired), so a later delivery retries the refund.
 */
export async function refundRejectedPayment(
  razorpay: Razorpay,
  booking: Booking,
  paymentId: string,
): Promise<void> {
  const current = await prisma.booking.findUnique({ where: { id: booking.id } });
  if (current?.paymentStatus === 'refunded') return;

  // Throws after logging if Razorpay refuses; the booking is then left as it was.
  const refundId = await issueRefund(razorpay, booking.id, paymentId, booking.totalAmount);

  await prisma.booking.updateMany({
    where: { id: booking.id, paymentStatus: { in: ['unpaid', 'failed'] } },
    data: {
      paymentStatus: 'refunded',
      paymentId,
      paymentMethod: 'razorpay',
      ...(refundId ? { refundId } : {}),
      // A cancelled booking stays 'cancelled'; one that merely lost its seats is 'refunded'.
      ...(booking.status === 'cancelled' ? {} : { status: 'refunded' as const }),
    },
  });
}
