import { bigint, boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * A GitHub App installation. One row per installation of the AnswerFox
 * App on a user or org account. Rows are keyed by GitHub's own
 * installation id (bigint) because every webhook and every API call is
 * scoped to it — the per-installation Inngest queue keys on it too.
 *
 * Uninstalls set `deletedAt` instead of deleting the row: we keep the
 * history so a re-install of the same account is recognizable and so
 * billing questions ("when did they leave?") stay answerable.
 */
export const githubInstallations = pgTable(
  'github_installations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    installationId: bigint('installation_id', { mode: 'number' }).notNull().unique(),
    accountLogin: text('account_login').notNull(),
    accountId: bigint('account_id', { mode: 'number' }).notNull(),
    accountType: text('account_type').notNull(),
    repositorySelection: text('repository_selection').notNull().default('selected'),
    suspendedAt: timestamp('suspended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    accountLoginIdx: index('github_installations_account_login_idx').on(table.accountLogin),
  }),
);

/**
 * Repositories an installation grants access to. Populated from the
 * `installation.created` and `installation_repositories.*` webhooks.
 * Removal sets `removedAt` (same soft-delete reasoning as above).
 *
 * `repoId` is GitHub's immutable repository id; `fullName` can change
 * on rename, so the webhook handler always refreshes it on upsert.
 */
export const githubRepositories = pgTable(
  'github_repositories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    installationId: bigint('installation_id', { mode: 'number' }).notNull(),
    repoId: bigint('repo_id', { mode: 'number' }).notNull().unique(),
    fullName: text('full_name').notNull(),
    private: boolean('private').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    removedAt: timestamp('removed_at', { withTimezone: true }),
  },
  (table) => ({
    installationIdIdx: index('github_repositories_installation_id_idx').on(table.installationId),
  }),
);

export type GithubInstallation = typeof githubInstallations.$inferSelect;
export type NewGithubInstallation = typeof githubInstallations.$inferInsert;
export type GithubRepository = typeof githubRepositories.$inferSelect;
export type NewGithubRepository = typeof githubRepositories.$inferInsert;
