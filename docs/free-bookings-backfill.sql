-- Backfill: free bookings were stored as paid with totalAmount = 25 (the flat
-- platform fee) although nothing was charged. This zeroes ticketPrice,
-- platformFee and totalAmount for paid bookings whose event is free, so they
-- stop counting as revenue (GET /api/events/host/stats sums totalAmount).
--
-- NOT RUN by anyone yet. Review, then run it yourself, once, with psql:
--   psql "$DATABASE_URL" -f docs/free-bookings-backfill.sql
-- Take a database backup first.
--
-- Scope: only bookings that were never charged through Razorpay
-- (paymentMethod 'free', or no payment id / order id), on events that are free
-- (isFree = true or price = 0). Bookings with a Razorpay payment are left alone.
-- It also catches event-less bookings (eventId NULL), which were stored as
-- confirmed/paid with total 25 and were never charged either.

BEGIN;

-- 1. Review first: how many rows will change, and what they are worth.
SELECT count(*) AS rows_to_fix, coalesce(sum("totalAmount"), 0) AS recorded_amount
FROM "Booking" b
LEFT JOIN "Event" e ON e."id" = b."eventId"
WHERE b."paymentStatus" = 'paid'
  AND b."paymentId" IS NULL
  AND b."razorpayOrderId" IS NULL
  AND (b."eventId" IS NULL OR e."isFree" = true OR e."price" = 0)
  AND (b."totalAmount" <> 0 OR b."platformFee" <> 0 OR b."ticketPrice" <> 0);

-- 2. The fix.
UPDATE "Booking" b
SET "ticketPrice" = 0, "platformFee" = 0, "totalAmount" = 0
FROM (
  SELECT b2."id"
  FROM "Booking" b2
  LEFT JOIN "Event" e ON e."id" = b2."eventId"
  WHERE b2."paymentStatus" = 'paid'
    AND b2."paymentId" IS NULL
    AND b2."razorpayOrderId" IS NULL
    AND (b2."eventId" IS NULL OR e."isFree" = true OR e."price" = 0)
    AND (b2."totalAmount" <> 0 OR b2."platformFee" <> 0 OR b2."ticketPrice" <> 0)
) AS target
WHERE b."id" = target."id";

-- 3. Check the result before committing: this should now return 0.
SELECT count(*) AS still_wrong
FROM "Booking" b
LEFT JOIN "Event" e ON e."id" = b."eventId"
WHERE b."paymentStatus" = 'paid'
  AND b."paymentId" IS NULL
  AND b."razorpayOrderId" IS NULL
  AND (b."eventId" IS NULL OR e."isFree" = true OR e."price" = 0)
  AND b."totalAmount" <> 0;

-- If the counts look right, run COMMIT; otherwise ROLLBACK;
-- (Left as ROLLBACK so running this file as-is changes nothing.)
ROLLBACK;
