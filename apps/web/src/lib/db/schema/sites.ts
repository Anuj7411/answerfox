import {
  bigint,
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
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
 * Billing plan for the fix-PR loop on this site (§1: $9/repo/mo or
 * $90/yr). Set to 'paid' by the Dodo/Polar webhook once the payment
 * link's `state` param round-trips to this site's installation; every
 * new linked site starts 'free'.
 */
export const sitePlan = pgEnum('site_plan', ['free', 'paid']);

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
    ingestToken: text('ingest_token'),
    /**
     * The GitHub repo (e.g. "acme/docs") a fix-PR loop is wired to,
     * and the installation that grants access to it. Set during
     * onboarding once the customer picks which repo backs this site.
     * Proof-of-Fix and Drift Guard look sites up by `repoFullName` to
     * know what to re-audit and comment on after a webhook fires.
     * Nullable: a site can exist (free one-shot audits) before any
     * repo is linked.
     */
    repoFullName: text('repo_full_name'),
    installationId: bigint('installation_id', { mode: 'number' }),
    /**
     * §3 free tier: "the first fix is free, staying fixed is $9."
     * Public repos are free forever regardless of this column (that
     * check happens against the repo's live visibility, not here).
     * For a private repo, a site starts 'free' and gets exactly one
     * fix-PR before `freeLoopConsumedAt` blocks further ones — set the
     * moment that one PR opens, via an atomic UPDATE...WHERE NULL so a
     * burst of simultaneous findings can't all sneak through as free.
     */
    plan: sitePlan('plan').notNull().default('free'),
    freeLoopConsumedAt: timestamp('free_loop_consumed_at', { withTimezone: true }),
    /**
     * Opt-in to the public /leaderboard. Off by default; the owner flips
     * it from Site Settings (only for a verified site). When true, the
     * site's domain + latest score + band appear on the public board.
     * See migration 0014.
     */
    isPublic: boolean('is_public').notNull().default(false),
  },
  (table) => ({
    userIdIdx: index('sites_user_id_idx').on(table.userId),
    repoFullNameIdx: index('sites_repo_full_name_idx').on(table.repoFullName),
    isPublicIdx: index('sites_is_public_idx').on(table.isPublic),
  }),
);

export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
