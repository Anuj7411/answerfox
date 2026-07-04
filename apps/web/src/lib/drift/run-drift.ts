import 'server-only';

/**
 * Drift Guard orchestrator (hero H4).
 *
 * A deploy landed; re-audit the live site and compare against the last
 * known-good audit. A check that PASSED before and FAILS now is drift
 * — for each one we enqueue a fix-PR request. The §3 promise: every
 * alert arrives WITH its fix attached, never a naked alarm. The queue
 * downstream enforces the 5-PR cap and per-installation pacing, and
 * `createFixPr` is idempotent, so repeated drift checks for the same
 * regression converge on the same PR instead of spamming.
 *
 * Both the audit and the enqueue are injected: unit tests fake them,
 * production wires the engine adapter and `inngest.send`.
 */

export interface DriftAuditResult {
  readonly score: number;
  /** Check ids currently failing on the live site, e.g. ["A1","C2"]. */
  readonly failedCheckIds: readonly string[];
}

export type DriftAuditFn = (siteUrl: string) => Promise<DriftAuditResult>;

export interface FixRequest {
  readonly checkId: string;
  readonly requestId: string;
}

export type EnqueueFixFn = (request: FixRequest) => Promise<void>;

export interface RunDriftInput {
  readonly repoFullName: string;
  readonly siteUrl: string;
  /** Score from the last known-good audit. */
  readonly priorScore: number;
  /** Check ids that were ALREADY failing before this deploy. */
  readonly priorFailedCheckIds: readonly string[];
  /** What triggered the check, for the result trail. */
  readonly source: 'deployment' | 'push' | 'cron';
}

export type RunDriftResult =
  | {
      readonly stage: 'drift-detected';
      readonly before: number;
      readonly after: number;
      readonly newFailures: readonly string[];
      readonly enqueued: number;
    }
  | { readonly stage: 'no-drift'; readonly before: number; readonly after: number }
  | { readonly stage: 'audit-failed'; readonly reason: string };

/** Deterministic id so re-checks converge on the same branch/PR. */
export function driftRequestId(repoFullName: string, checkId: string): string {
  // Sanitized: branch names strip non-alphanumerics from this anyway.
  const repoSlug = repoFullName.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 12);
  return `drift${checkId}${repoSlug}`;
}

export async function runDrift(
  input: RunDriftInput,
  audit: DriftAuditFn,
  enqueueFix: EnqueueFixFn,
): Promise<RunDriftResult> {
  let result: DriftAuditResult;
  try {
    result = await audit(input.siteUrl);
  } catch (err) {
    return { stage: 'audit-failed', reason: err instanceof Error ? err.message : 'Audit failed.' };
  }

  const prior = new Set(input.priorFailedCheckIds);
  const newFailures = result.failedCheckIds.filter((id) => !prior.has(id));

  if (newFailures.length === 0) {
    return { stage: 'no-drift', before: input.priorScore, after: result.score };
  }

  let enqueued = 0;
  for (const checkId of newFailures) {
    await enqueueFix({ checkId, requestId: driftRequestId(input.repoFullName, checkId) });
    enqueued += 1;
  }

  return {
    stage: 'drift-detected',
    before: input.priorScore,
    after: result.score,
    newFailures,
    enqueued,
  };
}
