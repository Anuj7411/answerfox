import { type TemplateName, getTemplate, renderTemplate } from '@answerfox/templates';
import type { Command } from 'commander';
import { type Fs, NodeFs } from '../install/fs.js';
import { detectNextProject } from '../install/project.js';
import { ClackPrompter, PromptCancelledError, type Prompter } from '../install/prompter.js';
import { type InstallResult, installFile } from '../install/render.js';
import { collectTokens, pickTokens } from '../install/tokens.js';

const VALID_TEMPLATE_NAMES: ReadonlySet<TemplateName> = new Set([
  'about',
  'privacy',
  'terms',
  'faq',
  'contact',
]);

export interface AddCommandOptions {
  readonly cwd?: string;
}

export interface AddCommandResult {
  readonly stdout: string;
  readonly exitCode: number;
  readonly error?: string;
  readonly written: readonly string[];
  readonly skipped: readonly string[];
}

export interface AddCommandDeps {
  readonly fs: Fs;
  readonly prompter: Prompter;
}

/**
 * Install a chosen subset of page templates into the current Next.js
 * project. Only prompts for tokens the selected templates need.
 *
 * - Exit 0: success
 * - Exit 2: unknown template name / no Next.js project / no templates supplied
 * - Exit 130: user cancelled a prompt
 */
export async function runAddCommand(
  templateNames: readonly string[],
  opts: AddCommandOptions,
  deps: AddCommandDeps,
): Promise<AddCommandResult> {
  if (templateNames.length === 0) {
    return {
      stdout: '',
      exitCode: 2,
      error: `Specify at least one template. Available: ${[...VALID_TEMPLATE_NAMES].join(', ')}.`,
      written: [],
      skipped: [],
    };
  }

  const invalid = templateNames.filter((n) => !VALID_TEMPLATE_NAMES.has(n as TemplateName));
  if (invalid.length > 0) {
    return {
      stdout: '',
      exitCode: 2,
      error: `Unknown template(s): ${invalid.join(', ')}. Available: ${[...VALID_TEMPLATE_NAMES].join(', ')}.`,
      written: [],
      skipped: [],
    };
  }

  const cwd = opts.cwd ?? process.cwd();
  const project = detectNextProject(cwd, deps.fs);
  if (!project.hasNext) {
    return {
      stdout: '',
      exitCode: 2,
      error: 'No Next.js project detected in this directory.',
      written: [],
      skipped: [],
    };
  }
  if (!project.hasAppDir) {
    return {
      stdout: '',
      exitCode: 2,
      error: 'No app/ directory found. Answerfox supports the Next.js App Router only.',
      written: [],
      skipped: [],
    };
  }

  // Union of tokens across selected templates.
  const required = new Set<string>();
  for (const name of templateNames) {
    for (const t of getTemplate(name as TemplateName).requiredTokens) {
      required.add(t);
    }
  }

  let tokens: Record<string, string>;
  try {
    tokens = await collectTokens([...required], project.projectName, deps.prompter);
  } catch (e) {
    if (e instanceof PromptCancelledError) {
      return { stdout: '', exitCode: 130, error: 'Cancelled.', written: [], skipped: [] };
    }
    throw e;
  }

  const results: InstallResult[] = [];
  for (const name of templateNames) {
    const template = getTemplate(name as TemplateName);
    const content = renderTemplate(template.name, pickTokens(tokens, template.requiredTokens));
    results.push(
      await installFile({ filename: template.filename, content }, cwd, deps.fs, deps.prompter),
    );
  }

  const written = results.filter((r) => r.status === 'written').map((r) => r.filename);
  const skipped = results.filter((r) => r.status === 'skipped').map((r) => r.filename);

  return {
    stdout: formatSummary(written, skipped),
    exitCode: 0,
    written,
    skipped,
  };
}

function formatSummary(written: readonly string[], skipped: readonly string[]): string {
  const lines: string[] = [];
  if (written.length > 0) {
    lines.push(`Wrote ${written.length} file(s):`);
    for (const f of written) lines.push(`  + ${f}`);
  }
  if (skipped.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push(`Skipped ${skipped.length} file(s):`);
    for (const f of skipped) lines.push(`  - ${f}`);
  }
  return lines.join('\n');
}

export function registerAddCommand(program: Command): void {
  program
    .command('add <templates...>')
    .description('Install specific templates (about, privacy, terms, faq, contact)')
    .action(async (templates: string[]) => {
      const deps: AddCommandDeps = { fs: new NodeFs(), prompter: new ClackPrompter() };
      // Support comma-separated form: `answerfox add about,faq`
      const names = templates.flatMap((t) =>
        t
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      );
      const result = await runAddCommand(names, {}, deps);
      if (result.error !== undefined) {
        process.stderr.write(`${result.error}\n`);
      } else if (result.stdout.length > 0) {
        process.stdout.write(`${result.stdout}\n`);
      }
      process.exit(result.exitCode);
    });
}
