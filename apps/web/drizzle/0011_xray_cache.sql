-- X-Ray render cache, keyed by URL: the content hash of the crawler-view
-- HTML plus the comparison it produced, so a repeat X-Ray of an unchanged
-- page skips the metered browser render (stays inside the free Browser
-- Rendering allowance). Read/written via the service role; RLS denies
-- anon/PostgREST.
-- Idempotent: safe to re-apply against a partially-migrated environment.

CREATE TABLE IF NOT EXISTS "public"."xray_cache" (
  "url" text PRIMARY KEY,
  "hash" text NOT NULL,
  "comparison" jsonb NOT NULL,
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "public"."xray_cache" ENABLE ROW LEVEL SECURITY;
