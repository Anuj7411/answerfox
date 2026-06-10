-- Answerfox initial schema. v0.4.x.
--
-- Generated alongside the Drizzle schema definitions in
-- `src/lib/db/schema/`. Run via `pnpm drizzle-kit migrate` after
-- pointing DATABASE_URL + DIRECT_URL at a Supabase project.
--
-- This migration is hand-written rather than `drizzle-kit generate`d
-- so we can include the Supabase-specific bits (RLS, auth.users
-- trigger) the Drizzle generator doesn't emit.

-- ============================================================
-- Enums
-- ============================================================

CREATE TYPE score_band AS ENUM ('critical', 'weak', 'average', 'strong', 'excellent');
CREATE TYPE finding_status AS ENUM ('pass', 'fail', 'warn', 'skip');
CREATE TYPE finding_severity AS ENUM ('critical', 'high', 'medium', 'low');

-- ============================================================
-- profiles
-- ============================================================

CREATE TABLE profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email        text NOT NULL UNIQUE,
  name         text,
  avatar_url   text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Create a profile row on first sign-in. Fires for every auth.users insert.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- sites
-- ============================================================

CREATE TABLE sites (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  url               text NOT NULL,
  name              text NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  last_audited_at   timestamptz
);

CREATE INDEX sites_user_id_idx ON sites(user_id);

-- ============================================================
-- audits
-- ============================================================

CREATE TABLE audits (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id                  uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  url                      text NOT NULL,
  fetched_at               timestamptz NOT NULL,
  score                    integer NOT NULL,
  band                     score_band NOT NULL,
  pass_count               integer NOT NULL,
  fail_count               integer NOT NULL,
  warn_count               integer NOT NULL,
  skip_count               integer NOT NULL,
  gate_page_detected       boolean NOT NULL DEFAULT false,
  agent_readiness_score    integer NOT NULL DEFAULT 0,
  raw_report               jsonb NOT NULL,
  created_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audits_site_latest_idx ON audits(site_id, fetched_at DESC);

-- ============================================================
-- findings
-- ============================================================

CREATE TABLE findings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id             uuid NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  check_id             text NOT NULL,
  category             text NOT NULL,
  severity             finding_severity NOT NULL,
  status               finding_status NOT NULL,
  evidence             text,
  fix_recommendation   text,
  created_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX findings_audit_id_idx ON findings(audit_id);
CREATE INDEX findings_status_category_idx ON findings(status, category);

-- ============================================================
-- Row Level Security
-- ============================================================
--
-- Every table is owner-scoped: a user sees only their own rows.
-- Supabase exposes auth.uid() returning the authenticated user's
-- profile id (matches profiles.id).

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits   ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings ENABLE ROW LEVEL SECURITY;

-- profiles: user sees and updates their own row.
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- sites: user manages their own sites only.
CREATE POLICY "sites_select_own" ON sites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sites_insert_own" ON sites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sites_update_own" ON sites
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sites_delete_own" ON sites
  FOR DELETE USING (auth.uid() = user_id);

-- audits: user sees audits for sites they own.
CREATE POLICY "audits_select_own" ON audits
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = audits.site_id AND sites.user_id = auth.uid())
  );
CREATE POLICY "audits_insert_own" ON audits
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = audits.site_id AND sites.user_id = auth.uid())
  );

-- findings: user sees findings for audits on sites they own.
CREATE POLICY "findings_select_own" ON findings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM audits
      JOIN sites ON sites.id = audits.site_id
      WHERE audits.id = findings.audit_id AND sites.user_id = auth.uid()
    )
  );
CREATE POLICY "findings_insert_own" ON findings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM audits
      JOIN sites ON sites.id = audits.site_id
      WHERE audits.id = findings.audit_id AND sites.user_id = auth.uid()
    )
  );

-- ============================================================
-- Service role bypass
-- ============================================================
--
-- The Answerfox Edge Function that runs scheduled audits uses the
-- service role key (NOT a user JWT) so it bypasses RLS. This is
-- enforced by Supabase, not by this migration. No explicit grant
-- needed here.
