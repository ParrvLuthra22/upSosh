/**
 * Booking price estimate shown before a booking exists.
 *
 * The server is the only source of truth: POST /api/bookings computes
 * ticketPrice = price * guestCount, platformFee = a flat fee once per BOOKING
 * (not per guest) and totalAmount = ticketPrice + platformFee, and Razorpay
 * charges exactly that. This mirrors the formula so the screen can show the
 * figure up front; once the booking is created the UI switches to the
 * server's numbers (see bookingTotals in lib/stores/booking.ts).
 */

/** Keep in sync with PLATFORM_FEE_FLAT in backend/src/lib/booking.ts. */
export const PLATFORM_FEE_FLAT = 25;

/** Keep in sync with MAX_GUESTS_PER_BOOKING in backend/src/lib/booking.ts. */
export const MAX_GUESTS_PER_BOOKING = 10;

export interface BookingTotals {
  guestCount: number;
  ticketPrice: number;
  platformFee: number;
  totalAmount: number;
}

export function estimateBookingTotals(unitPrice: number, guestCount: number): BookingTotals {
  const ticketPrice = unitPrice * guestCount;
  return {
    guestCount,
    ticketPrice,
    platformFee: PLATFORM_FEE_FLAT,
    totalAmount: ticketPrice + PLATFORM_FEE_FLAT,
  };
}
