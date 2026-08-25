-- Schema hygiene pass:
--   * every state-machine column (User.role/hostStatus, Event.status,
--     Booking.status/paymentStatus/paymentMethod) becomes a real Postgres
--     enum instead of an unconstrained String documented only in a comment
--   * PaymentStatus gains "failed", which the old column had no way to
--     represent — a failed Razorpay payment just stayed "unpaid" forever,
--     indistinguishable from a checkout that was never attempted
--   * dead Dodo-era columns (Booking.items/customer/paymentProof) are dropped
--   * HostApplication.sampleEventDate becomes a real DateTime
--   * indexes added for every hot, previously-unindexed filter/sort column
--
-- Unlike `prisma migrate dev`'s default diff for a String -> enum change
-- (DROP COLUMN + ADD COLUMN, which silently discards every existing value),
-- every column below is converted IN PLACE with `USING ... ::enum`, so
-- existing rows keep their value instead of reverting to the new column's
-- default.

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'host', 'admin');

-- CreateEnum
CREATE TYPE "HostStatus" AS ENUM ('none', 'pending', 'verified');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('draft', 'live', 'full', 'past', 'cancelled');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('pending', 'confirmed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('unpaid', 'paid', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('razorpay', 'upi', 'free');

-- AlterTable: User — convert role/hostStatus to enums in place
ALTER TABLE "User"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING ("role"::text::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'user',
  ALTER COLUMN "hostStatus" DROP DEFAULT,
  ALTER COLUMN "hostStatus" TYPE "HostStatus" USING ("hostStatus"::text::"HostStatus"),
  ALTER COLUMN "hostStatus" SET DEFAULT 'none',
  ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: Event — convert status to enum in place
ALTER TABLE "Event"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "EventStatus" USING ("status"::text::"EventStatus"),
  ALTER COLUMN "status" SET DEFAULT 'draft',
  ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: Booking — convert status/paymentStatus/paymentMethod to enums
-- in place, drop dead Dodo columns, add currency + refundId
ALTER TABLE "Booking"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "BookingStatus" USING ("status"::text::"BookingStatus"),
  ALTER COLUMN "status" SET DEFAULT 'pending',
  ALTER COLUMN "paymentStatus" DROP DEFAULT,
  ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING ("paymentStatus"::text::"PaymentStatus"),
  ALTER COLUMN "paymentStatus" SET DEFAULT 'unpaid',
  ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING (NULLIF("paymentMethod", '')::"PaymentMethod"),
  ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
  ADD COLUMN "refundId" TEXT,
  DROP COLUMN "items",
  DROP COLUMN "customer",
  DROP COLUMN "paymentProof",
  ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable: HostApplication — sampleEventDate String -> DateTime.
-- NULLIF guards against '' (empty string can't cast to timestamp directly).
ALTER TABLE "HostApplication"
  ALTER COLUMN "sampleEventDate" TYPE TIMESTAMP(3) USING (NULLIF("sampleEventDate", '')::timestamp),
  ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Event_status_date_idx" ON "Event"("status", "date");

-- CreateIndex
CREATE INDEX "Event_city_idx" ON "Event"("city");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "User_resetToken_idx" ON "User"("resetToken");
