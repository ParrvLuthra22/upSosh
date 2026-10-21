/**
 * Booking constants shared by routes/bookings.ts, routes/payments.ts and the
 * expiry sweep in index.ts.
 */

/**
 * Flat platform fee per BOOKING (not per guest): totalAmount =
 * event.price * guestCount + PLATFORM_FEE_FLAT. The frontend mirrors this as
 * PLATFORM_FEE_FLAT in frontend/lib/booking.ts so the screen shows what
 * Razorpay will charge — keep the two in sync.
 */
export const PLATFORM_FEE_FLAT = 25;

/** Most tickets one booking can reserve. */
export const MAX_GUESTS_PER_BOOKING = 10;

/**
 * How long an unpaid, pending booking holds its seats against new bookings.
 * The sweep in index.ts expires bookings older than this; booking creation
 * counts only unexpired ones, so the two always agree on what is "held".
 */
export const BOOKING_HOLD_MS = 15 * 60 * 1000;

/**
 * Why an event cannot take bookings or payments, or null if it can. Open means
 * status live or full (full is left to the capacity check, which words the
 * "no spots" answer) and a date that has not passed — the same test the public
 * event list uses to decide what to show.
 */
export function eventClosedReason(event: { status: string; date: Date }, now: Date = new Date()): string | null {
  if (event.status === 'cancelled') return 'This event has been cancelled';
  if (event.status !== 'live' && event.status !== 'full') return 'This event is not open for booking';
  if (event.date.getTime() < now.getTime()) return 'This event has already taken place';
  return null;
}
