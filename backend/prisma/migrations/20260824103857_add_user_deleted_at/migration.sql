-- Soft-delete marker for DELETE /api/users/me. The row is kept (not
-- hard-deleted) so existing Bookings/Events/HostApplications keep a valid
-- userId; email/name/PII are anonymized on the same request that sets this.

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);
