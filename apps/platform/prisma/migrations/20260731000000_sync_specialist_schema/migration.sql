-- CreateEnum
CREATE TYPE "suggestion_type" AS ENUM ('USER_INTEREST', 'SPECIALIST_AREA');

-- CreateEnum
CREATE TYPE "suggestion_status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "interest_categories" ADD COLUMN     "bg_color" VARCHAR,
ADD COLUMN     "color" VARCHAR,
ADD COLUMN     "icon" VARCHAR,
ADD COLUMN     "icon_filled" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "specialist_postulations" ADD COLUMN     "clinic_data" JSONB,
ADD COLUMN     "institution" VARCHAR,
ADD COLUMN     "resume_url" VARCHAR,
ADD COLUMN     "selected_areas" JSONB,
ADD COLUMN     "sessions_data" JSONB;

-- AlterTable
ALTER TABLE "specialist_profiles" ADD COLUMN     "institution" VARCHAR,
ADD COLUMN     "resume_url" VARCHAR,
ADD COLUMN     "selected_areas" JSONB;

-- CreateTable
CREATE TABLE "specialist_areas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "slug" VARCHAR NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_suggestions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID,
    "category_id" UUID,
    "type" "suggestion_type" NOT NULL DEFAULT 'USER_INTEREST',
    "name" VARCHAR NOT NULL,
    "status" "suggestion_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_courses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "type" VARCHAR,
    "description" TEXT NOT NULL,
    "modality" VARCHAR,
    "url" VARCHAR,
    "cover_url" VARCHAR,
    "institution" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_spaces" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "space_type" VARCHAR,
    "name" VARCHAR NOT NULL,
    "address" VARCHAR,
    "city" VARCHAR,
    "country" VARCHAR,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "google_place_id" VARCHAR,
    "google_maps_url" VARCHAR,
    "phone" VARCHAR,
    "website" VARCHAR,
    "cover_url" VARCHAR,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "specialist_availability" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "space_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" VARCHAR NOT NULL,
    "end_time" VARCHAR NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "specialist_availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialist_areas_slug_key" ON "specialist_areas"("slug");

-- CreateIndex
CREATE INDEX "specialist_courses_user_id_idx" ON "specialist_courses"("user_id");

-- CreateIndex
CREATE INDEX "specialist_spaces_user_id_idx" ON "specialist_spaces"("user_id");

-- CreateIndex
CREATE INDEX "specialist_spaces_city_idx" ON "specialist_spaces"("city");

-- CreateIndex
CREATE INDEX "specialist_availability_space_id_idx" ON "specialist_availability"("space_id");

-- AddForeignKey
ALTER TABLE "specialist_areas" ADD CONSTRAINT "specialist_areas_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "interest_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_suggestions" ADD CONSTRAINT "category_suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_suggestions" ADD CONSTRAINT "category_suggestions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "interest_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_courses" ADD CONSTRAINT "specialist_courses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "specialist_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_spaces" ADD CONSTRAINT "specialist_spaces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "specialist_profiles"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "specialist_availability" ADD CONSTRAINT "specialist_availability_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "specialist_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
