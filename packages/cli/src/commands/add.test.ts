import { describe, expect, it } from 'vitest';
import { InMemoryFs } from '../install/fs.js';
import { ScriptedPrompter } from '../install/prompter.js';
import { runAddCommand } from './add.js';

function setupNextProject(fs: InMemoryFs, cwd = '/proj') {
  fs.writeFileSync(
    `${cwd}/package.json`,
    JSON.stringify({ name: 'acme-app', dependencies: { next: '^15.0.0' } }),
  );
  fs.mkdirSync(`${cwd}/app`, { recursive: true });
}

describe('runAddCommand — argument validation', () => {
  it('exits 2 when no template names are supplied', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    const result = await runAddCommand([], {}, { fs, prompter: new ScriptedPrompter([]) });
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('at least one');
  });

  it('exits 2 on unknown template name with the available list in the error', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    const result = await runAddCommand(['blog'], {}, { fs, prompter: new ScriptedPrompter([]) });
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('blog');
    expect(result.error).toContain('about');
  });

  it('exits 2 with no Next.js project', async () => {
    const fs = new InMemoryFs();
    const result = await runAddCommand(
      ['about'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('No Next.js project');
  });

  it('still requires Next.js when page and manifest templates are mixed', async () => {
    const fs = new InMemoryFs();
    // No Next.js project, no app/, but project root exists.
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'acme' }));
    const result = await runAddCommand(
      ['about', 'agent-card'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );
    expect(result.exitCode).toBe(2);
    expect(result.error).toContain('No Next.js project');
  });
});

describe('runAddCommand — manifest scaffolding (v0.3.1, framework-agnostic)', () => {
  it('writes a single manifest to public/.well-known/ without a Next.js gate', async () => {
    const fs = new InMemoryFs();
    // No Next.js, no app/ dir. Just a bare project root.
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'acme' }));

    const result = await runAddCommand(
      ['agent-card'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) }, // no prompts expected
    );

    expect(result.exitCode).toBe(0);
    expect(result.written).toEqual(['public/.well-known/agent-card.json']);
    const card = fs.readFile('/proj/public/.well-known/agent-card.json') ?? '';
    expect(card).toContain('TODO Your site or product name');
    expect(card).toContain('"capabilities"');
  });

  it('writes multiple manifests in one call (no prompts)', async () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'acme' }));

    const result = await runAddCommand(
      ['agent-card', 'mcp-server-card', 'agent-permissions'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );

    expect(result.exitCode).toBe(0);
    expect(result.written).toEqual([
      'public/.well-known/agent-card.json',
      'public/.well-known/mcp/server-card.json',
      'public/.well-known/agent-permissions.json',
    ]);
  });

  it('writes the agent-permissions policy with the default allow/deny shape', async () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'acme' }));

    const result = await runAddCommand(
      ['agent-permissions'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );

    expect(result.exitCode).toBe(0);
    const policy = fs.readFile('/proj/public/.well-known/agent-permissions.json') ?? '';
    expect(policy).toContain('"allow"');
    expect(policy).toContain('"deny"');
    expect(policy).toContain('ChatGPT-User');
  });

  it('writes oauth-discovery with the RFC 8414 required fields', async () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', JSON.stringify({ name: 'acme' }));

    const result = await runAddCommand(
      ['oauth-discovery'],
      { cwd: '/proj' },
      { fs, prompter: new ScriptedPrompter([]) },
    );

    expect(result.exitCode).toBe(0);
    const doc = fs.readFile('/proj/public/.well-known/oauth-authorization-server') ?? '';
    expect(doc).toContain('"issuer"');
    expect(doc).toContain('"authorization_endpoint"');
    expect(doc).toContain('"token_endpoint"');
  });
});

describe('runAddCommand — happy path', () => {
  it('installs a single about page with only the tokens it needs', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    // about needs: PROJECT_NAME, DOMAIN, URL, DESCRIPTION (DESCRIPTION is derived).
    const prompter = new ScriptedPrompter(['Acme', 'acme.com']);
    const result = await runAddCommand(['about'], { cwd: '/proj' }, { fs, prompter });

    expect(result.exitCode).toBe(0);
    expect(result.written).toEqual(['app/about/page.tsx']);
    const about = fs.readFile('/proj/app/about/page.tsx') ?? '';
    expect(about).toContain('About Acme');
    expect(about).toContain('https://acme.com');
    expect(about).not.toMatch(/\{\{[A-Z_]+\}\}/);
  });

  it('installs multiple templates with one prompt set covering the token union', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    // about + faq union: PROJECT_NAME, DOMAIN/URL, CONTACT_EMAIL, DESCRIPTION (derived).
    const prompter = new ScriptedPrompter(['Acme', 'acme.com', 'hello@acme.com']);
    const result = await runAddCommand(['about', 'faq'], { cwd: '/proj' }, { fs, prompter });

    expect(result.exitCode).toBe(0);
    expect(result.written).toEqual(['app/about/page.tsx', 'app/faq/page.tsx']);
  });

  it('does not prompt for tokens unrelated to the selected templates', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    // contact needs: PROJECT_NAME, URL (so DOMAIN too), CONTACT_EMAIL. No EFFECTIVE_DATE.
    // If we accidentally prompted for EFFECTIVE_DATE, ScriptedPrompter would run out of answers.
    const prompter = new ScriptedPrompter(['Acme', 'acme.com', 'hello@acme.com']);
    const result = await runAddCommand(['contact'], { cwd: '/proj' }, { fs, prompter });
    expect(result.exitCode).toBe(0);
    expect(result.written).toEqual(['app/contact/page.tsx']);
  });

  it('skips existing files when overwrite declined', async () => {
    const fs = new InMemoryFs();
    setupNextProject(fs);
    fs.writeFileSync('/proj/app/about/page.tsx', '// pre-existing');
    const prompter = new ScriptedPrompter(['Acme', 'acme.com', false]);
    const result = await runAddCommand(['about'], { cwd: '/proj' }, { fs, prompter });
    expect(result.skipped).toEqual(['app/about/page.tsx']);
    expect(result.written).toEqual([]);
  });
});
