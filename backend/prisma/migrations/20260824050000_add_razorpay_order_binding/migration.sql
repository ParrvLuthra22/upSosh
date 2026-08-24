-- Bind a Razorpay order to the booking it was created for.
--
-- Without this, POST /api/payments/verify could not check that a valid
-- {order_id, payment_id, signature} triple belonged to the booking being
-- confirmed, so a single cheap payment could be replayed to mark any number
-- of bookings paid. The UNIQUE constraint is what makes that structurally
-- impossible: one order can only ever be attached to one booking.

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "razorpayOrderId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_razorpayOrderId_key" ON "Booking"("razorpayOrderId");
