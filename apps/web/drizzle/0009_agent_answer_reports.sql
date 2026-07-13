-- Agent Answer Simulation results: one row per run, so answerability is
-- a trend over time rather than a one-shot number (the thing no other
-- tool tracks). Written via the service role in app code; the RLS below
-- denies anon/PostgREST access and scopes any user-client read to the
-- site's owner.
-- Idempotent: safe to re-apply against a partially-migrated environment.

CREATE TABLE IF NOT EXISTS "public"."agent_answer_reports" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "site_id" uuid NOT NULL REFERENCES "public"."sites"("id") ON DELETE CASCADE,
  "url" text NOT NULL,
  "answerability_score" integer NOT NULL,
  "gap_count" integer NOT NULL,
  "question_count" integer NOT NULL,
  "report" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "agent_answer_reports_site_created_idx"
  ON "public"."agent_answer_reports" ("site_id", "created_at");

ALTER TABLE "public"."agent_answer_reports" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "agent_answer_reports select own"
    ON "public"."agent_answer_reports" FOR SELECT
    USING ("site_id" IN (SELECT "id" FROM "public"."sites" WHERE "user_id" = auth.uid()));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
