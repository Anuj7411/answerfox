-- Phase 5a: Agent-preference analytics — record visits from AI agents
-- forwarded by the user's own server. Idempotent.

DO $$ BEGIN
  CREATE TYPE "agent_label" AS ENUM (
    'chatgpt',
    'perplexity',
    'gemini',
    'claude',
    'other-bot',
    'human'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "public"."agent_visits" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "site_id" uuid NOT NULL REFERENCES "public"."sites"("id") ON DELETE CASCADE,
  "label" "agent_label" NOT NULL,
  "user_agent" text NOT NULL,
  "referrer" text,
  "path" text,
  "recorded_at" timestamptz NOT NULL DEFAULT now()
);

-- "Last 7 days for this site, grouped by label" is the dashboard query.
CREATE INDEX IF NOT EXISTS "agent_visits_site_recorded_idx"
  ON "public"."agent_visits" ("site_id", "recorded_at" DESC);

-- Each site exposes one shared-secret ingest token to its own server.
-- Nullable: tokens are minted lazily on first request to keep the
-- migration cheap on existing rows.
ALTER TABLE "public"."sites"
  ADD COLUMN IF NOT EXISTS "ingest_token" text;
