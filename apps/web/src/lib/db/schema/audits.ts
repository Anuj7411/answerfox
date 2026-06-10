import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { sites } from './sites.js';

/**
 * The five score bands defined in AUDIT-FRAMEWORK.md, persisted
 * alongside the score itself so dashboard chips don't need to
 * recompute on every render.
 */
export const scoreBand = pgEnum('score_band', [
  'critical',
  'weak',
  'average',
  'strong',
  'excellent',
]);

/**
 * A single audit run for one URL. One site → many audits over time.
 * Diff view = `audit.findings` of run N compared to run N-1.
 *
 * `rawReport` stores the full `AuditReport` JSON (including the
 * gatePage detection and per-check evidence) so the dashboard can
 * deep-link into any historical run without joining `findings`.
 * The `findings` table is for queryable subsets ("show me every
 * failing G check across all my sites this month").
 *
 * `agentReadinessScore` is a count of G category checks passing
 * (0 through 6). Pulled out of the report for fast trend queries
 * before it's officially in the 0-100 score band.
 */
export const audits = pgTable(
  'audits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull(),
    score: integer('score').notNull(),
    band: scoreBand('band').notNull(),
    passCount: integer('pass_count').notNull(),
    failCount: integer('fail_count').notNull(),
    warnCount: integer('warn_count').notNull(),
    skipCount: integer('skip_count').notNull(),
    gatePageDetected: boolean('gate_page_detected').notNull().default(false),
    agentReadinessScore: integer('agent_readiness_score').notNull().default(0),
    rawReport: jsonb('raw_report').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // "Latest audit for this site" is the most common dashboard query.
    siteLatestIdx: index('audits_site_latest_idx').on(table.siteId, table.fetchedAt),
  }),
);

export type Audit = typeof audits.$inferSelect;
export type NewAudit = typeof audits.$inferInsert;
