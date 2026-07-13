import { sites } from '@/lib/db/schema/sites';
import { index, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * A stored Agent Answer Simulation result for a site. One row per run,
 * so answerability becomes a trend over time instead of a one-shot
 * number. That trend is the thing no competitor tracks (Pillar and the
 * free scanners report a single moment). History reads run over the
 * (site_id, created_at) index.
 *
 * `report` keeps the full JSON (per-question verdicts + gaps) so the UI
 * can show what changed between runs without a second table.
 */
export const agentAnswerReports = pgTable(
  'agent_answer_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    answerabilityScore: integer('answerability_score').notNull(),
    gapCount: integer('gap_count').notNull(),
    questionCount: integer('question_count').notNull(),
    report: jsonb('report').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    siteCreatedIdx: index('agent_answer_reports_site_created_idx').on(
      table.siteId,
      table.createdAt,
    ),
  }),
);

export type AgentAnswerReportRow = typeof agentAnswerReports.$inferSelect;
export type NewAgentAnswerReportRow = typeof agentAnswerReports.$inferInsert;
