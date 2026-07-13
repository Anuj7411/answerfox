import 'server-only';
import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import { getDb } from '@/lib/db/client';
import { publicScans } from '@/lib/db/schema/public-scans';

/**
 * Persist a public scan and return its id so the caller can build the
 * shareable /scan/:id URL. Denormalized counts keep listing cheap; the
 * full report JSON is kept so the shared page shows the gaps.
 */
export async function createPublicScan(report: AgentAnswerReport): Promise<string> {
  const [row] = await getDb()
    .insert(publicScans)
    .values({
      url: report.url,
      answerabilityScore: report.answerabilityScore,
      gapCount: report.gaps.length,
      questionCount: report.results.length,
      report,
    })
    .returning({ id: publicScans.id });
  if (row === undefined) throw new Error('Insert returned no row');
  return row.id;
}
