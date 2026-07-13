import 'server-only';
import { getDb } from '@/lib/db/client';
import { agentAnswerReports } from '@/lib/db/schema/agent-answer-reports';
import { desc, eq } from 'drizzle-orm';

export interface AgentAnswerHistoryEntry {
  readonly id: string;
  readonly answerabilityScore: number;
  readonly gapCount: number;
  readonly createdAt: Date;
}

/**
 * The site's Agent Answer runs, newest first. Reads the (site_id,
 * created_at) index; the heavy `report` JSON is intentionally not
 * selected so the trend list stays cheap.
 */
export async function listAgentAnswerReportsForSite(
  siteId: string,
  limit = 10,
): Promise<readonly AgentAnswerHistoryEntry[]> {
  return getDb()
    .select({
      id: agentAnswerReports.id,
      answerabilityScore: agentAnswerReports.answerabilityScore,
      gapCount: agentAnswerReports.gapCount,
      createdAt: agentAnswerReports.createdAt,
    })
    .from(agentAnswerReports)
    .where(eq(agentAnswerReports.siteId, siteId))
    .orderBy(desc(agentAnswerReports.createdAt))
    .limit(limit);
}
