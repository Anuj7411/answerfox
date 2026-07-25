import { index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';
import { sites } from './sites';

/**
 * A private note the owner attaches to one check on one site.
 *
 * Keyed on (siteId, checkId), NOT on a findings row: findings are
 * recreated on every audit run, but `checkId` (A1, G4, ...) is stable,
 * so a note like "intentionally skipping this check" persists across
 * re-audits. One note per check per site (unique constraint) — the
 * mutation upserts, and clearing the text deletes the row.
 *
 * `userId` is the author (always the site owner today) and backs the
 * owner-scoped RLS policies. See migration 0013.
 */
export const annotations = pgTable(
  'annotations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    checkId: text('check_id').notNull(),
    body: text('body').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    siteIdx: index('annotations_site_id_idx').on(table.siteId),
    siteCheckUnique: unique('annotations_site_check_unique').on(table.siteId, table.checkId),
  }),
);

export type Annotation = typeof annotations.$inferSelect;
export type NewAnnotation = typeof annotations.$inferInsert;
