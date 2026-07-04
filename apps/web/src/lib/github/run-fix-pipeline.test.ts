import type { EditGenResult } from '@/lib/ai/generate-edits';
import { describe, expect, it } from 'vitest';
import { runFixPipeline } from './run-fix-pipeline';

const FILE = '<html><head></head><body>Hi</body></html>';

function client(overrides: Record<string, unknown> = {}) {
  const calls: string[] = [];
  const responses: Record<string, unknown> = {
    'GET /repos/{owner}/{repo}/contents/{path}': {
      data: { content: Buffer.from(FILE).toString('base64'), encoding: 'base64' },
    },
    'GET /repos/{owner}/{repo}/pulls': { data: [] },
    'GET /repos/{owner}/{repo}': { data: { default_branch: 'main' } },
    'GET /repos/{owner}/{repo}/git/ref/{ref}': { data: { object: { sha: 'sha' } } },
    'POST /repos/{owner}/{repo}/git/refs': { data: {} },
    'PUT /repos/{owner}/{repo}/contents/{path}': { data: {} },
    'POST /repos/{owner}/{repo}/pulls': {
      data: { number: 7, html_url: 'https://github.com/a/b/pull/7' },
    },
    ...overrides,
  };
  return {
    calls,
    request: async (route: string) => {
      calls.push(route);
      const r = responses[route];
      if (r instanceof Error) throw r;
      return r as { data: unknown };
    },
  };
}

const input = {
  owner: 'a',
  repo: 'b',
  targetPath: 'index.html',
  checkId: 'C2',
  description: 'missing JSON-LD',
  fixRecommendation: 'add it',
  evidence: null,
  siteUrl: 'https://a.dev',
  requestId: 'req-abcdef12',
};

const goodGen = async (): Promise<EditGenResult> => ({
  ok: true,
  editSet: {
    checkId: 'C2',
    title: 'fix: add JSON-LD',
    description: 'd',
    edits: [{ kind: 'edit', path: 'index.html', search: '<head>', replace: '<head><script>' }],
  },
  files: new Map([['index.html', FILE.replace('<head>', '<head><script>')]]),
  diff: 'diff',
  attempts: 1,
  model: 'test',
});

describe('runFixPipeline', () => {
  it('opens a PR when file reads and a valid fix is generated', async () => {
    const c = client();
    const result = await runFixPipeline(c, input, { generate: goodGen });
    expect(result.stage).toBe('pr-opened');
    if (result.stage === 'pr-opened') expect(result.prNumber).toBe(7);
    expect(c.calls).toContain('POST /repos/{owner}/{repo}/pulls');
  });

  it('stops at no-file when the target cannot be read', async () => {
    const c = client({ 'GET /repos/{owner}/{repo}/contents/{path}': new Error('404') });
    const result = await runFixPipeline(c, input, { generate: goodGen });
    expect(result.stage).toBe('no-file');
    expect(c.calls).not.toContain('POST /repos/{owner}/{repo}/pulls');
  });

  it('stops at no-valid-fix and never touches the repo', async () => {
    const c = client();
    const result = await runFixPipeline(c, input, {
      generate: async () => ({ ok: false, attempts: 3, reasons: ['nope'] }),
    });
    expect(result.stage).toBe('no-valid-fix');
    if (result.stage === 'no-valid-fix') expect(result.reasons).toEqual(['nope']);
    expect(c.calls.some((r) => r.startsWith('POST'))).toBe(false);
  });

  it('surfaces pr-failed when the PR cap is hit', async () => {
    const c = client({
      'GET /repos/{owner}/{repo}/pulls': {
        data: Array.from({ length: 5 }, (_, i) => ({ head: { ref: `answerfox/x-${i}` } })),
      },
    });
    const result = await runFixPipeline(c, input, { generate: goodGen });
    expect(result.stage).toBe('pr-failed');
    if (result.stage === 'pr-failed') expect(result.reason).toContain('PR cap');
  });
});
