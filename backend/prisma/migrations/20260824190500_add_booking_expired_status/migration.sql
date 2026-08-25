-- Adds "expired" for bookings still unpaid 15+ minutes after creation (see
-- the sweep added in src/index.ts). Additive only — ALTER TYPE ... ADD VALUE
-- does not touch existing rows or require a table rewrite.
ALTER TYPE "BookingStatus" ADD VALUE 'expired';
