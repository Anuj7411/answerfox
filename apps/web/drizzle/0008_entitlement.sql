-- Fix-PR entitlement (§3): first full loop free on a private repo,
-- $9/repo/mo after. Public repos are free forever (checked against
-- live GitHub visibility, not stored here).

DO $$ BEGIN
  CREATE TYPE "site_plan" AS ENUM ('free', 'paid');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "plan" "site_plan" NOT NULL DEFAULT 'free';
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "free_loop_consumed_at" timestamp with time zone;
