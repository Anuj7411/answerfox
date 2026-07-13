-- Persisted public scan results, so a /scan/:id result is shareable (the
-- viral unit of the growth loop). Read via the service role in app code;
-- the RLS below denies anon/PostgREST, so enumerating scans through the
-- auto REST API is not possible.
-- Idempotent: safe to re-apply against a partially-migrated environment.

CREATE TABLE IF NOT EXISTS "public"."public_scans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "url" text NOT NULL,
  "answerability_score" integer NOT NULL,
  "gap_count" integer NOT NULL,
  "question_count" integer NOT NULL,
  "report" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "public_scans_created_idx"
  ON "public"."public_scans" ("created_at");

ALTER TABLE "public"."public_scans" ENABLE ROW LEVEL SECURITY;
