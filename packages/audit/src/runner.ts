import type { AbsoluteUrl, Check, CheckResult } from '@answerable/core';
import { parseAbsoluteUrl } from '@answerable/core';
import { DEFAULT_CHECKS } from './checks/registry.js';
import { type FetchAndParseOptions, fetchAndParse } from './crawler.js';
import { type AuditDom, loadHtml } from './parser.js';
import type { AuditReport, CheckRunResult, ScoreBand } from './types.js';

export interface RunChecksInput {
  readonly url: AbsoluteUrl;
  readonly html: string;
  readonly dom: AuditDom;
  /** Override the default check set. Defaults to every registered check. */
  readonly checks?: readonly Check<AuditDom>[];
}

/**
 * Pure runner: takes pre-parsed input and returns the report.
 * No network. Tests use this exclusively so CI never hits live URLs.
 *
 * Each check runs in parallel via `Promise.all`. A thrown check is
 * captured and recorded as a `skip` with the error message — the
 * audit always completes.
 */
export async function runChecks(input: RunChecksInput): Promise<AuditReport> {
  const checks = input.checks ?? DEFAULT_CHECKS;
  const fetchedAt = new Date().toISOString();

  const results: CheckRunResult[] = await Promise.all(
    checks.map(async (check) => {
      try {
        const result = await check.run({ url: input.url, html: input.html, dom: input.dom });
        return buildResult(check, result);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          id: check.id,
          category: check.category,
          severity: check.severity,
          description: check.description,
          maxPoints: check.points,
          earnedPoints: 0,
          status: 'skip',
          docsUrl: check.docsUrl,
          error: message,
        };
      }
    }),
  );

  const summary = {
    pass: results.filter((r) => r.status === 'pass').length,
    fail: results.filter((r) => r.status === 'fail').length,
    warn: results.filter((r) => r.status === 'warn').length,
    skip: results.filter((r) => r.status === 'skip').length,
  };

  const score = computeScore(results);

  return {
    url: input.url,
    fetchedAt,
    results,
    score,
    band: bandFromScore(score),
    summary,
  };
}

function buildResult(check: Check<AuditDom>, result: CheckResult): CheckRunResult {
  const earnedPoints = result.status === 'pass' ? check.points : 0;
  const out: CheckRunResult = {
    id: check.id,
    category: check.category,
    severity: check.severity,
    description: check.description,
    maxPoints: check.points,
    earnedPoints,
    status: result.status,
    docsUrl: check.docsUrl,
  };
  return result.evidence !== undefined || result.fixRecommendation !== undefined
    ? {
        ...out,
        ...(result.evidence !== undefined && { evidence: result.evidence }),
        ...(result.fixRecommendation !== undefined && {
          fixRecommendation: result.fixRecommendation,
        }),
      }
    : out;
}

/**
 * Compute the integer score against the *checks that actually ran*
 * (excluding skips). Lets category-filtered audits score on their
 * own denominator rather than always against 100.
 */
function computeScore(results: readonly CheckRunResult[]): number {
  const consideredResults = results.filter((r) => r.status !== 'skip');
  if (consideredResults.length === 0) return 0;
  const maxPossible = consideredResults.reduce((sum, r) => sum + r.maxPoints, 0);
  if (maxPossible === 0) return 0;
  const earned = consideredResults.reduce((sum, r) => sum + r.earnedPoints, 0);
  return Math.round((earned / maxPossible) * 100);
}

/**
 * Map an integer score to its AUDIT-FRAMEWORK band.
 * 0-40 critical · 41-60 weak · 61-80 average · 81-90 strong · 91-100 excellent
 */
export function bandFromScore(score: number): ScoreBand {
  if (score <= 40) return 'critical';
  if (score <= 60) return 'weak';
  if (score <= 80) return 'average';
  if (score <= 90) return 'strong';
  return 'excellent';
}

export interface AuditConvenienceOptions extends FetchAndParseOptions {
  readonly checks?: readonly Check<AuditDom>[];
}

/**
 * Convenience wrapper: fetches the target URL and runs the audit.
 * Real-world callers use this; tests use `runChecks` directly with
 * fixture HTML.
 */
export async function audit(
  url: string,
  options: AuditConvenienceOptions = {},
): Promise<AuditReport> {
  const parsed = parseAbsoluteUrl(url);
  const fetched = await fetchAndParse(parsed, options);
  const dom = fetched.dom ?? loadHtml(fetched.html);
  return runChecks({
    url: parsed,
    html: fetched.html,
    dom,
    ...(options.checks !== undefined && { checks: options.checks }),
  });
}
