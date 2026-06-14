import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { sites } from '@/lib/db/schema/sites';
import { desc, eq, sql } from 'drizzle-orm';

/**
 * Extract the bare hostname from a possibly-messy domain input
 * (URL, protocol-prefixed, with path, with port).
 *
 * Examples:
 *   "stripe.com"                          -> "stripe.com"
 *   "https://stripe.com/"                 -> "stripe.com"
 *   "https://www.sottogames.com/blog/foo" -> "www.sottogames.com"
 *   "Stripe.COM"                          -> "stripe.com"
 *
 * Returns null for inputs that don't yield a plausible hostname,
 * so the route handler can return the "no audit" badge cleanly
 * instead of crashing on bad input.
 */
export function parseDomainForBadge(input: string): string | null {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.length === 0) return null;

  let candidate = trimmed;
  // Strip protocol if present.
  candidate = candidate.replace(/^https?:\/\//, '');
  // Strip path/query/fragment.
  candidate = candidate.split('/')[0] ?? '';
  // Strip port.
  candidate = candidate.split(':')[0] ?? '';

  // Basic shape check: at least one dot, no spaces, ASCII range.
  if (!/^[a-z0-9.\-]+$/.test(candidate)) return null;
  if (!candidate.includes('.')) return null;
  return candidate;
}

export interface PublicAuditSummary {
  readonly url: string;
  readonly score: number;
  readonly band: 'critical' | 'weak' | 'average' | 'strong' | 'excellent';
  readonly passCount: number;
  readonly failCount: number;
  readonly warnCount: number;
  readonly skipCount: number;
  readonly agentReadinessScore: number;
  readonly fetchedAt: Date;
}

/**
 * Latest audit row for a given hostname, across all users. Used by
 * the public badge endpoint at `/badge/[domain]` and the public site
 * landing at `/site/[domain]`.
 *
 * No authorisation filter — anyone can read the latest score for a
 * public site (it's how the badge can be embedded by anyone). This
 * is consistent with how shields.io and similar services expose
 * project metadata.
 *
 * We match on the hostname extracted from `sites.url` via a substring
 * expression. If multiple users have audited the same domain, the
 * most recent audit wins.
 */
export async function getLatestAuditForDomain(domain: string): Promise<PublicAuditSummary | null> {
  const hostname = parseDomainForBadge(domain);
  if (hostname === null) return null;

  // Extract hostname from sites.url for matching. split_part lops off
  // the protocol, then again to drop everything after the first slash.
  const siteHostExpr = sql<string>`lower(split_part(split_part(${sites.url}, '://', 2), '/', 1))`;

  const rows = await getDb()
    .select({
      url: sites.url,
      score: audits.score,
      band: audits.band,
      passCount: audits.passCount,
      failCount: audits.failCount,
      warnCount: audits.warnCount,
      skipCount: audits.skipCount,
      agentReadinessScore: audits.agentReadinessScore,
      fetchedAt: audits.fetchedAt,
    })
    .from(audits)
    .innerJoin(sites, eq(audits.siteId, sites.id))
    .where(eq(siteHostExpr, hostname))
    .orderBy(desc(audits.fetchedAt))
    .limit(1);

  return rows[0] ?? null;
}
