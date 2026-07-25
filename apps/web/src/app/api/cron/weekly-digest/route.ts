import { listWeeklyDigests } from '@/lib/db/queries/weekly-digest';
import { hasDigestContent } from '@/lib/email/digest-format';
import { sendWeeklyDigest } from '@/lib/email/send-digest';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Weekly readiness digest sweeper.
 *
 * Auth: same contract as `/api/cron/audit-sweep`. Requires `CRON_SECRET`
 * to be set and passed as a `Bearer` token (Vercel Cron sends this
 * header automatically for the entry in vercel.json). If the secret is
 * unset we refuse all traffic — an unconfigured deploy is misconfigured,
 * not wide open.
 *
 * Cadence: Mondays 13:00 UTC (see vercel.json). Builds a per-user
 * rollup of every audited site's current score + week-over-week delta,
 * skips users with no audited sites, and sends each remaining digest
 * via Resend (or the console fallback in dev).
 *
 * Resilience: each user is sent independently with Promise.allSettled;
 * one bad address or Resend hiccup does not abort the sweep.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret === undefined || secret.length === 0) {
    return NextResponse.json({ error: 'Digest sweeper not configured.' }, { status: 503 });
  }
  const header = request.headers.get('authorization') ?? '';
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const startedAt = new Date();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const digests = (await listWeeklyDigests(startedAt, appUrl)).filter(hasDigestContent);

  const results = await Promise.allSettled(
    digests.map(async (digest) => {
      const sent = await sendWeeklyDigest(digest);
      if (!sent.ok) {
        throw new Error(sent.reason);
      }
      return { userId: digest.userId, backend: sent.backend };
    }),
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results
    .map((r, i) => ({ r, digest: digests[i] }))
    .filter(({ r }) => r.status === 'rejected')
    .map(({ r, digest }) => ({
      userId: digest?.userId,
      reason: r.status === 'rejected' ? String(r.reason) : 'unknown',
    }));

  return NextResponse.json({
    sweptAt: startedAt.toISOString(),
    eligible: digests.length,
    sent,
    failed,
  });
}
