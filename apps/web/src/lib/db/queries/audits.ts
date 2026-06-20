import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { findings } from '@/lib/db/schema/findings';
import { sites } from '@/lib/db/schema/sites';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

/**
 * Latest audit row per site for a given user. One row per site
 * (or zero if the site has never been audited). Used to render
 * the audit chip on `/dashboard/sites`.
 *
 * Uses DISTINCT ON to grab the newest fetchedAt per siteId. Cheap
 * on the small site lists we expect per user (<100); revisit if
 * a single user ever crosses that.
 */
export async function listLatestAuditsForUser(userId: string) {
  const siteRows = await getDb()
    .select({ id: sites.id })
    .from(sites)
    .where(eq(sites.userId, userId));
  const siteIds = siteRows.map((s) => s.id);
  if (siteIds.length === 0) return [] as Array<typeof audits.$inferSelect>;

  return getDb()
    .selectDistinctOn([audits.siteId])
    .from(audits)
    .where(inArray(audits.siteId, siteIds))
    .orderBy(audits.siteId, desc(audits.fetchedAt));
}

/**
 * Fetch a single audit row by id, scoped to the user via the
 * parent site row. Returns `null` if the audit doesn't exist or
 * belongs to someone else. RLS would catch this too, but the
 * explicit filter keeps server-role callers honest.
 */
export async function getAuditForUser(auditId: string, userId: string) {
  const [row] = await getDb()
    .select({ audit: audits })
    .from(audits)
    .innerJoin(sites, eq(audits.siteId, sites.id))
    .where(and(eq(audits.id, auditId), eq(sites.userId, userId)));
  return row?.audit ?? null;
}

/**
 * All findings for one audit, ordered by severity (critical → low),
 * then by check id. The dashboard groups by severity for display
 * but sorting upstream makes the render code simpler.
 */
export async function listFindingsForAudit(auditId: string) {
  return getDb()
    .select()
    .from(findings)
    .where(eq(findings.auditId, auditId))
    .orderBy(
      sql`case ${findings.severity}
            when 'critical' then 0
            when 'high' then 1
            when 'medium' then 2
            when 'low' then 3
          end`,
      findings.checkId,
    );
}

/**
 * Latest audit row for one site (used by the site detail page).
 * Returns `null` if the site has never been audited.
 */
export async function getLatestAuditForSite(siteId: string) {
  const [row] = await getDb()
    .select()
    .from(audits)
    .where(eq(audits.siteId, siteId))
    .orderBy(desc(audits.fetchedAt))
    .limit(1);
  return row ?? null;
}

/**
 * Latest two audits for a site, newest first. Powers the diff view —
 * returns an empty array if the site has never been audited and a
 * one-element array after the very first run. Diffing only makes
 * sense when both elements are present.
 */
export async function getLastTwoAuditsForSite(siteId: string) {
  return getDb()
    .select()
    .from(audits)
    .where(eq(audits.siteId, siteId))
    .orderBy(desc(audits.fetchedAt))
    .limit(2);
}

/**
 * Last N audits for a site, newest first. Powers the home-page score
 * trend chart. Returns just the fields the chart needs to keep the
 * payload small — fetchedAt, score, agentReadinessScore.
 */
export async function getRecentAuditScoresForSite(siteId: string, limit = 7) {
  return getDb()
    .select({
      id: audits.id,
      fetchedAt: audits.fetchedAt,
      score: audits.score,
      agentReadinessScore: audits.agentReadinessScore,
    })
    .from(audits)
    .where(eq(audits.siteId, siteId))
    .orderBy(desc(audits.fetchedAt))
    .limit(limit);
}
