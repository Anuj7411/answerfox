import 'server-only';
import { detectStackFromRepo } from '@/lib/stack/detect-stack';
import type { GitHubClient } from './create-fix-pr';

/**
 * Resolve which file a fix should target for a given repo, using real
 * stack detection instead of a hardcoded guess. Lists the repo's file
 * tree + package.json, runs `detectStackFromRepo`, and falls back to
 * `index.html` only when detection can't do better than "unknown" (so
 * callers still have something to try rather than failing outright —
 * `runFixPipeline` itself already handles a missing/unreadable file
 * cleanly via its `no-file` stage).
 */
export async function resolveTargetPath(
  client: GitHubClient,
  owner: string,
  repo: string,
): Promise<string> {
  const repoInfo = (await client.request('GET /repos/{owner}/{repo}', { owner, repo })) as {
    data: { default_branch: string };
  };
  const branchRef = (await client.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
    owner,
    repo,
    ref: `heads/${repoInfo.data.default_branch}`,
  })) as { data: { object: { sha: string } } };

  const tree = (await client.request('GET /repos/{owner}/{repo}/git/trees/{tree_sha}', {
    owner,
    repo,
    tree_sha: branchRef.data.object.sha,
    recursive: '1',
  })) as { data: { tree: Array<{ path?: string; type?: string }> } };
  const paths = tree.data.tree
    .filter((t) => t.type === 'blob' && typeof t.path === 'string')
    .map((t) => t.path as string);

  let packageJson: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  } | null = null;
  if (paths.includes('package.json')) {
    try {
      const pkg = (await client.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path: 'package.json',
      })) as { data: { content: string } };
      packageJson = JSON.parse(Buffer.from(pkg.data.content, 'base64').toString('utf8'));
    } catch {
      packageJson = null; // unreadable package.json shouldn't block detection
    }
  }

  const detection = detectStackFromRepo(paths, packageJson);
  return detection.headFileHint ?? 'index.html';
}
