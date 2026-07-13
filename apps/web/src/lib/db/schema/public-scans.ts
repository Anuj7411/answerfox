import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * A persisted result from the free, no-login scanner, so a scan is
 * shareable at /scan/:id (the viral unit of the growth loop). No user
 * link: a public scan belongs to whoever ran it, and the shareable page
 * reads it via the service role. RLS denies anon/PostgREST directly.
 */
export const publicScans = pgTable(
  'public_scans',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    url: text('url').notNull(),
    answerabilityScore: integer('answerability_score').notNull(),
    gapCount: integer('gap_count').notNull(),
    questionCount: integer('question_count').notNull(),
    report: jsonb('report').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    createdIdx: index('public_scans_created_idx').on(table.createdAt),
  }),
);

export type PublicScanRow = typeof publicScans.$inferSelect;
export type NewPublicScanRow = typeof publicScans.$inferInsert;
