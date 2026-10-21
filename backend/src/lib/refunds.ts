import Razorpay from 'razorpay';
import { Booking } from '@prisma/client';
import prisma from './prisma';
import { createNotification } from './notify';

/**
 * Cancelling a booking and returning the money, in two separate steps so that
 * no Razorpay call ever happens inside a database transaction:
 *
 *  1. CLAIM  (one transaction, event row locked first — the same order
 *     confirmPaidBooking uses): flip the booking to 'cancelled' with a
 *     conditional update and, if it held seats, release exactly guestCount of
 *     them. Only the caller whose update matched does this, so two cancels can
 *     never release twice.
 *  2. REFUND (outside any transaction): ask Razorpay for the refund and then
 *     mark the booking 'refunded'.
 *
 * If step 2 fails the booking is left status 'cancelled' + paymentStatus
 * 'paid' with its paymentId: "cancelled, money still held". That state is
 * unique to this situation and is what docs/stuck-payments.sql lists; running
 * the cancel again (or re-running an event cancellation) retries just the
 * refund and does not touch the seats.
 */

/** A refund attempt on an already-cancelled booking is skipped if the row changed this recently. */
export const REFUND_LEASE_MS = 30_000;

export function describeRazorpayError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'error' in err) {
    const inner = (err as { error?: { description?: unknown } }).error;
    if (inner && typeof inner === 'object' && 'description' in inner) return String(inner.description);
  }
  return String(err);
}

/** Razorpay answers a second refund of a fully refunded payment with an error. */
function isAlreadyRefunded(err: unknown): boolean {
  return /already\s+(been\s+)?(fully\s+)?refunded|fully\s+refunded/i.test(describeRazorpayError(err));
}

/**
 * The one place a refund is requested. Returns the refund id (null if
 * Razorpay says the payment was already refunded). Throws on any other
 * failure, after logging the booking id (only) and Razorpay's reason.
 */
export async function issueRefund(razorpay: Razorpay, bookingId: string, paymentId: string, totalAmount: number): Promise<string | null> {
  try {
    const refund = await razorpay.payments.refund(paymentId, { amount: Math.round(totalAmount * 100) });
    return refund?.id ?? null;
  } catch (err: unknown) {
    if (isAlreadyRefunded(err)) return null;
    console.error(`[Refunds] Refund FAILED for booking ${bookingId}; it needs a retry or a manual refund: ${describeRazorpayError(err)}`);
    throw err;
  }
}

/** Money was actually taken through Razorpay and is still with us. */
export function refundIsDue(b: Pick<Booking, 'paymentStatus' | 'paymentMethod' | 'paymentId' | 'totalAmount'>): boolean {
  return b.paymentStatus === 'paid' && b.paymentMethod === 'razorpay' && !!b.paymentId && b.totalAmount > 0;
}

export type CancelOutcome =
  | { outcome: 'not_found' }
  | { outcome: 'nothing_to_do' }
  | { outcome: 'in_progress' }
  | { outcome: 'cancelled'; refund: 'none' | 'done' | 'failed'; booking: Booking };

export async function cancelBooking(
  getRazorpay: () => Razorpay,
  bookingId: string,
  options: { refund?: boolean } = {},
): Promise<CancelOutcome> {
  const refundWanted = options.refund !== false;

  // ── 1. Claim ─────────────────────────────────────────────────────────────
  const claim = await prisma.$transaction(async (tx) => {
    const first = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!first) return { kind: 'not_found' as const };

    if (first.eventId) {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${first.eventId} FOR UPDATE`;
    }
    // Re-read after the lock: decide from the current state, not the earlier one.
    const booking = await tx.booking.findUniqueOrThrow({ where: { id: bookingId } });

    if (booking.status === 'refunded') return { kind: 'settled' as const, booking };
    if (booking.status === 'cancelled') return { kind: 'already_cancelled' as const, booking };

    const heldSeats = booking.paymentStatus === 'paid';
    const { count } = await tx.booking.updateMany({
      where: { id: bookingId, status: { notIn: ['cancelled', 'refunded'] } },
      data: { status: 'cancelled' },
    });
    if (count === 0) return { kind: 'already_cancelled' as const, booking };

    if (heldSeats && booking.eventId) {
      await tx.event.update({
        where: { id: booking.eventId },
        data: { attendees: { decrement: booking.guestCount } },
      });
    }
    return { kind: 'claimed' as const, booking: { ...booking, status: 'cancelled' as const } };
  });

  if (claim.kind === 'not_found') return { outcome: 'not_found' };
  if (claim.kind === 'settled') return { outcome: 'nothing_to_do' };

  const booking = claim.booking;
  if (!refundIsDue(booking)) {
    return claim.kind === 'claimed'
      ? { outcome: 'cancelled', refund: 'none', booking }
      : { outcome: 'nothing_to_do' };
  }
  if (!refundWanted) {
    return claim.kind === 'claimed' ? { outcome: 'cancelled', refund: 'none', booking } : { outcome: 'nothing_to_do' };
  }

  // A cancelled booking whose refund is still owed was cancelled earlier. Take
  // a short lease so two workers do not both retry it: only one gets to touch
  // a row nobody has touched for REFUND_LEASE_MS.
  if (claim.kind === 'already_cancelled') {
    const lease = await prisma.booking.updateMany({
      where: {
        id: bookingId,
        status: 'cancelled',
        paymentStatus: 'paid',
        updatedAt: { lt: new Date(Date.now() - REFUND_LEASE_MS) },
      },
      data: { updatedAt: new Date() },
    });
    if (lease.count === 0) return { outcome: 'in_progress' };
  }

  // ── 2. Refund (no transaction open) ──────────────────────────────────────
  try {
    const refundId = await issueRefund(getRazorpay(), booking.id, booking.paymentId!, booking.totalAmount);
    await prisma.booking.updateMany({
      where: { id: booking.id, paymentStatus: 'paid' },
      data: { paymentStatus: 'refunded', ...(refundId ? { refundId } : {}) },
    });
  } catch {
    // Free the lease so an immediate retry is allowed. The booking stays
    // cancelled + paid, which is how the unfinished refund is found.
    await prisma.booking.updateMany({
      where: { id: booking.id, status: 'cancelled', paymentStatus: 'paid' },
      data: { updatedAt: new Date(Date.now() - REFUND_LEASE_MS - 1000) },
    });
    return { outcome: 'cancelled', refund: 'failed', booking };
  }
  const done = await prisma.booking.findUniqueOrThrow({ where: { id: booking.id } });
  return { outcome: 'cancelled', refund: 'done', booking: done };
}

export type RefundProcessedOutcome = 'released' | 'recorded' | 'ignored';

/**
 * A refund Razorpay reports as processed (refund.processed webhook). This
 * covers refunds started outside our code, e.g. from the Razorpay dashboard,
 * and is also called for the ones our own code started.
 *
 * Seats are released only by whoever flips the booking out of a non-cancelled
 * state (conditional update, event row locked), so a refund our cancel flow
 * already accounted for — booking already 'cancelled' — only has its payment
 * status recorded, and a duplicate delivery finds nothing left to do. A refund
 * for less than the amount paid is a goodwill adjustment, not a cancellation,
 * and is ignored.
 */
export async function applyRefundProcessed(
  paymentId: string,
  refundId: string | undefined,
  refundAmountPaise?: number,
): Promise<RefundProcessedOutcome> {
  return prisma.$transaction(async (tx) => {
    const first = await tx.booking.findFirst({ where: { paymentId } });
    if (!first) return 'ignored' as const;

    if (first.eventId) {
      await tx.$queryRaw`SELECT id FROM "Event" WHERE id = ${first.eventId} FOR UPDATE`;
    }
    const booking = await tx.booking.findUniqueOrThrow({ where: { id: first.id } });

    if (booking.paymentStatus !== 'paid') return 'ignored' as const;
    if (refundAmountPaise !== undefined && refundAmountPaise < Math.round(booking.totalAmount * 100)) {
      return 'ignored' as const;
    }

    const data = { paymentStatus: 'refunded' as const, ...(refundId ? { refundId } : {}) };

    // Still live: this refund is what ends the booking, so it releases the seats.
    const live = await tx.booking.updateMany({
      where: { id: booking.id, paymentStatus: 'paid', status: { notIn: ['cancelled', 'refunded'] } },
      data: { ...data, status: 'cancelled' },
    });
    if (live.count > 0) {
      if (booking.eventId) {
        await tx.event.update({
          where: { id: booking.eventId },
          data: { attendees: { decrement: booking.guestCount } },
        });
      }
      return 'released' as const;
    }

    // Already cancelled (seats already released): just record the refund.
    const recorded = await tx.booking.updateMany({
      where: { id: booking.id, paymentStatus: 'paid' },
      data,
    });
    return recorded.count > 0 ? ('recorded' as const) : ('ignored' as const);
  });
}

export interface CancelEventSummary {
  processed: number;
  refunded: number;
  failed: number;
  /** Bookings still to do: refund failed, being retried elsewhere, or not reached before the time budget ran out. */
  remaining: number;
}

/**
 * Cancels every live booking on an event and refunds the paid ones, one
 * booking at a time through cancelBooking (so each is claimed, its seats
 * released once, and the refund requested outside any transaction). Safe to
 * run again: a booking already settled is no longer selected, and one left
 * 'cancelled' with its payment still held is picked up and only refunded.
 *
 * Failures are logged by cancelBooking with the booking id only. Attendees
 * get an in-app notification once their booking is closed out (not while a
 * refund is still owed — the re-run notifies when it goes through).
 */
export async function cancelEventBookings(
  getRazorpay: () => Razorpay,
  eventId: string,
  options: { budgetMs?: number } = {},
): Promise<CancelEventSummary> {
  const deadline = Date.now() + (options.budgetMs ?? 20_000);

  const [event, bookings] = await Promise.all([
    prisma.event.findUnique({ where: { id: eventId }, select: { title: true } }),
    prisma.booking.findMany({
      where: {
        eventId,
        OR: [
          { status: { in: ['pending', 'confirmed'] } },
          { status: 'cancelled', paymentStatus: 'paid', paymentMethod: 'razorpay', paymentId: { not: null } },
        ],
      },
      select: { id: true, userId: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);
  const rawTitle = event?.title ?? 'your event';
  const title = rawTitle.length > 80 ? `${rawTitle.slice(0, 79)}…` : rawTitle;

  const summary: CancelEventSummary = { processed: 0, refunded: 0, failed: 0, remaining: 0 };
  for (const [i, b] of bookings.entries()) {
    if (Date.now() >= deadline) {
      summary.remaining += bookings.length - i;
      break;
    }
    let result: CancelOutcome;
    try {
      result = await cancelBooking(getRazorpay, b.id);
    } catch (err: unknown) {
      console.error(`[Refunds] Cancelling booking ${b.id} failed: ${describeRazorpayError(err)}`);
      summary.failed += 1;
      summary.remaining += 1;
      continue;
    }

    if (result.outcome === 'in_progress') {
      summary.remaining += 1;
      continue;
    }
    if (result.outcome !== 'cancelled') continue;
    if (result.refund === 'failed') {
      summary.failed += 1;
      summary.remaining += 1;
      continue;
    }

    summary.processed += 1;
    if (result.refund === 'done') summary.refunded += 1;
    const body = result.refund === 'done'
      ? `"${title}" was cancelled by the host. Your payment has been refunded in full and should reach you in 2–5 business days.`
      : `"${title}" was cancelled by the host. Your booking has been cancelled.`;
    await createNotification(b.userId, 'booking', 'Event cancelled', body);
  }
  return summary;
}
