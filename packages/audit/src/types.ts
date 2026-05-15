import type { AbsoluteUrl, Category, Severity } from '@answerable/core';

/**
 * Outcome of a single check after the runner has resolved any errors
 * and attached the check's static metadata.
 */
export interface CheckRunResult {
  readonly id: string;
  readonly category: Category;
  readonly severity: Severity;
  readonly description: string;
  /** Max points this check is worth toward the 100-point total. */
  readonly maxPoints: number;
  /** Points actually earned (full on `pass`, otherwise 0). */
  readonly earnedPoints: number;
  readonly status: 'pass' | 'fail' | 'warn' | 'skip';
  readonly evidence?: string | undefined;
  readonly fixRecommendation?: string | undefined;
  readonly docsUrl: string;
  /** Populated when the check itself threw — the runner caught it. */
  readonly error?: string | undefined;
}

export type ScoreBand = 'critical' | 'weak' | 'average' | 'strong' | 'excellent';

/**
 * Final audit report consumed by reporters and CI integrations.
 *
 * `score` is computed against the sum of `maxPoints` for the *checks
 * that ran* — so partial-suite runs (e.g. category filters) score on
 * their own denominator rather than always against 100.
 */
export interface AuditReport {
  readonly url: AbsoluteUrl;
  readonly fetchedAt: string;
  readonly results: readonly CheckRunResult[];
  /** 0–100. Integer, rounded. */
  readonly score: number;
  readonly band: ScoreBand;
  readonly summary: {
    readonly pass: number;
    readonly fail: number;
    readonly warn: number;
    readonly skip: number;
  };
}

export interface AuditOptions {
  /** Override the default check registry (e.g. category subsets). */
  readonly checks?: readonly never[];
  /** Override the default User-Agent header. Rarely useful. */
  readonly userAgent?: string;
  /** Hard timeout in milliseconds for the initial fetch. */
  readonly timeoutMs?: number;
}
