import kleur from 'kleur';
import { DEFAULT_CHECKS, TOTAL_PLANNED_CHECKS } from '../checks/registry.js';
import { formatGateBanner } from '../gate-detector.js';
import type { AuditReport, CheckRunResult, ScoreBand } from '../types.js';

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;

const SEVERITY_LABEL: Record<(typeof SEVERITY_ORDER)[number], string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
};

const BAND_LABEL: Record<ScoreBand, string> = {
  critical: 'Critical',
  weak: 'Weak',
  average: 'Average',
  strong: 'Strong',
  excellent: 'Excellent',
};

export interface ConsoleReportOptions {
  /** Suppress ANSI color escapes (for testing or non-TTY pipelines). */
  readonly color?: boolean;
}

/**
 * Render an `AuditReport` as a human-readable, terminal-friendly string.
 * Groups failures by severity descending, then lists every passing
 * check at the bottom for confidence.
 */
export function consoleReport(report: AuditReport, options: ConsoleReportOptions = {}): string {
  const enableColor = options.color ?? true;
  const c = enableColor ? kleur : disableKleur();

  const failures = report.results.filter((r) => r.status === 'fail' || r.status === 'warn');
  const skips = report.results.filter((r) => r.status === 'skip');
  const passes = report.results.filter((r) => r.status === 'pass');

  const lines: string[] = [];
  lines.push(c.bold(`Audit · ${report.url}`));
  lines.push(`Fetched ${report.fetchedAt}`);
  lines.push('');

  // Gate-page banner sits ABOVE the score so users read the context
  // before the number. Only printed when the page is classified as a
  // gate (logged-out login wall). See gate-detector.ts for heuristics.
  if (report.gatePage !== undefined) {
    const banner = formatGateBanner(report.gatePage);
    if (banner !== null) {
      const indented = banner
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n');
      lines.push(c.yellow(c.bold('⚠ Gate page detected')));
      lines.push(c.yellow(indented));
      lines.push('');
    }
  }

  lines.push(
    `${c.bold('Score:')} ${scoreColor(c, report.score)(`${report.score}/100`)} ${c.dim(`(${BAND_LABEL[report.band]})`)}`,
  );
  lines.push(
    c.dim(
      `${report.summary.pass} pass · ${report.summary.fail} fail · ${report.summary.warn} warn · ${report.summary.skip} skip`,
    ),
  );

  // Failures + warnings grouped by severity.
  for (const sev of SEVERITY_ORDER) {
    const inGroup = failures.filter((r) => r.severity === sev);
    if (inGroup.length === 0) continue;
    lines.push('');
    lines.push(
      c.bold(severityColor(c, sev)(`[${SEVERITY_LABEL[sev]}] ${inGroup.length} issue(s)`)),
    );
    for (const r of inGroup) {
      lines.push(...formatFinding(c, r));
    }
  }

  if (skips.length > 0) {
    lines.push('');
    lines.push(c.bold(c.gray(`[SKIPPED] ${skips.length}`)));
    for (const r of skips) {
      lines.push(c.gray(`  ${r.id} · ${r.description}${r.error ? ` — ${r.error}` : ''}`));
    }
  }

  if (passes.length > 0) {
    lines.push('');
    lines.push(c.bold(c.green(`[PASSED] ${passes.length}`)));
    for (const r of passes) {
      lines.push(c.dim(`  ${r.id} · ${r.description}`));
    }
  }

  // Framework coverage footer. Tells a user scoring 100/100 that they
  // are scored against the currently-shipped subset, not the full spec
  // — which prevents "perfect site forever" misreads as more checks
  // land. Numbers come from the registry, so this stays accurate as
  // we ship new checks without anyone remembering to bump it.
  lines.push('');
  lines.push(
    c.dim(
      `${DEFAULT_CHECKS.length} of ${TOTAL_PLANNED_CHECKS} audit checks active — see https://github.com/Anuj7411/answerfox for the full framework`,
    ),
  );

  return lines.join('\n');
}

function formatFinding(c: typeof kleur, r: CheckRunResult): string[] {
  const lines = [`  ${c.bold(r.id)} · ${r.description}`];
  if (r.evidence !== undefined) {
    lines.push(c.dim(`     ${truncate(r.evidence, 200)}`));
  }
  if (r.fixRecommendation !== undefined) {
    lines.push(`     ${c.cyan('Fix:')} ${truncate(r.fixRecommendation, 200)}`);
  }
  lines.push(c.dim(`     ${r.docsUrl}`));
  return lines;
}

function severityColor(c: typeof kleur, severity: (typeof SEVERITY_ORDER)[number]) {
  switch (severity) {
    case 'critical':
      return c.red;
    case 'high':
      return c.yellow;
    case 'medium':
      return c.blue;
    case 'low':
      return c.gray;
  }
}

function scoreColor(c: typeof kleur, score: number) {
  if (score >= 81) return c.green;
  if (score >= 61) return c.yellow;
  if (score >= 41) return c.magenta;
  return c.red;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

/**
 * Returns a no-op shim with the same shape as kleur so we can pass it
 * through the formatter when color is disabled.
 */
function disableKleur(): typeof kleur {
  const identity = (s: string | number): string => String(s);
  const colors = ['red', 'yellow', 'blue', 'gray', 'green', 'magenta', 'cyan', 'bold', 'dim'];
  const shim = identity as unknown as typeof kleur;
  for (const name of colors) {
    (shim as unknown as Record<string, (s: string | number) => string>)[name] = identity;
  }
  return shim;
}
