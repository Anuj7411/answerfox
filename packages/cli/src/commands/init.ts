import { type Template, listTemplates, renderTemplate } from '@answerable/templates';
import type { Command } from 'commander';
import { type Fs, NodeFs } from '../install/fs.js';
import { detectNextProject } from '../install/project.js';
import { ClackPrompter, PromptCancelledError, type Prompter } from '../install/prompter.js';
import { type InstallResult, installFile } from '../install/render.js';
import { ROBOTS_FILE_CONTENT, SITEMAP_FILE_CONTENT } from '../install/routing-files.js';
import { collectTokens, pickTokens } from '../install/tokens.js';

export interface InitCommandOptions {
  readonly cwd?: string;
}

export interface InitCommandResult {
  readonly stdout: string;
  readonly exitCode: number;
  readonly error?: string;
  readonly written: readonly string[];
  readonly skipped: readonly string[];
}

export interface InitCommandDeps {
  readonly fs: Fs;
  readonly prompter: Prompter;
}

/**
 * Run the interactive `init` flow: detect Next.js, prompt for the
 * three irreducible tokens (project name, domain, contact email),
 * derive everything else, install all five page templates + routing
 * files (sitemap, robots).
 *
 * - Exit 0: success
 * - Exit 2: no Next.js project / no app/ directory
 * - Exit 130: user cancelled a prompt (SIGINT-equivalent)
 */
export async function runInitCommand(
  opts: InitCommandOptions,
  deps: InitCommandDeps,
): Promise<InitCommandResult> {
  const cwd = opts.cwd ?? process.cwd();
  const project = detectNextProject(cwd, deps.fs);

  if (!project.hasNext) {
    return {
      stdout: '',
      exitCode: 2,
      error:
        'No Next.js project detected (no "next" in package.json dependencies). Run this command from the root of an existing Next.js project.',
      written: [],
      skipped: [],
    };
  }
  if (!project.hasAppDir) {
    return {
      stdout: '',
      exitCode: 2,
      error: 'No app/ directory found. Answerable supports the Next.js App Router only.',
      written: [],
      skipped: [],
    };
  }

  deps.prompter.intro('Answerable · setting up SEO');

  // Compute the union of tokens needed by every page template + routing files.
  const allRequired = new Set<string>(['URL']); // routing files use URL
  for (const t of listTemplates()) {
    for (const token of t.requiredTokens) allRequired.add(token);
  }

  let tokens: Record<string, string>;
  try {
    tokens = await collectTokens([...allRequired], project.projectName, deps.prompter);
  } catch (e) {
    if (e instanceof PromptCancelledError) {
      return { stdout: '', exitCode: 130, error: 'Cancelled.', written: [], skipped: [] };
    }
    throw e;
  }

  const results: InstallResult[] = [];

  // Page templates.
  for (const template of listTemplates()) {
    results.push(await installPageTemplate(template, tokens, cwd, deps));
  }

  // Routing files.
  const urlValue = tokens.URL ?? '';
  results.push(
    await installFile(
      { filename: 'app/sitemap.ts', content: substituteUrl(SITEMAP_FILE_CONTENT, urlValue) },
      cwd,
      deps.fs,
      deps.prompter,
    ),
  );
  results.push(
    await installFile(
      { filename: 'app/robots.ts', content: substituteUrl(ROBOTS_FILE_CONTENT, urlValue) },
      cwd,
      deps.fs,
      deps.prompter,
    ),
  );

  const written = results.filter((r) => r.status === 'written').map((r) => r.filename);
  const skipped = results.filter((r) => r.status === 'skipped').map((r) => r.filename);

  deps.prompter.outro('Done. Edit the [Edit me] placeholders before shipping.');

  return {
    stdout: formatSummary(written, skipped),
    exitCode: 0,
    written,
    skipped,
  };
}

async function installPageTemplate(
  template: Template,
  tokens: Record<string, string>,
  cwd: string,
  deps: InitCommandDeps,
): Promise<InstallResult> {
  const content = renderTemplate(template.name, pickTokens(tokens, template.requiredTokens));
  return installFile({ filename: template.filename, content }, cwd, deps.fs, deps.prompter);
}

function substituteUrl(content: string, url: string): string {
  return content.replace(/\{\{URL\}\}/g, url);
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

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Set up SEO in an existing Next.js project (interactive)')
    .action(async () => {
      const deps: InitCommandDeps = { fs: new NodeFs(), prompter: new ClackPrompter() };
      const result = await runInitCommand({}, deps);
      if (result.error !== undefined) {
        process.stderr.write(`${result.error}\n`);
      } else if (result.stdout.length > 0) {
        process.stdout.write(`${result.stdout}\n`);
      }
      process.exit(result.exitCode);
    });
}
