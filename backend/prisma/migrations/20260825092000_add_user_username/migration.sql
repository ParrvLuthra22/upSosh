-- Add "username" as nullable first so existing rows aren't rejected, backfill
-- a value derived from each row's already-unique id (guaranteed collision-free
-- without needing to touch name/email), then tighten to NOT NULL + UNIQUE.
-- seed.ts overwrites the three seeded users with human-readable usernames
-- after this migration runs; any other pre-existing production users keep
-- the generated "user-<id>" value until they set a real one.
-- AlterTable
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Backfill
UPDATE "User" SET "username" = 'user-' || lower("id") WHERE "username" IS NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
