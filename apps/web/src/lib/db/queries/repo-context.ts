import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { sites } from '@/lib/db/schema/sites';
import { desc, eq } from 'drizzle-orm';

export interface RepoAuditContext {
  readonly siteUrl: string;
  readonly beforeScore: number;
  readonly priorFailedCheckIds: readonly string[];
}

interface RawCheckResult {
  id?: unknown;
  status?: unknown;
}

/**
 * Look up the site linked to a repo, and the failing-check ids from
 * its most recent audit. Backs `resolveRepoContext` for Proof-of-Fix
 * and Drift Guard — both need "what to re-audit" and "what was
 * already broken before this webhook fired."
 *
 * Returns null when no site is linked to the repo, or the linked site
 * has never been audited (nothing to diff against yet).
 */
export async function getRepoAuditContext(repoFullName: string): Promise<RepoAuditContext | null> {
  const [site] = await getDb()
    .select({ id: sites.id, url: sites.url })
    .from(sites)
    .where(eq(sites.repoFullName, repoFullName))
    .limit(1);
  if (site === undefined) return null;

  const [latest] = await getDb()
    .select({ score: audits.score, rawReport: audits.rawReport })
    .from(audits)
    .where(eq(audits.siteId, site.id))
    .orderBy(desc(audits.fetchedAt))
    .limit(1);
  if (latest === undefined) return null;

  const report = latest.rawReport as { results?: RawCheckResult[] } | null;
  const priorFailedCheckIds = (report?.results ?? [])
    .filter((r) => r.status === 'fail' && typeof r.id === 'string')
    .map((r) => r.id as string);

  return { siteUrl: site.url, beforeScore: latest.score, priorFailedCheckIds };
}
