import type { findings as findingsTable } from '@/lib/db/schema/findings';

type Finding = typeof findingsTable.$inferSelect;

export interface AuditDiffSummary {
  readonly scoreDelta: number;
  readonly agentReadinessDelta: number;
  readonly newFailures: ReadonlyArray<Finding>;
  readonly fixed: ReadonlyArray<Finding>;
  readonly previousAt: Date;
  readonly latestAt: Date;
}

/**
 * Diff two audits for the same site.
 *
 * - `newFailures`: checks that PASSED in the previous audit but FAIL in
 *   the latest. These are regressions worth surfacing first.
 * - `fixed`: checks that FAILED in the previous audit but PASS in the
 *   latest. These are improvements worth celebrating.
 * - Score deltas use the simple latest - previous formula; positive
 *   means improvement.
 *
 * Matches findings by `checkId` since `findings.id` rotates across
 * audits — `checkId` is the stable identifier per check definition.
 */
export function diffAudits(args: {
  previous: { score: number; agentReadinessScore: number; fetchedAt: Date };
  latest: { score: number; agentReadinessScore: number; fetchedAt: Date };
  previousFindings: ReadonlyArray<Finding>;
  latestFindings: ReadonlyArray<Finding>;
}): AuditDiffSummary {
  const { previous, latest, previousFindings, latestFindings } = args;

  const previousByCheckId = new Map(previousFindings.map((f) => [f.checkId, f]));
  const latestByCheckId = new Map(latestFindings.map((f) => [f.checkId, f]));

  const newFailures: Finding[] = [];
  for (const f of latestFindings) {
    if (f.status !== 'fail') continue;
    const prev = previousByCheckId.get(f.checkId);
    if (prev === undefined || prev.status !== 'fail') {
      newFailures.push(f);
    }
  }

  const fixed: Finding[] = [];
  for (const f of previousFindings) {
    if (f.status !== 'fail') continue;
    const now = latestByCheckId.get(f.checkId);
    if (now === undefined || now.status !== 'fail') {
      fixed.push(f);
    }
  }

  return {
    scoreDelta: latest.score - previous.score,
    agentReadinessDelta: latest.agentReadinessScore - previous.agentReadinessScore,
    newFailures,
    fixed,
    previousAt: previous.fetchedAt,
    latestAt: latest.fetchedAt,
  };
}
