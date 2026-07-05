import 'server-only';
import type { GitHubClient } from './create-fix-pr';

export interface InstalledRepo {
  readonly repoId: number;
  readonly fullName: string;
  readonly private: boolean;
  readonly defaultBranch: string;
}

/**
 * List the repos an installation actually grants access to, straight
 * from GitHub (not the `github_repositories` cache, which only fills
 * in via webhook delivery). This is what the onboarding repo-picker
 * calls once the design for it exists — decided contract, no UI yet.
 */
export async function listInstalledRepos(client: GitHubClient): Promise<readonly InstalledRepo[]> {
  const repos: InstalledRepo[] = [];
  for (let page = 1; page <= 20; page++) {
    const resp = (await client.request('GET /installation/repositories', {
      per_page: 100,
      page,
    })) as {
      data: {
        repositories: Array<{
          id: number;
          full_name: string;
          private: boolean;
          default_branch: string;
        }>;
      };
    };
    for (const r of resp.data.repositories) {
      repos.push({
        repoId: r.id,
        fullName: r.full_name,
        private: r.private,
        defaultBranch: r.default_branch,
      });
    }
    if (resp.data.repositories.length < 100) break;
  }
  return repos;
}
