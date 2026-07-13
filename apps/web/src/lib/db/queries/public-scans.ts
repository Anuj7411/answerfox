import 'server-only';
import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import { getDb } from '@/lib/db/client';
import { publicScans } from '@/lib/db/schema/public-scans';
import { eq } from 'drizzle-orm';

export interface StoredPublicScan {
  readonly id: string;
  readonly url: string;
  readonly report: AgentAnswerReport;
  readonly createdAt: Date;
}

/** One stored public scan by id, or null if it does not exist. */
export async function getPublicScanById(id: string): Promise<StoredPublicScan | null> {
  const [row] = await getDb()
    .select({
      id: publicScans.id,
      url: publicScans.url,
      report: publicScans.report,
      createdAt: publicScans.createdAt,
    })
    .from(publicScans)
    .where(eq(publicScans.id, id))
    .limit(1);
  if (row === undefined) return null;
  return {
    id: row.id,
    url: row.url,
    report: row.report as AgentAnswerReport,
    createdAt: row.createdAt,
  };
}
