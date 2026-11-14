-- CreateEnum
CREATE TYPE "intro_session_status" AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- CreateTable
CREATE TABLE "intro_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "requester_id" UUID NOT NULL,
    "specialist_id" UUID NOT NULL,
    "scheduled_date" VARCHAR NOT NULL,
    "start_time" VARCHAR NOT NULL,
    "end_time" VARCHAR NOT NULL,
    "timezone" VARCHAR NOT NULL DEFAULT 'America/Montevideo',
    "status" "intro_session_status" NOT NULL DEFAULT 'pending',
    "requester_note" TEXT,
    "meeting_link" VARCHAR,
    "specialist_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "intro_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "intro_sessions_specialist_id_scheduled_date_status_idx" ON "intro_sessions"("specialist_id", "scheduled_date", "status");

-- CreateIndex
CREATE INDEX "intro_sessions_requester_id_status_idx" ON "intro_sessions"("requester_id", "status");

-- AddForeignKey
ALTER TABLE "intro_sessions" ADD CONSTRAINT "intro_sessions_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intro_sessions" ADD CONSTRAINT "intro_sessions_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
