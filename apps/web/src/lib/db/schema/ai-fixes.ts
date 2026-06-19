import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { findings } from './findings';
import { profiles } from './profiles';

/**
 * Lifecycle of an AI-generated fix.
 *
 * - `pending` — request submitted, Gemini call in flight
 * - `succeeded` — patch returned and stored
 * - `failed` — Gemini errored, quota hit, or output invalid. Stored
 *   anyway so the user knows we tried and so we can show the reason
 *   in the UI without losing the slot
 */
export const aiFixStatus = pgEnum('ai_fix_status', ['pending', 'succeeded', 'failed']);

/**
 * AI fix generations. One row per Gemini call against one finding.
 *
 * Quota math (Pro tier: 90 / month) counts rows where
 * `status = 'succeeded'` AND `createdAt >= start of the current
 * calendar month UTC`. Failed attempts don't count against quota —
 * we don't want users out of pocket for our errors.
 *
 * `output` is the raw Gemini text response. The dashboard parses
 * out the fenced code block on render; we store the raw output so
 * we can re-render with different formats later without re-billing
 * the user.
 */
export const aiFixes = pgTable(
  'ai_fixes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    findingId: uuid('finding_id')
      .notNull()
      .references(() => findings.id, { onDelete: 'cascade' }),
    status: aiFixStatus('status').notNull().default('pending'),
    model: text('model').notNull(),
    promptTokens: integer('prompt_tokens'),
    outputTokens: integer('output_tokens'),
    output: text('output'),
    errorMessage: text('error_message'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('ai_fixes_user_id_idx').on(table.userId),
    findingIdIdx: index('ai_fixes_finding_id_idx').on(table.findingId),
    userCreatedIdx: index('ai_fixes_user_created_at_idx').on(table.userId, table.createdAt),
  }),
);

export type AiFix = typeof aiFixes.$inferSelect;
export type NewAiFix = typeof aiFixes.$inferInsert;
