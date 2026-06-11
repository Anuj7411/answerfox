import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

/**
 * A site (origin) owned by a user. One profile → many sites.
 *
 * `url` is the canonical absolute origin (e.g. `https://stripe.com`).
 * Audits may target subpaths of this origin, but the site row
 * itself is keyed to the origin level for analytics rollup.
 *
 * `lastAuditedAt` is denormalized for fast "list my sites with
 * their freshness" queries on the dashboard. Kept in sync by
 * the audit-runner Edge Function (or trigger, TBD in Day 5+).
 */
export const sites = pgTable(
  'sites',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    lastAuditedAt: timestamp('last_audited_at', { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index('sites_user_id_idx').on(table.userId),
  }),
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
