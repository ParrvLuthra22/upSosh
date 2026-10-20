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
