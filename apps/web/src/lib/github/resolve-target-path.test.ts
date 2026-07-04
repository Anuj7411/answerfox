import { describe, expect, it } from 'vitest';
import { resolveTargetPath } from './resolve-target-path';

function fakeClient(overrides: Record<string, unknown> = {}) {
  const responses: Record<string, unknown> = {
    'GET /repos/{owner}/{repo}': { data: { default_branch: 'main' } },
    'GET /repos/{owner}/{repo}/git/ref/{ref}': { data: { object: { sha: 'tree-sha' } } },
    ...overrides,
  };
  return {
    request: async (route: string) => {
      const r = responses[route];
      if (r instanceof Error) throw r;
      return r as { data: unknown };
    },
  };
}

describe('resolveTargetPath', () => {
  it('detects Next.js from the tree + package.json and returns the real layout file', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}': {
        data: {
          tree: [
            { path: 'package.json', type: 'blob' },
            { path: 'next.config.ts', type: 'blob' },
            { path: 'src/app/layout.tsx', type: 'blob' },
            { path: 'src', type: 'tree' }, // directories should be ignored
          ],
        },
      },
      'GET /repos/{owner}/{repo}/contents/{path}': {
        data: {
          content: Buffer.from(JSON.stringify({ dependencies: { next: '15.0.0' } })).toString(
            'base64',
          ),
        },
      },
    });
    const path = await resolveTargetPath(client, 'acme', 'docs');
    expect(path).toBe('src/app/layout.tsx');
  });

  it('falls back to index.html for an unrecognizable repo', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}': {
        data: {
          tree: [
            { path: 'README.md', type: 'blob' },
            { path: 'main.rs', type: 'blob' },
          ],
        },
      },
    });
    expect(await resolveTargetPath(client, 'acme', 'cli-tool')).toBe('index.html');
  });

  it('tolerates an unreadable package.json instead of throwing', async () => {
    const client = fakeClient({
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}': {
        data: {
          tree: [
            { path: 'package.json', type: 'blob' },
            { path: 'astro.config.mjs', type: 'blob' },
          ],
        },
      },
      'GET /repos/{owner}/{repo}/contents/{path}': new Error('404'),
    });
    expect(await resolveTargetPath(client, 'acme', 'docs')).toBe('src/layouts/Layout.astro');
  });
});
