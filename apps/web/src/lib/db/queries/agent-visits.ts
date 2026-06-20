import 'server-only';
import type { AgentLabel } from '@/lib/analytics/classify-agent';
import { getDb } from '@/lib/db/client';
import { agentVisits } from '@/lib/db/schema/agent-visits';
import { sites } from '@/lib/db/schema/sites';
import { and, desc, eq, gte, sql } from 'drizzle-orm';

export interface AgentTrafficBucket {
  readonly label: AgentLabel;
  readonly count: number;
}

export interface AgentTrafficSummary {
  readonly total: number;
  readonly buckets: ReadonlyArray<AgentTrafficBucket>;
  readonly windowDays: number;
  readonly siteId: string;
}

const ZERO_LABELS: ReadonlyArray<AgentLabel> = [
  'chatgpt',
  'perplexity',
  'gemini',
  'claude',
  'other-bot',
  'human',
];

/**
 * Counts of agent visits for a site over the trailing N days, grouped
 * by label. Always returns every label (zero-filled) so the UI can
 * render a stable bucket order regardless of which engines actually
 * sent traffic.
 *
 * Uses the (site_id, recorded_at DESC) index from migration 0005.
 */
export async function getAgentTrafficSummary(
  siteId: string,
  windowDays = 7,
  now: Date = new Date(),
): Promise<AgentTrafficSummary> {
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const rows = await getDb()
    .select({
      label: agentVisits.label,
      count: sql<number>`count(*)::int`,
    })
    .from(agentVisits)
    .where(and(eq(agentVisits.siteId, siteId), gte(agentVisits.recordedAt, since)))
    .groupBy(agentVisits.label);

  const byLabel = new Map<AgentLabel, number>(ZERO_LABELS.map((l) => [l, 0]));
  for (const row of rows) {
    byLabel.set(row.label, row.count);
  }

  const buckets = ZERO_LABELS.map((label) => ({ label, count: byLabel.get(label) ?? 0 }));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return { total, buckets, windowDays, siteId };
}

export interface UserAgentTrafficSummary {
  readonly total: number;
  readonly buckets: ReadonlyArray<AgentTrafficBucket>;
  readonly windowDays: number;
  readonly integratedSiteCount: number;
  readonly totalSiteCount: number;
}

/**
 * Cross-site rollup of agent visits for every site owned by a user.
 *
 * Same zero-fill bucket order as the per-site variant so the dashboard
 * can render both tiles with a consistent legend. Also returns
 * `integratedSiteCount` (sites with an ingest token minted) and
 * `totalSiteCount` so the home page can show the right empty state
 * ("0 of 3 sites integrated" beats a bare empty card).
 */
export async function getAgentTrafficSummaryForUser(
  userId: string,
  windowDays = 7,
  now: Date = new Date(),
): Promise<UserAgentTrafficSummary> {
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const db = getDb();

  const [trafficRows, siteRows] = await Promise.all([
    db
      .select({
        label: agentVisits.label,
        count: sql<number>`count(*)::int`,
      })
      .from(agentVisits)
      .innerJoin(sites, eq(sites.id, agentVisits.siteId))
      .where(and(eq(sites.userId, userId), gte(agentVisits.recordedAt, since)))
      .groupBy(agentVisits.label),
    db
      .select({
        id: sites.id,
        ingestToken: sites.ingestToken,
      })
      .from(sites)
      .where(eq(sites.userId, userId)),
  ]);

  const byLabel = new Map<AgentLabel, number>(ZERO_LABELS.map((l) => [l, 0]));
  for (const row of trafficRows) {
    byLabel.set(row.label, row.count);
  }

  const buckets = ZERO_LABELS.map((label) => ({ label, count: byLabel.get(label) ?? 0 }));
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const integratedSiteCount = siteRows.filter((s) => s.ingestToken !== null).length;

  return {
    total,
    buckets,
    windowDays,
    integratedSiteCount,
    totalSiteCount: siteRows.length,
  };
}

/**
 * Trailing-window visit count per site for every site a user owns.
 * Powers the sites list page so we can show "32 visits this week"
 * next to the integration-status chip without an N+1 of queries.
 *
 * Returns a Map keyed by site_id with the count. Sites with zero
 * traffic don't appear in the map (caller should default to 0).
 */
export async function getTrafficCountsPerSite(
  userId: string,
  windowDays = 7,
  now: Date = new Date(),
): Promise<Map<string, number>> {
  const since = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const rows = await getDb()
    .select({
      siteId: agentVisits.siteId,
      count: sql<number>`count(*)::int`,
    })
    .from(agentVisits)
    .innerJoin(sites, eq(sites.id, agentVisits.siteId))
    .where(and(eq(sites.userId, userId), gte(agentVisits.recordedAt, since)))
    .groupBy(agentVisits.siteId);

  return new Map(rows.map((r) => [r.siteId, r.count]));
}

/**
 * Recent visits for a single site filtered to one classifier label.
 * Powers the per-engine drill-down page. Newest first, capped at
 * `limit` rows to keep the table render cheap.
 */
export async function listRecentVisitsForSiteAndLabel(
  siteId: string,
  label: AgentLabel,
  limit = 100,
) {
  return getDb()
    .select({
      id: agentVisits.id,
      userAgent: agentVisits.userAgent,
      referrer: agentVisits.referrer,
      path: agentVisits.path,
      recordedAt: agentVisits.recordedAt,
    })
    .from(agentVisits)
    .where(and(eq(agentVisits.siteId, siteId), eq(agentVisits.label, label)))
    .orderBy(desc(agentVisits.recordedAt))
    .limit(limit);
}
