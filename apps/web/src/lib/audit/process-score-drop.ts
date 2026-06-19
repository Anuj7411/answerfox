import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { profiles } from '@/lib/db/schema/profiles';
import { sites } from '@/lib/db/schema/sites';
import { sendScoreDropAlert } from '@/lib/email/send-alert';
import { and, desc, eq, ne } from 'drizzle-orm';
import { shouldFireScoreDropAlert } from './should-alert';

interface ProcessArgs {
  readonly siteId: string;
  readonly currentAuditId: string;
  readonly currentScore: number;
  readonly siteDetailUrl: string;
}

/**
 * Post-audit hook that fires a score-drop alert when the latest run
 * crossed below the site's threshold. Designed to be invoked from BOTH
 * `runAuditAction` (manual) and the cron sweeper (automated).
 *
 * Looks up the previous audit's score and the site's threshold + owner
 * email in a single round-trip pair, applies `shouldFireScoreDropAlert`,
 * and dispatches via the email sender (Resend or console fallback).
 *
 * Never throws — wraps the whole flow in a try/catch and logs any
 * unexpected error. The caller's audit transaction is already committed,
 * and we don't want a dead Resend account or a bad email address to
 * fail the audit retroactively.
 */
export async function processScoreDropAlert(args: ProcessArgs): Promise<void> {
  try {
    const db = getDb();

    const [siteRow] = await db
      .select({
        id: sites.id,
        name: sites.name,
        url: sites.url,
        alertThreshold: sites.alertThreshold,
        userEmail: profiles.email,
      })
      .from(sites)
      .leftJoin(profiles, eq(profiles.id, sites.userId))
      .where(eq(sites.id, args.siteId))
      .limit(1);

    if (siteRow === undefined) return;
    if (siteRow.alertThreshold === null) return;
    if (siteRow.userEmail === null || siteRow.userEmail.length === 0) return;

    const [previousAudit] = await db
      .select({ score: audits.score })
      .from(audits)
      .where(and(eq(audits.siteId, args.siteId), ne(audits.id, args.currentAuditId)))
      .orderBy(desc(audits.fetchedAt))
      .limit(1);

    const previousScore = previousAudit?.score ?? null;

    const fire = shouldFireScoreDropAlert({
      threshold: siteRow.alertThreshold,
      previousScore,
      currentScore: args.currentScore,
    });
    if (!fire) return;

    const result = await sendScoreDropAlert({
      toEmail: siteRow.userEmail,
      siteName: siteRow.name,
      siteUrl: siteRow.url,
      siteDetailUrl: args.siteDetailUrl,
      currentScore: args.currentScore,
      previousScore: previousScore ?? args.currentScore,
      threshold: siteRow.alertThreshold,
    });

    if (!result.ok) {
      console.error(`[score-drop-alert] send failed for site ${args.siteId}: ${result.reason}`);
    }
  } catch (err) {
    console.error('[score-drop-alert] unexpected error:', err);
  }
}
