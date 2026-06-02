ALTER TABLE "user_profiles"
ADD COLUMN "cover_url" VARCHAR,
ADD COLUMN "profession" VARCHAR;

CREATE TABLE "user_profile_prompts" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_profile_prompts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_profile_prompts_user_id_idx" ON "user_profile_prompts"("user_id");

ALTER TABLE "user_profile_prompts"
ADD CONSTRAINT "user_profile_prompts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
