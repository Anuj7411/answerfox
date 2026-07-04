import type { EditSet } from '@/lib/edits/types';
import { describe, expect, it } from 'vitest';
import { MAX_OPEN_PRS, createFixPr, fixBranchName } from './create-fix-pr';

const editSet: EditSet = {
  checkId: 'C2',
  title: 'fix: add Organization JSON-LD',
  description: 'Adds schema.org Organization markup.',
  edits: [{ kind: 'edit', path: 'src/layout.html', search: 'a', replace: 'b' }],
};

function fakeClient(overrides: Record<string, unknown> = {}) {
  const calls: Array<{ route: string; params?: Record<string, unknown> }> = [];
  const responses: Record<string, unknown> = {
    'GET /repos/{owner}/{repo}/pulls': { data: [] },
    'GET /repos/{owner}/{repo}': { data: { default_branch: 'main' } },
    'GET /repos/{owner}/{repo}/git/ref/{ref}': { data: { object: { sha: 'base-sha' } } },
    'POST /repos/{owner}/{repo}/git/refs': { data: {} },
    'GET /repos/{owner}/{repo}/contents/{path}': { data: { sha: 'old-file-sha' } },
    'PUT /repos/{owner}/{repo}/contents/{path}': { data: {} },
    'POST /repos/{owner}/{repo}/pulls': {
      data: { number: 42, html_url: 'https://github.com/acme/docs/pull/42' },
    },
    ...overrides,
  };
  return {
    calls,
    request: async (route: string, params?: Record<string, unknown>) => {
      calls.push({ route, params });
      const r = responses[route];
      if (r instanceof Error) throw r;
      return r as { data: unknown };
    },
  };
}

const input = {
  owner: 'acme',
  repo: 'docs',
  editSet,
  files: new Map([['src/layout.html', '<html>b</html>']]),
  requestId: 'req-1234567890',
};

describe('createFixPr', () => {
  it('creates branch, commits the file with existing sha, opens the PR', async () => {
    const client = fakeClient();
    const result = await createFixPr(client, input);
    expect(result).toEqual({
      ok: true,
      prNumber: 42,
      prUrl: 'https://github.com/acme/docs/pull/42',
      branch: 'answerfox/fix-c2-req-1234',
    });
    const routes = client.calls.map((c) => c.route);
    expect(routes).toContain('POST /repos/{owner}/{repo}/git/refs');
    const put = client.calls.find((c) => c.route.startsWith('PUT'));
    expect(put?.params?.sha).toBe('old-file-sha');
    expect(put?.params?.branch).toBe('answerfox/fix-c2-req-1234');
    const pr = client.calls.find((c) => c.route === 'POST /repos/{owner}/{repo}/pulls');
    expect(pr?.params?.base).toBe('main');
    expect(String(pr?.params?.body)).toContain('C2');
  });

  it('omits sha for new files (contents GET throws)', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/contents/{path}': new Error('404'),
    });
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(true);
    const put = client.calls.find((c) => c.route.startsWith('PUT'));
    expect(put?.params && 'sha' in put.params).toBe(false);
  });

  it('enforces the 5-open-PR cap without touching the repo', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/pulls': {
        data: Array.from({ length: MAX_OPEN_PRS }, (_, i) => ({
          head: { ref: `answerfox/fix-x-${i}` },
        })),
      },
    });
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('PR cap reached');
    expect(client.calls.some((c) => c.route.startsWith('POST'))).toBe(false);
  });

  it('ignores non-answerfox PRs when counting the cap', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/pulls': {
        data: Array.from({ length: 20 }, () => ({ head: { ref: 'dependabot/npm/x' } })),
      },
    });
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(true);
  });

  it('rejects empty file sets and builds safe branch names', () => {
    expect(fixBranchName(editSet, 'abcdefgh12')).toBe('answerfox/fix-c2-abcdefgh');
  });
});
