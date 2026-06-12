import 'server-only';
import { getDb } from '@/lib/db/client';
import { audits } from '@/lib/db/schema/audits';
import { findings } from '@/lib/db/schema/findings';
import { sites } from '@/lib/db/schema/sites';
import type { AuditReport } from '@answerfox/audit';
import { eq } from 'drizzle-orm';

export interface CreateAuditInput {
  readonly siteId: string;
  readonly report: AuditReport;
}

type FindingStatus = 'pass' | 'fail' | 'warn' | 'skip';
type FindingSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Persist an AuditReport: insert one `audits` row + one `findings`
 * row per check, then bump `sites.last_audited_at`. Returns the
 * inserted audit row so callers can redirect to its detail page.
 *
 * Wrapped in a transaction so a partial failure (e.g. one finding
 * row violating a constraint) rolls back the audits row too. The
 * dashboard never shows a half-persisted audit.
 */
export async function createAuditWithFindings(input: CreateAuditInput) {
  const { siteId, report } = input;

  const agentReadinessScore = report.results.filter(
    (r) => r.category === 'agent-readiness' && r.status === 'pass',
  ).length;

  return getDb().transaction(async (tx) => {
    const [audit] = await tx
      .insert(audits)
      .values({
        siteId,
        url: report.url,
        fetchedAt: new Date(report.fetchedAt),
        score: report.score,
        band: report.band,
        passCount: report.summary.pass,
        failCount: report.summary.fail,
        warnCount: report.summary.warn,
        skipCount: report.summary.skip,
        gatePageDetected: report.gatePage !== undefined,
        agentReadinessScore,
        rawReport: report,
      })
      .returning();

    if (audit === undefined) {
      throw new Error('Insert returned no audit row');
    }

    if (report.results.length > 0) {
      await tx.insert(findings).values(
        report.results.map((r) => ({
          auditId: audit.id,
          checkId: r.id,
          category: r.category,
          severity: r.severity as FindingSeverity,
          status: r.status as FindingStatus,
          evidence: r.evidence ?? null,
          fixRecommendation: r.fixRecommendation ?? null,
        })),
      );
    }

    await tx
      .update(sites)
      .set({ lastAuditedAt: new Date(report.fetchedAt) })
      .where(eq(sites.id, siteId));

    return audit;
  });
}
