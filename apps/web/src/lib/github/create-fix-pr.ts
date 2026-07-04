import 'server-only';
import type { EditSet } from '@/lib/edits/types';

/**
 * Turn a validated EditSet into a real GitHub pull request.
 *
 * Narrow client interface (matches Octokit's `request`) so the whole
 * flow is unit-testable and the Week-2 exit test only needs to swap in
 * the App's installation Octokit. PR hygiene rules (§10.5) live HERE,
 * not in callers: hard cap of 5 open AnswerFox PRs per repo, one
 * finding = one PR, branch names are namespaced and deterministic.
 */

export interface GitHubClient {
  request(route: string, params?: Record<string, unknown>): Promise<{ data: unknown }>;
}

export interface CreateFixPrInput {
  readonly owner: string;
  readonly repo: string;
  readonly editSet: EditSet;
  /** Post-edit content for every touched file (from applyEditSet). */
  readonly files: ReadonlyMap<string, string>;
  /** Correlation id; also disambiguates the branch name. */
  readonly requestId: string;
}

export type CreateFixPrResult =
  | {
      readonly ok: true;
      readonly prNumber: number;
      readonly prUrl: string;
      readonly branch: string;
    }
  | { readonly ok: false; readonly reason: string };

export const MAX_OPEN_PRS = 5;
export const BRANCH_PREFIX = 'answerfox/';

export function fixBranchName(editSet: EditSet, requestId: string): string {
  const slug = editSet.checkId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `${BRANCH_PREFIX}fix-${slug}-${requestId.slice(0, 8)}`;
}

export async function createFixPr(
  client: GitHubClient,
  input: CreateFixPrInput,
): Promise<CreateFixPrResult> {
  const { owner, repo, editSet, files, requestId } = input;
  if (files.size === 0) return { ok: false, reason: 'EditSet produced no files.' };

  // PR hygiene cap: count open PRs whose head branch is ours.
  const openPrs = (await client.request('GET /repos/{owner}/{repo}/pulls', {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  })) as { data: Array<{ head?: { ref?: string } }> };
  const ours = openPrs.data.filter((pr) => pr.head?.ref?.startsWith(BRANCH_PREFIX)).length;
  if (ours >= MAX_OPEN_PRS) {
    return {
      ok: false,
      reason: `PR cap reached: ${ours} open AnswerFox PRs (max ${MAX_OPEN_PRS}). Merge or close one first.`,
    };
  }

  const repoInfo = (await client.request('GET /repos/{owner}/{repo}', { owner, repo })) as {
    data: { default_branch: string };
  };
  const baseBranch = repoInfo.data.default_branch;

  const baseRef = (await client.request('GET /repos/{owner}/{repo}/git/ref/{ref}', {
    owner,
    repo,
    ref: `heads/${baseBranch}`,
  })) as { data: { object: { sha: string } } };
  const baseSha = baseRef.data.object.sha;

  const branch = fixBranchName(editSet, requestId);
  await client.request('POST /repos/{owner}/{repo}/git/refs', {
    owner,
    repo,
    ref: `refs/heads/${branch}`,
    sha: baseSha,
  });

  // One commit per file via the contents API: small sets (1-3 files),
  // and each write stays within the queue's pacing budget.
  for (const [path, content] of files) {
    let existingSha: string | undefined;
    try {
      const existing = (await client.request('GET /repos/{owner}/{repo}/contents/{path}', {
        owner,
        repo,
        path,
        ref: branch,
      })) as { data: { sha?: string } };
      existingSha = existing.data.sha;
    } catch {
      existingSha = undefined; // new file
    }
    await client.request('PUT /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
      branch,
      message: `${editSet.title} (${editSet.checkId})`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      ...(existingSha ? { sha: existingSha } : {}),
    });
  }

  const pr = (await client.request('POST /repos/{owner}/{repo}/pulls', {
    owner,
    repo,
    title: editSet.title,
    head: branch,
    base: baseBranch,
    body: `${editSet.description}\n\n---\nFinding \`${editSet.checkId}\` · opened by AnswerFox · one finding, one PR. Merging triggers a re-audit that comments the before/after score.`,
  })) as { data: { number: number; html_url: string } };

  return { ok: true, prNumber: pr.data.number, prUrl: pr.data.html_url, branch };
}
