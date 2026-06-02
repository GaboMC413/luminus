CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
  CREATE TYPE "auth_provider" AS ENUM ('email', 'google', 'microsoft', 'unknown');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "user_status" AS ENUM ('active', 'disabled', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "cognito_sub" VARCHAR NOT NULL,
  "email" VARCHAR NOT NULL,
  "email_verified" BOOLEAN NOT NULL DEFAULT false,
  "auth_provider" "auth_provider" NOT NULL DEFAULT 'unknown',
  "status" "user_status" NOT NULL DEFAULT 'active',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_cognito_sub_key" ON "users"("cognito_sub");
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "user_profiles" (
  "user_id" UUID NOT NULL,
  "full_name" VARCHAR,
  "first_name" VARCHAR,
  "last_name" VARCHAR,
  "avatar_url" VARCHAR,
  "city" VARCHAR,
  "country" VARCHAR,
  "phone_number" VARCHAR,
  "gender" VARCHAR,
  "birthdate" DATE,
  "bio" TEXT,
  "intention" TEXT,
  "selected_plan" VARCHAR,
  "is_onboarded" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("user_id")
);

DO $$ BEGIN
  ALTER TABLE "user_profiles"
  ADD CONSTRAINT "user_profiles_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "interest_categories" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "interest_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "interest_categories_slug_key" ON "interest_categories"("slug");

CREATE TABLE IF NOT EXISTS "interests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL,
  "name" VARCHAR NOT NULL,
  "slug" VARCHAR NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "interests_slug_key" ON "interests"("slug");

DO $$ BEGIN
  ALTER TABLE "interests"
  ADD CONSTRAINT "interests_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "interest_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "user_interests" (
  "user_id" UUID NOT NULL,
  "interest_id" UUID NOT NULL,
  "weight" SMALLINT NOT NULL DEFAULT 1,
  "source" VARCHAR NOT NULL DEFAULT 'onboarding',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_interests_pkey" PRIMARY KEY ("user_id", "interest_id")
);

DO $$ BEGIN
  ALTER TABLE "user_interests"
  ADD CONSTRAINT "user_interests_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "user_interests"
  ADD CONSTRAINT "user_interests_interest_id_fkey"
  FOREIGN KEY ("interest_id") REFERENCES "interests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
