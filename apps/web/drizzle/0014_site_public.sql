-- Public leaderboard opt-in, one flag per site.
--
-- Off by default (opt-out of the public board is the safe default —
-- sites are private unless the owner explicitly lists them). The owner
-- flips it from Site Settings, and only for a verified site. The public
-- /leaderboard page ranks sites where is_public = true by their latest
-- audit score, showing domain + score + band only.
--
-- Idempotent: safe to re-apply against a partially-migrated environment.

ALTER TABLE "public"."sites"
  ADD COLUMN IF NOT EXISTS "is_public" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "sites_is_public_idx"
  ON "public"."sites" ("is_public");
