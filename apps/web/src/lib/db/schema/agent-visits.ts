import { sites } from '@/lib/db/schema/sites';
import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Coarse classification of a request's origin. Captures the four AI
 * surfaces we actually care about today plus two catch-alls.
 */
export const agentLabel = pgEnum('agent_label', [
  'chatgpt',
  'perplexity',
  'gemini',
  'claude',
  'other-bot',
  'human',
]);

/**
 * A single recorded visit. Written by the user's own server-side
 * middleware forwarding incoming UA + referrer to /api/track/visit.
 * One row per request — aggregation happens at read time over the
 * (site_id, recorded_at) index.
 */
export const agentVisits = pgTable(
  'agent_visits',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    siteId: uuid('site_id')
      .notNull()
      .references(() => sites.id, { onDelete: 'cascade' }),
    label: agentLabel('label').notNull(),
    userAgent: text('user_agent').notNull(),
    referrer: text('referrer'),
    path: text('path'),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    siteRecordedIdx: index('agent_visits_site_recorded_idx').on(table.siteId, table.recordedAt),
  }),
);

export type AgentVisit = typeof agentVisits.$inferSelect;
export type NewAgentVisit = typeof agentVisits.$inferInsert;
