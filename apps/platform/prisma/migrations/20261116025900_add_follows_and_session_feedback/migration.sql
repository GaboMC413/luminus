-- CreateTable: user_follows
CREATE TABLE IF NOT EXISTS "user_follows" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "follower_id" UUID NOT NULL,
    "following_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_follows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_follows_follower_id_following_id_key" ON "user_follows"("follower_id", "following_id");
CREATE INDEX IF NOT EXISTS "user_follows_follower_id_idx" ON "user_follows"("follower_id");
CREATE INDEX IF NOT EXISTS "user_follows_following_id_idx" ON "user_follows"("following_id");

DO $$ BEGIN
    ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: events
ALTER TABLE "events"
ADD COLUMN IF NOT EXISTS "reminder_sent_at" TIMESTAMPTZ;

-- AlterTable: intro_sessions
ALTER TABLE "intro_sessions"
ADD COLUMN IF NOT EXISTS "reminder_sent_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "feedback_email_sent_at" TIMESTAMPTZ;

-- CreateEnum: session_feedback_role & session_resonance
DO $$ BEGIN
    CREATE TYPE "session_feedback_role" AS ENUM ('requester', 'specialist');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "session_resonance" AS ENUM ('no_match', 'dim', 'warm', 'luminous');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: intro_session_feedbacks
CREATE TABLE IF NOT EXISTS "intro_session_feedbacks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "intro_session_id" UUID NOT NULL,
    "author_id" UUID NOT NULL,
    "role" "session_feedback_role" NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "resonance" "session_resonance",
    "public_note" TEXT,
    "private_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intro_session_feedbacks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "intro_session_feedbacks_intro_session_id_role_key" ON "intro_session_feedbacks"("intro_session_id", "role");
CREATE INDEX IF NOT EXISTS "intro_session_feedbacks_author_id_created_at_idx" ON "intro_session_feedbacks"("author_id", "created_at");

DO $$ BEGIN
    ALTER TABLE "intro_session_feedbacks" ADD CONSTRAINT "intro_session_feedbacks_intro_session_id_fkey" FOREIGN KEY ("intro_session_id") REFERENCES "intro_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "intro_session_feedbacks" ADD CONSTRAINT "intro_session_feedbacks_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
