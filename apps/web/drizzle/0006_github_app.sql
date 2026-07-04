-- GitHub App installations + granted repositories (relaunch week 1).
-- Soft deletes everywhere: uninstall/removal sets a timestamp, never drops rows.

CREATE TABLE IF NOT EXISTS "github_installations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "installation_id" bigint NOT NULL,
  "account_login" text NOT NULL,
  "account_id" bigint NOT NULL,
  "account_type" text NOT NULL,
  "repository_selection" text DEFAULT 'selected' NOT NULL,
  "suspended_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "deleted_at" timestamp with time zone,
  CONSTRAINT "github_installations_installation_id_unique" UNIQUE ("installation_id")
);

CREATE INDEX IF NOT EXISTS "github_installations_account_login_idx"
  ON "github_installations" ("account_login");

CREATE TABLE IF NOT EXISTS "github_repositories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "installation_id" bigint NOT NULL,
  "repo_id" bigint NOT NULL,
  "full_name" text NOT NULL,
  "private" boolean DEFAULT false NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "removed_at" timestamp with time zone,
  CONSTRAINT "github_repositories_repo_id_unique" UNIQUE ("repo_id")
);

CREATE INDEX IF NOT EXISTS "github_repositories_installation_id_idx"
  ON "github_repositories" ("installation_id");
