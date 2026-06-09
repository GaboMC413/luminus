DO $$ BEGIN
  CREATE TYPE "connection_status" AS ENUM ('pending', 'accepted', 'declined', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "user_connections" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requester_id" UUID NOT NULL,
  "recipient_id" UUID NOT NULL,
  "status" "connection_status" NOT NULL DEFAULT 'pending',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "user_connections_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_connections_requester_id_recipient_id_key" ON "user_connections"("requester_id", "recipient_id");
CREATE INDEX IF NOT EXISTS "user_connections_recipient_id_status_idx" ON "user_connections"("recipient_id", "status");
CREATE INDEX IF NOT EXISTS "user_connections_requester_id_status_idx" ON "user_connections"("requester_id", "status");

ALTER TABLE "user_connections"
ADD CONSTRAINT "user_connections_requester_id_fkey"
FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_connections"
ADD CONSTRAINT "user_connections_recipient_id_fkey"
FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "user_connections"
ADD CONSTRAINT "user_connections_no_self_connection"
CHECK ("requester_id" <> "recipient_id");
