-- Phase 4a: per-site audit schedule.
-- Idempotent: safe to re-apply against a partially-migrated environment.

DO $$ BEGIN
  CREATE TYPE "audit_schedule" AS ENUM ('off', 'daily', 'weekly');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "public"."sites"
  ADD COLUMN IF NOT EXISTS "audit_schedule" "audit_schedule" NOT NULL DEFAULT 'off',
  ADD COLUMN IF NOT EXISTS "next_scheduled_audit_at" timestamptz;

-- Index to power the cron query: "give me every site due for audit right now".
CREATE INDEX IF NOT EXISTS "sites_due_audit_idx"
  ON "public"."sites" ("next_scheduled_audit_at")
  WHERE "audit_schedule" <> 'off' AND "next_scheduled_audit_at" IS NOT NULL;
