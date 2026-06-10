import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { audits } from './audits.js';

/**
 * Outcome status from the audit framework.
 */
export const findingStatus = pgEnum('finding_status', ['pass', 'fail', 'warn', 'skip']);

/**
 * Severity classification from the audit framework.
 */
export const findingSeverity = pgEnum('finding_severity', ['critical', 'high', 'medium', 'low']);

/**
 * One row per check executed during an audit run. Denormalizes a
 * subset of the per-check fields out of `audits.rawReport` so the
 * dashboard can run queries like "show me every G category fail
 * across all my sites in the last 30 days" without scanning JSONB.
 *
 * `checkId` is the stable framework ID (A1, B3, G4, ...). `category`
 * mirrors `Category` from @answerfox/core. We store as text rather
 * than enum because adding a new category (e.g. v0.5 adds H for
 * Agent Preference Analytics) shouldn't require a migration.
 */
export const findings = pgTable(
  'findings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    auditId: uuid('audit_id')
      .notNull()
      .references(() => audits.id, { onDelete: 'cascade' }),
    checkId: text('check_id').notNull(),
    category: text('category').notNull(),
    severity: findingSeverity('severity').notNull(),
    status: findingStatus('status').notNull(),
    evidence: text('evidence'),
    fixRecommendation: text('fix_recommendation'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    // "All findings for this audit" (dashboard detail view).
    auditIdx: index('findings_audit_id_idx').on(table.auditId),
    // "All fails of category X across audits" (trend rollups).
    statusCategoryIdx: index('findings_status_category_idx').on(table.status, table.category),
  }),
);

export type Finding = typeof findings.$inferSelect;
export type NewFinding = typeof findings.$inferInsert;
