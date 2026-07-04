-- Repo<->site linking (relaunch, Proof-of-Fix / Drift Guard un-nulling).
-- Nullable: existing sites (free one-shot audits) have no repo linked yet.

ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "repo_full_name" text;
ALTER TABLE "sites" ADD COLUMN IF NOT EXISTS "installation_id" bigint;

CREATE INDEX IF NOT EXISTS "sites_repo_full_name_idx" ON "sites" ("repo_full_name");
