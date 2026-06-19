import { describe, expect, it } from 'vitest';
import { diffAudits } from './diff-audits';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'pass' | 'fail' | 'warn' | 'skip';

function f({
  checkId,
  status,
  severity = 'high',
}: {
  checkId: string;
  status: Status;
  severity?: Severity;
}) {
  return {
    id: `${checkId}-${status}`,
    auditId: 'audit-x',
    checkId,
    category: 'agent-readiness',
    severity,
    status,
    evidence: null,
    fixRecommendation: null,
    createdAt: new Date(),
  } as const;
}

const PREV_META = {
  score: 70,
  agentReadinessScore: 3,
  fetchedAt: new Date('2026-06-01T00:00:00Z'),
};
const LATEST_META = {
  score: 82,
  agentReadinessScore: 5,
  fetchedAt: new Date('2026-06-08T00:00:00Z'),
};

describe('diffAudits', () => {
  it('emits no diff when both audits are identical', () => {
    const findings = [f({ checkId: 'G1', status: 'pass' })];
    const out = diffAudits({
      previous: PREV_META,
      latest: { ...PREV_META, fetchedAt: LATEST_META.fetchedAt },
      previousFindings: findings,
      latestFindings: findings,
    });
    expect(out.newFailures).toHaveLength(0);
    expect(out.fixed).toHaveLength(0);
    expect(out.scoreDelta).toBe(0);
    expect(out.agentReadinessDelta).toBe(0);
  });

  it('flags a check that regressed from pass to fail', () => {
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [f({ checkId: 'A4', status: 'pass' })],
      latestFindings: [f({ checkId: 'A4', status: 'fail' })],
    });
    expect(out.newFailures.map((x) => x.checkId)).toEqual(['A4']);
    expect(out.fixed).toHaveLength(0);
  });

  it('flags a check that improved from fail to pass', () => {
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [f({ checkId: 'G1', status: 'fail' })],
      latestFindings: [f({ checkId: 'G1', status: 'pass' })],
    });
    expect(out.fixed.map((x) => x.checkId)).toEqual(['G1']);
    expect(out.newFailures).toHaveLength(0);
  });

  it('treats a check missing from the previous audit as new (regression)', () => {
    // New check rolled out between audits and the latest run is failing.
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [],
      latestFindings: [f({ checkId: 'G7', status: 'fail' })],
    });
    expect(out.newFailures.map((x) => x.checkId)).toEqual(['G7']);
  });

  it('treats a check missing from the latest audit as fixed when it was failing', () => {
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [f({ checkId: 'C3', status: 'fail' })],
      latestFindings: [],
    });
    expect(out.fixed.map((x) => x.checkId)).toEqual(['C3']);
  });

  it('ignores fail-still-fail (not new, not fixed)', () => {
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [f({ checkId: 'G1', status: 'fail' })],
      latestFindings: [f({ checkId: 'G1', status: 'fail' })],
    });
    expect(out.newFailures).toHaveLength(0);
    expect(out.fixed).toHaveLength(0);
  });

  it('computes positive deltas as improvement', () => {
    const out = diffAudits({
      previous: { score: 70, agentReadinessScore: 3, fetchedAt: PREV_META.fetchedAt },
      latest: { score: 84, agentReadinessScore: 6, fetchedAt: LATEST_META.fetchedAt },
      previousFindings: [],
      latestFindings: [],
    });
    expect(out.scoreDelta).toBe(14);
    expect(out.agentReadinessDelta).toBe(3);
  });

  it('computes negative deltas as regression', () => {
    const out = diffAudits({
      previous: { score: 88, agentReadinessScore: 7, fetchedAt: PREV_META.fetchedAt },
      latest: { score: 75, agentReadinessScore: 5, fetchedAt: LATEST_META.fetchedAt },
      previousFindings: [],
      latestFindings: [],
    });
    expect(out.scoreDelta).toBe(-13);
    expect(out.agentReadinessDelta).toBe(-2);
  });

  it('handles a mix of regressions, fixes, and unchanged in one pass', () => {
    const out = diffAudits({
      previous: PREV_META,
      latest: LATEST_META,
      previousFindings: [
        f({ checkId: 'A1', status: 'pass' }),
        f({ checkId: 'A2', status: 'fail' }),
        f({ checkId: 'A3', status: 'fail' }),
      ],
      latestFindings: [
        f({ checkId: 'A1', status: 'fail' }),
        f({ checkId: 'A2', status: 'pass' }),
        f({ checkId: 'A3', status: 'fail' }),
      ],
    });
    expect(out.newFailures.map((x) => x.checkId)).toEqual(['A1']);
    expect(out.fixed.map((x) => x.checkId)).toEqual(['A2']);
  });
});
