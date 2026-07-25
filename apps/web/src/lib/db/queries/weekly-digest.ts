import 'server-only';
import { getDb } from '@/lib/db/client';
import { aiFixes } from '@/lib/db/schema/ai-fixes';
import { audits } from '@/lib/db/schema/audits';
import { profiles } from '@/lib/db/schema/profiles';
import { sites } from '@/lib/db/schema/sites';
import type { DigestSiteLine, WeeklyDigestData } from '@/lib/email/digest-format';
import { and, count, desc, eq, gte, lt } from 'drizzle-orm';

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Read a single user's opt-in flag. Used by the settings page to render
 * the Notifications toggle without pulling the whole digest.
 */
export async function getWeeklyDigestOptIn(userId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ optIn: profiles.weeklyDigestOptIn })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  // Default matches the column default: absent profile is treated as opted in.
  return row?.optIn ?? true;
}

/**
 * Build the weekly digest payload for every opted-in user.
 *
 * The window is the 7 days ending at `now`. For each user we gather:
 * - every site with at least one audit (latest score + band),
 * - the score from the last audit BEFORE the window opened (for the
 *   week-over-week delta; null when the site was first audited inside
 *   the window),
 * - the count of succeeded AI fixes they generated during the window.
 *
 * Runs weekly against a small user set, so per-site lookups via
 * Promise.all are fine here — we favour readability over a single
 * window-function mega-query. The cron route filters the result with
 * `hasDigestContent` so users with no audited sites get no email.
 */
export async function listWeeklyDigests(now: Date, appUrl: string): Promise<WeeklyDigestData[]> {
  const db = getDb();
  const windowStart = new Date(now.getTime() - WINDOW_MS);

  const optedIn = await db
    .select({ id: profiles.id, email: profiles.email, name: profiles.name })
    .from(profiles)
    .where(eq(profiles.weeklyDigestOptIn, true));

  const digests = await Promise.all(
    optedIn.map(async (user): Promise<WeeklyDigestData> => {
      const userSites = await db
        .select({ id: sites.id, name: sites.name, url: sites.url })
        .from(sites)
        .where(eq(sites.userId, user.id));

      const siteLines = await Promise.all(
        userSites.map((site) => buildSiteLine(site, windowStart)),
      );

      const [fixRow] = await db
        .select({ n: count() })
        .from(aiFixes)
        .where(
          and(
            eq(aiFixes.userId, user.id),
            eq(aiFixes.status, 'succeeded'),
            gte(aiFixes.createdAt, windowStart),
          ),
        );

      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        sites: siteLines.filter((line): line is DigestSiteLine => line !== null),
        fixesGenerated: fixRow?.n ?? 0,
        windowStart,
        windowEnd: now,
        appUrl,
      };
    }),
  );

  return digests;
}

async function buildSiteLine(
  site: { id: string; name: string; url: string },
  windowStart: Date,
): Promise<DigestSiteLine | null> {
  const db = getDb();

  const [latest] = await db
    .select({ score: audits.score, band: audits.band })
    .from(audits)
    .where(eq(audits.siteId, site.id))
    .orderBy(desc(audits.fetchedAt))
    .limit(1);

  // Skip sites that have never been audited — nothing to report.
  if (latest === undefined) return null;

  const [baseline] = await db
    .select({ score: audits.score })
    .from(audits)
    .where(and(eq(audits.siteId, site.id), lt(audits.fetchedAt, windowStart)))
    .orderBy(desc(audits.fetchedAt))
    .limit(1);

  return {
    siteId: site.id,
    name: site.name,
    url: site.url,
    currentScore: latest.score,
    band: latest.band,
    previousScore: baseline?.score ?? null,
  };
}
