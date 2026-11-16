-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "slug" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_slug_key" ON "users"("slug");
