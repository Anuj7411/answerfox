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
  // Use a wide slice of the requestId: 8 hex chars is only ~32 bits and
  // collides sooner than uniform math suggests once ids share prefixes.
  const suffix = requestId.replace(/[^a-zA-Z0-9]+/g, '').slice(0, 16);
  return `${BRANCH_PREFIX}fix-${slug}-${suffix}`;
}

/** Count open AnswerFox PRs across ALL pages, not just the first 100. */
async function countOpenAnswerfoxPrs(
  client: GitHubClient,
  owner: string,
  repo: string,
): Promise<number> {
  let ours = 0;
  // Safety bound: 20 pages = 2000 open PRs. Beyond that the repo has
  // bigger problems than our cap; treat it as "at cap" by returning a
  // large count so we refuse rather than spam.
  for (let page = 1; page <= 20; page++) {
    const resp = (await client.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'open',
      per_page: 100,
      page,
    })) as { data: Array<{ head?: { ref?: string } }> };
    ours += resp.data.filter((pr) => pr.head?.ref?.startsWith(BRANCH_PREFIX)).length;
    if (resp.data.length < 100) return ours;
  }
  return Number.MAX_SAFE_INTEGER;
}

export async function createFixPr(
  client: GitHubClient,
  input: CreateFixPrInput,
): Promise<CreateFixPrResult> {
  const { owner, repo, editSet, files, requestId } = input;
  if (files.size === 0) return { ok: false, reason: 'EditSet produced no files.' };

  // PR hygiene cap: count open PRs whose head branch is ours.
  const ours = await countOpenAnswerfoxPrs(client, owner, repo);
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
  try {
    await client.request('POST /repos/{owner}/{repo}/git/refs', {
      owner,
      repo,
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });
  } catch (err) {
    // 422 = "Reference already exists". This is the queue-retry path
    // (a partial run created the ref, then a later step failed and
    // Inngest re-invoked us). Deterministic branch name means reusing
    // it is correct; the per-file PUTs below are themselves idempotent.
    const status = (err as { status?: number }).status;
    if (status !== 422) throw err;
  }

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

  const body = `${editSet.description}\n\n---\nFinding \`${editSet.checkId}\` · opened by AnswerFox · one finding, one PR. Merging triggers a re-audit that comments the before/after score.`;
  try {
    const pr = (await client.request('POST /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      title: editSet.title,
      head: branch,
      base: baseBranch,
      body,
    })) as { data: { number: number; html_url: string } };
    return { ok: true, prNumber: pr.data.number, prUrl: pr.data.html_url, branch };
  } catch (err) {
    // 422 on create = a PR for this head already exists (queue retry).
    // Look it up and return it so the retry is a no-op success.
    if ((err as { status?: number }).status !== 422) throw err;
    const existing = (await client.request('GET /repos/{owner}/{repo}/pulls', {
      owner,
      repo,
      state: 'open',
      head: `${owner}:${branch}`,
    })) as { data: Array<{ number: number; html_url: string }> };
    const found = existing.data[0];
    if (found === undefined) {
      return { ok: false, reason: 'PR creation returned 422 but no open PR found for the branch.' };
    }
    return { ok: true, prNumber: found.number, prUrl: found.html_url, branch };
  }
}
