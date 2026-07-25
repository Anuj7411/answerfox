import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { sites } from '@/lib/db/schema/sites';
import { type LeaderboardEntry, rankEntries, toDisplayDomain } from '@/lib/leaderboard/rank';
import { desc, eq } from 'drizzle-orm';

/**
 * Public leaderboard: sites the owner opted in (is_public = true) ranked
 * by their latest audit score. Returns only domain + score + band —
 * never the site name, owner, repo, or findings.
 *
 * Two steps for readability: the opted-in set is small and the page is
 * cached (revalidate), so per-site "latest audit" lookups via Promise.all
 * are fine here. Sites with no audit yet are skipped.
 */
export async function getPublicLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  const db = getDb();

  const publicSites = await db
    .select({ id: sites.id, url: sites.url })
    .from(sites)
    .where(eq(sites.isPublic, true));

  const rows = (
    await Promise.all(
      publicSites.map(async (site) => {
        const [latest] = await db
          .select({ score: audits.score, band: audits.band, fetchedAt: audits.fetchedAt })
          .from(audits)
          .where(eq(audits.siteId, site.id))
          .orderBy(desc(audits.fetchedAt))
          .limit(1);
        if (latest === undefined) return null;
        return {
          domain: toDisplayDomain(site.url),
          score: latest.score,
          band: latest.band,
          fetchedAtMs: latest.fetchedAt.getTime(),
        };
      }),
    )
  ).filter((r): r is NonNullable<typeof r> => r !== null);

  return rankEntries(rows, limit);
}
