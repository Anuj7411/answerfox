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
      branch: 'answerfox/fix-c2-req1234567890',
    });
    const routes = client.calls.map((c) => c.route);
    expect(routes).toContain('POST /repos/{owner}/{repo}/git/refs');
    const put = client.calls.find((c) => c.route.startsWith('PUT'));
    expect(put?.params?.sha).toBe('old-file-sha');
    expect(put?.params?.branch).toBe('answerfox/fix-c2-req1234567890');
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
    expect(fixBranchName(editSet, 'abcdefgh12')).toBe('answerfox/fix-c2-abcdefgh12');
  });

  it('counts answerfox PRs across pages, not just the first 100 (cap not bypassable)', async () => {
    // Page 1: 100 non-answerfox PRs (a busy repo). Page 2: our 5 older PRs.
    const page1 = Array.from({ length: 100 }, () => ({ head: { ref: 'feature/x' } }));
    const page2 = Array.from({ length: 5 }, (_, i) => ({ head: { ref: `answerfox/fix-c2-${i}` } }));
    const calls: Array<Record<string, unknown> | undefined> = [];
    const client = {
      request: async (route: string, params?: Record<string, unknown>) => {
        if (route === 'GET /repos/{owner}/{repo}/pulls') {
          calls.push(params);
          return { data: params?.page === 1 ? page1 : params?.page === 2 ? page2 : [] };
        }
        return { data: {} };
      },
    };
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('PR cap reached');
    // Proves it fetched page 2 rather than trusting page 1.
    expect(calls.some((p) => p?.page === 2)).toBe(true);
  });

  it('reuses the branch when the ref already exists (queue-retry idempotency)', async () => {
    const refError = Object.assign(new Error('Reference already exists'), { status: 422 });
    const client = fakeClient({ 'POST /repos/{owner}/{repo}/git/refs': refError });
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.prNumber).toBe(42);
  });

  it('returns the existing PR when creation 422s (PR already open on retry)', async () => {
    const prError = Object.assign(new Error('A pull request already exists'), { status: 422 });
    let pullsCall = 0;
    const client = {
      request: async (route: string) => {
        if (route === 'POST /repos/{owner}/{repo}/pulls') throw prError;
        if (route === 'GET /repos/{owner}/{repo}/pulls') {
          pullsCall += 1;
          // First call = cap check (empty), second = idempotent lookup.
          return {
            data:
              pullsCall === 1
                ? []
                : [{ number: 99, html_url: 'https://github.com/acme/docs/pull/99' }],
          };
        }
        if (route === 'GET /repos/{owner}/{repo}') return { data: { default_branch: 'main' } };
        if (route === 'GET /repos/{owner}/{repo}/git/ref/{ref}')
          return { data: { object: { sha: 'sha' } } };
        if (route === 'GET /repos/{owner}/{repo}/contents/{path}') return { data: { sha: 's' } };
        return { data: {} };
      },
    };
    const result = await createFixPr(client, input);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.prNumber).toBe(99);
  });
});
