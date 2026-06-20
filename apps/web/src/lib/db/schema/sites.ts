import { index, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { profiles } from './profiles';

/**
 * Verification status lifecycle.
 *
 * -  — site row exists but the owner has not started the
 *   verification flow yet (default for legacy rows or freshly added
 *   sites that skipped the prompt).
 * -  — token has been issued and the user is mid-flow. The
 *   token is valid for 7 days from .
 * -  — at least one of the three methods (meta tag, file,
 *   DNS TXT) returned the matching token within the validity window.
 *    and  record which.
 * -  — most recent verification attempt did not find the token
 *   anywhere. User can re-initiate. Distinct from  so we can
 *   render a 'try again' affordance instead of a 'still waiting' one.
 */
export const verificationStatus = pgEnum('verification_status', [
  'unverified',
  'pending',
  'verified',
  'failed',
]);

/**
 * Which method succeeded when the site was verified.
 *
 * -  — <meta name='answerfox-verify' content='<token>'> in <head>.
 * -  — /.well-known/answerfox-verify returns plain text token.
 * -  — TXT record on origin with value answerfox-verify=<token>.
 *
 * Null until verification succeeds.
 */
export const verificationMethod = pgEnum('verification_method', ['meta', 'file', 'dns']);

/**
 * Site-level continuous-audit schedule.
 * - `off`: no scheduled audits, the user re-audits manually.
 * - `daily`: ~24h cadence. Cron sweeps every hour and triggers any site
 *   whose `next_scheduled_audit_at` is in the past.
 * - `weekly`: ~7d cadence, same sweep behaviour.
 */
export const auditSchedule = pgEnum('audit_schedule', ['off', 'daily', 'weekly']);

/**
 * A site (origin) owned by a user. One profile -> many sites.
 *
 * Verification (v0.6 / phase 3c, F14 in PRICING-LOCKED.md): audits
 * cannot run against a site until its owner has proven they control
 * the origin via one of three methods. The token, status, and
 * timestamps for that flow live here so we can render the UI and
 * gate audit-now on a single query.
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
    verificationToken: text('verification_token'),
    verificationStatusValue: verificationStatus('verification_status_value')
      .notNull()
      .default('unverified'),
    verificationInitiatedAt: timestamp('verification_initiated_at', { withTimezone: true }),
    verifiedAt: timestamp('verified_at', { withTimezone: true }),
    verificationMethodValue: verificationMethod('verification_method_value'),
    auditSchedule: auditSchedule('audit_schedule').notNull().default('off'),
    nextScheduledAuditAt: timestamp('next_scheduled_audit_at', { withTimezone: true }),
    alertThreshold: integer('alert_threshold'),
  },
  (table) => ({
    userIdIdx: index('sites_user_id_idx').on(table.userId),
  }),
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
