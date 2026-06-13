-- Migration: add site-verification columns to public.sites
-- Generated for phase 3c (F14 Site Verification) of the v0.6 launch sprint.
-- Safe to apply against existing rows; defaults backfill the new flag.

DO $$ BEGIN
  CREATE TYPE "verification_status" AS ENUM ('unverified', 'pending', 'verified', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "verification_method" AS ENUM ('meta', 'file', 'dns');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "public"."sites"
  ADD COLUMN IF NOT EXISTS "verification_token" text,
  ADD COLUMN IF NOT EXISTS "verification_status_value" "verification_status" NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS "verification_initiated_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "verified_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "verification_method_value" "verification_method";

-- RLS already covers the table — these new columns inherit the existing
-- policies (owner can read/write, service role bypasses, anon blocked).
