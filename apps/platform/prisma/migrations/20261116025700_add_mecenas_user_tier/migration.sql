-- Ensure user_tier enum exists (for fresh/shadow databases) and includes MECENAS
DO $$ BEGIN
  CREATE TYPE "user_tier" AS ENUM ('FREE', 'MECENAS', 'BASIC');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE "user_tier" ADD VALUE IF NOT EXISTS 'FREE';
ALTER TYPE "user_tier" ADD VALUE IF NOT EXISTS 'MECENAS';
ALTER TYPE "user_tier" ADD VALUE IF NOT EXISTS 'BASIC';

-- Ensure users.tier column exists without modifying existing user data
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "tier" "user_tier" NOT NULL DEFAULT 'FREE';
