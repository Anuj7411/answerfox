import 'server-only';
import type { GitHubClient } from '@/lib/github/create-fix-pr';
import { formatProofComment, proofCommentMarker } from './score-comment';

/**
 * Proof-of-Fix orchestrator: after one of our PRs merges, re-audit the
 * live site and post the before/after score as a sticky PR comment.
 * The audit function is injected so this is testable without hitting a
 * real site, and so the same code works whether the audit runs in-proc
 * or via the engine package.
 */

export type AuditFn = (siteUrl: string) => Promise<{ score: number }>;

export interface RunProofInput {
  readonly owner: string;
  readonly repo: string;
  readonly prNumber: number;
  readonly siteUrl: string;
  readonly checkId: string;
  /** Score recorded before the fix (latest audit prior to merge). */
  readonly beforeScore: number;
}

export type RunProofResult =
  | { readonly stage: 'commented'; readonly before: number; readonly after: number }
  | { readonly stage: 'audit-failed'; readonly reason: string };

/** Find an existing sticky proof comment so we update instead of stacking. */
async function findStickyComment(
  client: GitHubClient,
  owner: string,
  repo: string,
  prNumber: number,
): Promise<number | null> {
  const marker = proofCommentMarker();
  for (let page = 1; page <= 10; page++) {
    const resp = (await client.request('GET /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner,
      repo,
      issue_number: prNumber,
      per_page: 100,
      page,
    })) as { data: Array<{ id: number; body?: string }> };
    const hit = resp.data.find((c) => (c.body ?? '').includes(marker));
    if (hit) return hit.id;
    if (resp.data.length < 100) return null;
  }
  return null;
}

export async function runProof(
  client: GitHubClient,
  input: RunProofInput,
  audit: AuditFn,
): Promise<RunProofResult> {
  let after: number;
  try {
    const result = await audit(input.siteUrl);
    after = result.score;
  } catch (err) {
    return { stage: 'audit-failed', reason: err instanceof Error ? err.message : 'Audit failed.' };
  }

  const body = formatProofComment({
    before: input.beforeScore,
    after,
    checkId: input.checkId,
  });

  const existingId = await findStickyComment(client, input.owner, input.repo, input.prNumber);
  if (existingId !== null) {
    await client.request('PATCH /repos/{owner}/{repo}/issues/comments/{comment_id}', {
      owner: input.owner,
      repo: input.repo,
      comment_id: existingId,
      body,
    });
  } else {
    await client.request('POST /repos/{owner}/{repo}/issues/{issue_number}/comments', {
      owner: input.owner,
      repo: input.repo,
      issue_number: input.prNumber,
      body,
    });
  }

  return { stage: 'commented', before: input.beforeScore, after };
}
