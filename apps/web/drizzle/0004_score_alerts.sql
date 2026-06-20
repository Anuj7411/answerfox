-- Phase 4b: per-site score-drop alerts. Idempotent.

ALTER TABLE "public"."sites"
  ADD COLUMN IF NOT EXISTS "alert_threshold" integer
    CHECK ("alert_threshold" IS NULL OR ("alert_threshold" >= 0 AND "alert_threshold" <= 100));
