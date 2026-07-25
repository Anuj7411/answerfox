-- Finding annotations: one private note per (site, check).
--
-- Keyed on (site_id, check_id) rather than a specific findings row so a
-- note survives re-audits — findings are recreated on every run, but the
-- checkId (A1, G4, ...) is stable, so "we're intentionally skipping this
-- check on this site" persists across audits. UNIQUE (site_id, check_id)
-- gives clean upsert-per-check semantics.
--
-- Idempotent: safe to re-apply against a partially-migrated environment.

CREATE TABLE IF NOT EXISTS "public"."annotations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "site_id" uuid NOT NULL REFERENCES "public"."sites"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "check_id" text NOT NULL,
  "body" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "annotations_site_check_unique" UNIQUE ("site_id", "check_id")
);

CREATE INDEX IF NOT EXISTS "annotations_site_id_idx" ON "public"."annotations" ("site_id");

ALTER TABLE "public"."annotations" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "annotations select own"
    ON "public"."annotations" FOR SELECT
    USING ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "annotations insert own"
    ON "public"."annotations" FOR INSERT
    WITH CHECK ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "annotations update own"
    ON "public"."annotations" FOR UPDATE
    USING ("user_id" = auth.uid())
    WITH CHECK ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "annotations delete own"
    ON "public"."annotations" FOR DELETE
    USING ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
