CREATE TABLE IF NOT EXISTS "email_change_tokens" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "email" VARCHAR NOT NULL,
  "code_hash" VARCHAR NOT NULL,
  "attempts" SMALLINT NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "used_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "email_change_tokens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_change_tokens_user_id_expires_at_idx" ON "email_change_tokens"("user_id", "expires_at");
CREATE INDEX IF NOT EXISTS "email_change_tokens_email_idx" ON "email_change_tokens"("email");

ALTER TABLE "email_change_tokens"
ADD CONSTRAINT "email_change_tokens_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
