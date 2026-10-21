-- Stuck payments: money taken but no ticket, and refunds that did not finish.
--
-- READ-ONLY: every statement is a SELECT. Nothing here has been run by
-- anyone yet. Run it yourself with psql against the database you want to
-- inspect, e.g.
--   psql "$DATABASE_URL" -f docs/stuck-payments.sql
-- Row contents are personal data; do not paste them into issues or PRs.
--
-- Fixing a row is a separate, deliberate step: refund it from the Razorpay
-- dashboard (the refund.processed webhook then records it), or cancel the
-- booking again in the app, which retries just the refund.

-- 1. Payment received, booking never confirmed.
--    A payment id is stored but the booking is still unpaid or failed. This is
--    what a payment looks like when it was rejected (booking or event
--    cancelled, seats gone) and its automatic refund has not gone through.
SELECT b.id, b."userId", b."eventId", b.status, b."paymentStatus", b."paymentId",
       b."totalAmount", b."createdAt", b."updatedAt"
FROM "Booking" b
WHERE b."paymentId" IS NOT NULL
  AND b."paymentStatus" IN ('unpaid', 'failed')
ORDER BY b."updatedAt" DESC;

-- 2. Cancelled (or expired) but the money is still held.
--    A cancel claims the booking first and refunds second; if the refund
--    failed the booking stays here. Cancelling it again retries the refund.
SELECT b.id, b."userId", b."eventId", b.status, b."paymentStatus", b."paymentId",
       b."totalAmount", b."updatedAt"
FROM "Booking" b
WHERE b."paymentMethod" = 'razorpay'
  AND b."paymentId" IS NOT NULL
  AND b."totalAmount" > 0
  AND b."paymentStatus" = 'paid'
  AND b.status IN ('cancelled', 'expired', 'refunded')
ORDER BY b."updatedAt" DESC;

-- 3. Failed refunds, grouped by event (what a host cancellation left behind).
SELECT b."eventId", e.title, count(*) AS bookings_owed, sum(b."totalAmount") AS amount_owed
FROM "Booking" b
LEFT JOIN "Event" e ON e.id = b."eventId"
WHERE b."paymentMethod" = 'razorpay'
  AND b."paymentId" IS NOT NULL
  AND b."paymentStatus" = 'paid'
  AND b.status = 'cancelled'
GROUP BY b."eventId", e.title
ORDER BY amount_owed DESC;

-- 4. Marked refunded without a refund id (refund recorded from a webhook or
--    an "already refunded" answer; worth a look in the Razorpay dashboard).
SELECT b.id, b.status, b."paymentId", b."totalAmount", b."updatedAt"
FROM "Booking" b
WHERE b."paymentStatus" = 'refunded'
  AND b."refundId" IS NULL
ORDER BY b."updatedAt" DESC;

-- 5. Seat counter drift: events whose attendees differs from the guests on
--    their live paid bookings. A non-zero difference after a cancellation or
--    refund points at seats released twice or not at all.
SELECT e.id, e.title, e.attendees AS recorded,
       coalesce(sum(b."guestCount"), 0) AS expected,
       e.attendees - coalesce(sum(b."guestCount"), 0) AS difference
FROM "Event" e
LEFT JOIN "Booking" b
  ON b."eventId" = e.id
 AND b."paymentStatus" = 'paid'
 AND b.status IN ('pending', 'confirmed')
GROUP BY e.id, e.title, e.attendees
HAVING e.attendees <> coalesce(sum(b."guestCount"), 0)
ORDER BY abs(e.attendees - coalesce(sum(b."guestCount"), 0)) DESC;

-- Not findable from this database: a payment Razorpay captured when neither
-- /verify nor the webhook ever reached us leaves no payment id here. Compare
-- the Razorpay dashboard's captured payments against bookings that are paid.
