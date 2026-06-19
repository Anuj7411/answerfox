import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { and, eq, isNotNull, lte, ne } from 'drizzle-orm';

/**
 * Sites whose continuous-audit slot has elapsed. The cron sweeper
 * pulls this list, runs an audit per row, then advances each row's
 * `next_scheduled_audit_at` by its cadence.
 *
 * Skips:
 * - `audit_schedule = 'off'` (no cadence)
 * - rows without a `next_scheduled_audit_at` (shouldn't happen if the
 *   server action is the only writer, but defensive)
 * - rows whose slot is still in the future
 *
 * Returns only `verified` sites — we never run an audit against a
 * site whose ownership we haven't confirmed.
 */
export async function listSitesDueForAudit(now: Date = new Date()) {
  return getDb()
    .select({
      id: sites.id,
      userId: sites.userId,
      url: sites.url,
      name: sites.name,
      auditSchedule: sites.auditSchedule,
    })
    .from(sites)
    .where(
      and(
        ne(sites.auditSchedule, 'off'),
        eq(sites.verificationStatusValue, 'verified'),
        isNotNull(sites.nextScheduledAuditAt),
        lte(sites.nextScheduledAuditAt, now),
      ),
    );
}
