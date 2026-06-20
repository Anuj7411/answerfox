import 'server-only';
import type { AgentLabel } from '@/lib/analytics/classify-agent';
import { getDb } from '@/lib/db/client';
import { agentVisits } from '@/lib/db/schema/agent-visits';

export async function recordAgentVisit(input: {
  siteId: string;
  label: AgentLabel;
  userAgent: string;
  referrer: string | null;
  path: string | null;
}): Promise<void> {
  await getDb()
    .insert(agentVisits)
    .values({
      siteId: input.siteId,
      label: input.label,
      userAgent: input.userAgent.slice(0, 1000),
      referrer: input.referrer?.slice(0, 1000) ?? null,
      path: input.path?.slice(0, 1000) ?? null,
    });
}
