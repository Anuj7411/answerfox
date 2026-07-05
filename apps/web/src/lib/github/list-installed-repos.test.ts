import { describe, expect, it } from 'vitest';
import { listInstalledRepos } from './list-installed-repos';

function repo(id: number) {
  return { id, full_name: `acme/repo-${id}`, private: id % 2 === 0, default_branch: 'main' };
}

describe('listInstalledRepos', () => {
  it('maps a single page of repos', async () => {
    const client = {
      request: async () => ({ data: { repositories: [repo(1), repo(2)] } }),
    };
    const repos = await listInstalledRepos(client);
    expect(repos).toEqual([
      { repoId: 1, fullName: 'acme/repo-1', private: false, defaultBranch: 'main' },
      { repoId: 2, fullName: 'acme/repo-2', private: true, defaultBranch: 'main' },
    ]);
  });

  it('follows pagination across multiple pages', async () => {
    let calls = 0;
    const client = {
      request: async (_route: string, params?: Record<string, unknown>) => {
        calls += 1;
        const page = (params?.page as number) ?? 1;
        if (page === 1)
          return { data: { repositories: Array.from({ length: 100 }, (_, i) => repo(i)) } };
        if (page === 2) return { data: { repositories: [repo(100)] } };
        return { data: { repositories: [] } };
      },
    };
    const repos = await listInstalledRepos(client);
    expect(repos).toHaveLength(101);
    expect(calls).toBe(2); // stops once a short page is seen
  });

  it('returns an empty list for an installation with no repos', async () => {
    const client = { request: async () => ({ data: { repositories: [] } }) };
    expect(await listInstalledRepos(client)).toEqual([]);
  });
});
