/**
 * The refund policy for a customer cancelling their own booking, in one place:
 *
 *   Full refund (ticket plus the flat fee) until the start of the event day in
 *   India time. From then on the booking can still be cancelled, but nothing is
 *   refunded. An event that has already ended is the same, with its own wording.
 *
 * "Event day" is the Asia/Kolkata calendar day of Event.date. Only the date's
 * day is used: host-created events store the chosen day at 00:00 UTC (05:30 IST
 * that day) and keep the clock time as free text in Event.time, which is not
 * parsed. Host cancellation of an event and payments for an event cancelled
 * after booking do not use this: those are always refunded in full.
 */

/** India Standard Time is UTC+05:30 all year (no daylight saving). */
export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Stored in Booking.refundId on a cancelled, paid booking that is deliberately
 * not refunded. It tells that row apart from "cancelled, refund failed", which
 * looks the same otherwise (cancelled + paid + payment id) and must be retried.
 * Razorpay refund ids are never this value.
 */
export const NO_REFUND_MARKER = 'no-refund:after-cutoff';

/** The instant the refund window closes: 00:00 IST of the event's IST calendar day. */
export function refundCutoff(eventDate: Date): Date {
  const istDay = Math.floor((eventDate.getTime() + IST_OFFSET_MS) / DAY_MS);
  return new Date(istDay * DAY_MS - IST_OFFSET_MS);
}

export type RefundDecision = 'full' | 'event_day' | 'event_ended';

/** What a customer cancelling at `now` gets back. */
export function userRefundDecision(eventDate: Date, now: Date = new Date()): RefundDecision {
  const cutoff = refundCutoff(eventDate).getTime();
  if (now.getTime() < cutoff) return 'full';
  return now.getTime() < cutoff + DAY_MS ? 'event_day' : 'event_ended';
}
