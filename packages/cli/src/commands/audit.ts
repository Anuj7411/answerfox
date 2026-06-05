import { type AuditReport, audit, consoleReport } from '@answerfox/audit';
import type { Command } from 'commander';

export interface AuditCommandOptions {
  readonly json?: boolean;
  readonly ci?: boolean;
  readonly minScore?: number;
  readonly color?: boolean;
}

export interface AuditCommandResult {
  readonly stdout: string;
  readonly exitCode: number;
  readonly report?: AuditReport;
  readonly error?: string;
}

export interface AuditCommandDeps {
  /** Injection point for tests. Defaults to the live `audit()` from `@answerfox/audit`. */
  readonly auditImpl?: (url: string) => Promise<AuditReport>;
}

/**
 * Pure, testable command runner. The commander action wires this up
 * with `process.stdout`, `process.stderr`, and `process.exit`.
 *
 * - Exit 0: success (and if `--ci`, score ≥ `--min-score`)
 * - Exit 1: CI threshold not met
 * - Exit 2: audit failed (network, parse error, etc.)
 */
export async function runAuditCommand(
  url: string,
  opts: AuditCommandOptions = {},
  deps: AuditCommandDeps = {},
): Promise<AuditCommandResult> {
  const auditFn = deps.auditImpl ?? audit;
  let report: AuditReport;
  try {
    report = await auditFn(url);
  } catch (e) {
    return {
      stdout: '',
      exitCode: 2,
      error: e instanceof Error ? e.message : String(e),
    };
  }

  const stdout = opts.json
    ? JSON.stringify(report, null, 2)
    : consoleReport(report, { color: opts.color ?? true });

  let exitCode = 0;
  if (opts.ci) {
    const min = opts.minScore ?? 80;
    if (report.score < min) {
      exitCode = 1;
    }
  }

  return { stdout, exitCode, report };
}

/**
 * Register `audit <url>` on the commander Program. Wires
 * `runAuditCommand` to `process.stdout` / `process.exit`.
 */
export function registerAuditCommand(program: Command): void {
  program
    .command('audit <url>')
    .description('Fetch a URL, run every check, print a report')
    .option('--json', 'Emit JSON instead of human-readable output')
    .option('--ci', 'Exit non-zero if score < --min-score')
    .option('--min-score <number>', 'Score threshold for --ci mode', '80')
    .option('--no-color', 'Disable ANSI colours')
    .action(async (url: string, flags: Record<string, unknown>) => {
      const minScoreRaw = flags.minScore;
      const minScore =
        typeof minScoreRaw === 'string' ? Number(minScoreRaw) : (minScoreRaw as number | undefined);
      if (minScore !== undefined && Number.isNaN(minScore)) {
        process.stderr.write(`Invalid --min-score: ${String(minScoreRaw)}\n`);
        process.exitCode = 2;
        return;
      }

      const result = await runAuditCommand(url, {
        json: flags.json === true,
        ci: flags.ci === true,
        ...(minScore !== undefined ? { minScore } : {}),
        // commander --no-color sets `color` to false on the flags object.
        color: flags.color !== false,
      });

      if (result.error !== undefined) {
        process.stderr.write(`${result.error}\n`);
      } else if (result.stdout.length > 0) {
        process.stdout.write(`${result.stdout}\n`);
      }
      // Set the exit code and let the process exit naturally. Calling
      // process.exit() here force-kills the event loop while undici (fetch)
      // sockets are still closing, which triggers a libuv assertion crash on
      // Windows after the report prints. Natural exit avoids that and is fast.
      process.exitCode = result.exitCode;
    });
}
