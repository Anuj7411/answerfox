import { DEFAULT_CHECKS } from '@answerfox/audit';
import type { Command } from 'commander';
import kleur from 'kleur';

export interface ExplainCommandOptions {
  readonly color?: boolean;
}

export interface ExplainCommandResult {
  readonly stdout: string;
  readonly exitCode: number;
  readonly error?: string;
}

interface Styles {
  readonly bold: (s: string) => string;
  readonly dim: (s: string) => string;
}

function makeStyles(useColor: boolean): Styles {
  if (useColor) {
    return { bold: (s) => kleur.bold(s), dim: (s) => kleur.dim(s) };
  }
  const id = (s: string): string => s;
  return { bold: id, dim: id };
}

/**
 * Pure, testable runner for `answerfox explain <check-id>`.
 *
 * - Exit 0: check found, full doc printed to stdout
 * - Exit 2: unknown check ID; error message includes the available IDs
 */
export function runExplainCommand(
  checkId: string,
  opts: ExplainCommandOptions = {},
): ExplainCommandResult {
  const id = checkId.toUpperCase();
  const check = DEFAULT_CHECKS.find((c) => c.id === id);
  if (!check) {
    const available = DEFAULT_CHECKS.map((c) => c.id).join(', ');
    return {
      stdout: '',
      exitCode: 2,
      error: `Unknown check ID: "${checkId}". Available: ${available}`,
    };
  }

  const c = makeStyles(opts.color ?? true);
  const points = `${check.points} ${check.points === 1 ? 'point' : 'points'}`;
  const lines = [
    c.bold(`${check.id} — ${check.description}`),
    '',
    `${c.dim('Category:')} ${check.category}`,
    `${c.dim('Severity:')} ${check.severity} (${points})`,
    '',
    check.rationale,
    '',
    `${c.dim('Docs:')} ${check.docsUrl}`,
  ];
  return { stdout: lines.join('\n'), exitCode: 0 };
}

/**
 * Register `explain <check-id>` on the commander Program.
 */
export function registerExplainCommand(program: Command): void {
  program
    .command('explain <checkId>')
    .description('Print full documentation for a single audit check (e.g. A4)')
    .option('--no-color', 'Disable ANSI colours')
    .action((checkId: string, flags: Record<string, unknown>) => {
      const result = runExplainCommand(checkId, { color: flags.color !== false });
      if (result.error !== undefined) {
        process.stderr.write(`${result.error}\n`);
      } else if (result.stdout.length > 0) {
        process.stdout.write(`${result.stdout}\n`);
      }
      process.exit(result.exitCode);
    });
}
