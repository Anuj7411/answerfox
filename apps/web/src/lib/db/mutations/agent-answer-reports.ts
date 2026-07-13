import 'server-only';
import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import { getDb } from '@/lib/db/client';
import { agentAnswerReports } from '@/lib/db/schema/agent-answer-reports';

/**
 * Persist one Agent Answer Simulation run. The denormalized score/gap/
 * question counts make the trend query index-only; the full `report`
 * JSON is kept so a run's per-question detail survives for diffing.
 */
export async function createAgentAnswerReport(input: {
  readonly siteId: string;
  readonly report: AgentAnswerReport;
}): Promise<void> {
  await getDb()
    .insert(agentAnswerReports)
    .values({
      siteId: input.siteId,
      url: input.report.url,
      answerabilityScore: input.report.answerabilityScore,
      gapCount: input.report.gaps.length,
      questionCount: input.report.results.length,
      report: input.report,
    });
}
