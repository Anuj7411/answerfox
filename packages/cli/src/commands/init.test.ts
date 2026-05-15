import { describe, expect, it } from 'vitest';
import { InMemoryFs } from '../install/fs.js';
import { ScriptedPrompter } from '../install/prompter.js';
import { runInitCommand } from './init.js';

const STANDARD_ANSWERS = ['Acme', 'acme.com', 'hello@acme.com'];

function setupNextProject(fs: InMemoryFs, cwd = '/proj') {
  fs.writeFileSync(
    `${cwd}/package.json`,
    JSON.stringify({ name: 'acme-app', dependencies: { next: '^15.0.0' } }),
  );
  fs.mkdirSync(`${cwd}/app`, { recursive: true });
}

describe('runInitCommand — preconditions', () => {
  it('exits 2 when no package.json is present', async () => {
    const fs = new InMemoryFs();
    const prompter = new ScriptedPrompter([]);
    const result = await runInitCommand({ cwd: '/proj' }, { fs, prompter });
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('No Next.js project');
  });

  it('exits 2 when package.json lacks next', async () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'x', dependencies: {} }));
    fs.mkdirSync('/proj/app', { recursive: true });
    const result = await runInitCommand(
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('No Next.js project');
  });

  it('exits 2 when app/ directory is missing', async () => {
    const fs = new InMemoryFs();
    fs.writeFileSync(
      '/proj/package.json',
      JSON.stringify({ name: 'x', dependencies: { next: '^15' } }),
    );
    const result = await runInitCommand(
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('app/');
  });
});

describe('runInitCommand — happy path', () => {
  it('writes 7 files on a fresh project', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    const prompter = new ScriptedPrompter(STANDARD_ANSWERS);
    const result = await runInitCommand({ cwd: '/proj' }, { fs, prompter });

    expect(result.exitCode).toBe(0);
    expect(result.error).toBeUndefined();
    expect(result.written).toHaveLength(7);
    expect(result.written).toEqual([
      'app/about/page.tsx',
      'app/privacy/page.tsx',
      'app/terms/page.tsx',
      'app/faq/page.tsx',
      'app/contact/page.tsx',
      'app/sitemap.ts',
      'app/robots.ts',
    ]);
  });

  it('substitutes tokens — about page contains the project name and domain-derived URL', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    const prompter = new ScriptedPrompter(STANDARD_ANSWERS);
    await runInitCommand({ cwd: '/proj' }, { fs, prompter });

    const about = fs.readFile('/proj/app/about/page.tsx') ?? '';
    expect(about).toContain('About Acme');
    expect(about).toContain('https://acme.com/contact');
    expect(about).not.toMatch(/\{\{[A-Z_]+\}\}/); // No leftover tokens.
  });

  it('sitemap and robots receive the URL token', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    const prompter = new ScriptedPrompter(STANDARD_ANSWERS);
    await runInitCommand({ cwd: '/proj' }, { fs, prompter });

    const sitemap = fs.readFile('/proj/app/sitemap.ts') ?? '';
    expect(sitemap).toContain("baseUrl: 'https://acme.com'");
    expect(sitemap).not.toContain('{{URL}}');

    const robots = fs.readFile('/proj/app/robots.ts') ?? '';
    expect(robots).toContain('https://acme.com/sitemap.xml');
    expect(robots).not.toContain('{{URL}}');
  });
});

describe('runInitCommand — overwrite prompts', () => {
  it('skips a file when the user declines overwrite', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    fs.writeFileSync('/proj/app/about/page.tsx', '// pre-existing about');

    // 3 text answers + 1 confirm = decline overwrite of about.
    const prompter = new ScriptedPrompter([...STANDARD_ANSWERS, false]);
    const result = await runInitCommand({ cwd: '/proj' }, { fs, prompter });

    expect(result.skipped).toContain('app/about/page.tsx');
    expect(result.written).not.toContain('app/about/page.tsx');
    // Original content preserved.
    expect(fs.readFile('/proj/app/about/page.tsx')).toBe('// pre-existing about');
  });

  it('overwrites a file when the user accepts', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    fs.writeFileSync('/proj/app/about/page.tsx', '// pre-existing about');

    const prompter = new ScriptedPrompter([...STANDARD_ANSWERS, true]);
    const result = await runInitCommand({ cwd: '/proj' }, { fs, prompter });

    expect(result.written).toContain('app/about/page.tsx');
    const after = fs.readFile('/proj/app/about/page.tsx') ?? '';
    expect(after).toContain('About Acme');
  });
});
