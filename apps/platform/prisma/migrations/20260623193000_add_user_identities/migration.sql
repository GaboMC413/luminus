DO $$
BEGIN
  CREATE TYPE "auth_identity_provider" AS ENUM ('email', 'google', 'cognito', 'microsoft');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_identities" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "provider" "auth_identity_provider" NOT NULL,
  "provider_subject" VARCHAR NOT NULL,
  "email" VARCHAR,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "user_identities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_identities_provider_provider_subject_key"
  ON "user_identities"("provider", "provider_subject");

CREATE INDEX IF NOT EXISTS "user_identities_user_id_idx"
  ON "user_identities"("user_id");

CREATE INDEX IF NOT EXISTS "user_identities_email_idx"
  ON "user_identities"("email");

INSERT INTO "user_identities" ("user_id", "provider", "provider_subject", "email", "created_at", "updated_at")
SELECT "id", 'email'::"auth_identity_provider", lower("email"), lower("email"), "created_at", CURRENT_TIMESTAMP
FROM "users"
WHERE "password_hash" IS NOT NULL
ON CONFLICT ("provider", "provider_subject") DO NOTHING;

INSERT INTO "user_identities" ("user_id", "provider", "provider_subject", "email", "created_at", "updated_at")
SELECT "id", 'google'::"auth_identity_provider", replace("cognito_sub", 'google:', ''), lower("email"), "created_at", CURRENT_TIMESTAMP
FROM "users"
WHERE "cognito_sub" LIKE 'google:%'
ON CONFLICT ("provider", "provider_subject") DO NOTHING;
