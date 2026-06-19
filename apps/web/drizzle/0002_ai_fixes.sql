-- Phase 3h: AI fix generation.
-- Idempotent: safe to re-apply against a partially-migrated environment.

DO $$ BEGIN
  CREATE TYPE "ai_fix_status" AS ENUM ('pending', 'succeeded', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "public"."ai_fixes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "public"."profiles"("id") ON DELETE CASCADE,
  "finding_id" uuid NOT NULL REFERENCES "public"."findings"("id") ON DELETE CASCADE,
  "status" "ai_fix_status" NOT NULL DEFAULT 'pending',
  "model" text NOT NULL,
  "prompt_tokens" integer,
  "output_tokens" integer,
  "output" text,
  "error_message" text,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "ai_fixes_user_id_idx" ON "public"."ai_fixes" ("user_id");
CREATE INDEX IF NOT EXISTS "ai_fixes_finding_id_idx" ON "public"."ai_fixes" ("finding_id");
CREATE INDEX IF NOT EXISTS "ai_fixes_user_created_at_idx" ON "public"."ai_fixes" ("user_id", "created_at");

ALTER TABLE "public"."ai_fixes" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ai_fixes select own"
    ON "public"."ai_fixes" FOR SELECT
    USING ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "ai_fixes insert own"
    ON "public"."ai_fixes" FOR INSERT
    WITH CHECK ("user_id" = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
