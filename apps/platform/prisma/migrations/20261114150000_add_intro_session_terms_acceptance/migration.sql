-- Add audit timestamps for member & specialist terms acceptance
ALTER TABLE "intro_sessions"
ADD COLUMN IF NOT EXISTS "requester_terms_accepted_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "specialist_terms_accepted_at" TIMESTAMPTZ;
