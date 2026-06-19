import { getDb } from '@/lib/db/client';
import { createAuditWithFindings } from '@/lib/db/mutations/audits';
import { listSitesDueForAudit } from '@/lib/db/queries/due-audits';
import { sites } from '@/lib/db/schema/sites';
import { audit } from '@answerfox/audit';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DAILY_MS = 24 * 60 * 60 * 1000;
const WEEKLY_MS = 7 * DAILY_MS;

/**
 * Sweeper for scheduled audits.
 *
 * Auth: requires the `CRON_SECRET` env var to be set, and the caller
 * must include it as a `Bearer` token. Vercel Cron passes this header
 * automatically when configured against `/api/cron/audit-sweep`. If
 * the secret is unset we refuse all traffic — a deploy without
 * `CRON_SECRET` is considered misconfigured, not "wide open."
 *
 * Cadence: meant to be invoked every hour. The sweeper picks up every
 * verified site whose `next_scheduled_audit_at` has passed, runs an
 * audit, persists it, then advances the slot by the cadence.
 *
 * Resilience: each site is audited independently. One failure does
 * not abort the sweep — the failed site stays in the "due" set and
 * will retry on the next sweep.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({ error: 'Sweeper not configured.' }, { status: 503 });
  }
  const header = request.headers.get('authorization') ?? '';
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const startedAt = new Date();
  const dueSites = await listSitesDueForAudit(startedAt);

  const results = await Promise.allSettled(
    dueSites.map(async (site) => {
      const report = await audit(site.url);
      await createAuditWithFindings({ siteId: site.id, report });
      const nextAt = advanceSchedule(site.auditSchedule, startedAt);
      await getDb()
        .update(sites)
        .set({ nextScheduledAuditAt: nextAt })
        .where(eq(sites.id, site.id));
      return { id: site.id, url: site.url };
    }),
  );

  const succeeded = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results
    .map((r, i) => ({ r, site: dueSites[i] }))
    .filter(({ r }) => r.status === 'rejected')
    .map(({ r, site }) => ({
      id: site?.id,
      url: site?.url,
      reason: r.status === 'rejected' ? String(r.reason) : 'unknown',
    }));

  return NextResponse.json({
    sweptAt: startedAt.toISOString(),
    considered: dueSites.length,
    succeeded,
    failed,
  });
}

function advanceSchedule(schedule: 'daily' | 'weekly' | 'off', from: Date): Date | null {
  if (schedule === 'off') return null;
  const ms = schedule === 'daily' ? DAILY_MS : WEEKLY_MS;
  return new Date(from.getTime() + ms);
}
