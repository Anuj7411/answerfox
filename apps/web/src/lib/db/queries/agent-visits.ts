import 'server-only';
import type { AgentLabel } from '@/lib/analytics/classify-agent';
import { getDb } from '@/lib/db/client';
import { agentVisits } from '@/lib/db/schema/agent-visits';
import { and, eq, gte, sql } from 'drizzle-orm';

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
