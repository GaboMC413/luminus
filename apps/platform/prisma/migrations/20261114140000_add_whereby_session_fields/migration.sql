-- Add optional Whereby room metadata to intro_sessions
ALTER TABLE "intro_sessions"
ADD COLUMN IF NOT EXISTS "host_meeting_link" VARCHAR,
ADD COLUMN IF NOT EXISTS "whereby_meeting_id" VARCHAR;
