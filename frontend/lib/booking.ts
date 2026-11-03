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
  // A free event is never charged: no price, no fee (mirrors the server).
  if (unitPrice === 0) return { guestCount, ticketPrice: 0, platformFee: 0, totalAmount: 0 };
  const ticketPrice = unitPrice * guestCount;
  return {
    guestCount,
    ticketPrice,
    platformFee: PLATFORM_FEE_FLAT,
    totalAmount: ticketPrice + PLATFORM_FEE_FLAT,
  };
}

/**
 * What a customer gets back for cancelling their own booking now. Mirrors
 * userRefundDecision in backend/src/lib/refundPolicy.ts (keep in sync): a full
 * refund until 00:00 India time on the event's calendar day, none from then on.
 * The server decides; this only tells the customer before they confirm.
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type CancelRefund = 'full' | 'event_day' | 'event_ended';

export function cancelRefund(eventDate: Date, now: Date = new Date()): CancelRefund {
  const cutoff = Math.floor((eventDate.getTime() + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS;
  if (now.getTime() < cutoff) return 'full';
  return now.getTime() < cutoff + DAY_MS ? 'event_day' : 'event_ended';
}

