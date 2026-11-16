-- AlterTable
ALTER TABLE "users" ADD COLUMN "closed_at" TIMESTAMPTZ,
ADD COLUMN "purge_at" TIMESTAMPTZ,
ADD COLUMN "paid_until" TIMESTAMPTZ,
ADD COLUMN "closure_reason" VARCHAR,
ADD COLUMN "closure_feedback" TEXT;

-- CreateIndex
CREATE INDEX "users_status_purge_at_idx" ON "users"("status", "purge_at");
