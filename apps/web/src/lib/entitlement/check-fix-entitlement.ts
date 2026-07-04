import 'server-only';
import { consumeFreeLoopIfAvailable } from '@/lib/db/mutations/entitlement';
import { getSiteEntitlementState } from '@/lib/db/queries/entitlement';
import type { GitHubClient } from '@/lib/github/create-fix-pr';
import { type EntitlementDecision, decideFixEntitlement } from './decide-entitlement';

/**
 * Real (DB + live GitHub) entitlement check for one fix-PR request.
 * Repo visibility is read live from GitHub rather than the
 * `github_repositories` cache — that table is only populated by
 * webhook delivery, which may not be wired yet for a given repo, and
 * getting entitlement wrong (in either direction) is a money bug.
 *
 * A repo with no linked site (dashboard onboarding hasn't run) is
 * always allowed — entitlement only applies once a customer has
 * actually connected a site, matching how Proof-of-Fix and Drift Guard
 * already treat "no site linked" as out of scope rather than blocked.
 */
export async function checkFixEntitlement(
  client: GitHubClient,
  owner: string,
  repo: string,
): Promise<EntitlementDecision> {
  const repoFullName = `${owner}/${repo}`;
  const state = await getSiteEntitlementState(repoFullName);
  if (state === null) {
    return { allowed: true, consumesFreeLoop: false };
  }

  const repoInfo = (await client.request('GET /repos/{owner}/{repo}', { owner, repo })) as {
    data: { private: boolean };
  };

  const decision = decideFixEntitlement({
    repoIsPrivate: repoInfo.data.private,
    plan: state.plan,
    freeLoopConsumedAt: state.freeLoopConsumedAt,
  });

  if (decision.allowed && decision.consumesFreeLoop) {
    const consumed = await consumeFreeLoopIfAvailable(state.siteId);
    if (!consumed) {
      // Lost the race to a concurrent request that consumed it first.
      return {
        allowed: false,
        reason: 'Free loop already used on this private repo (consumed concurrently).',
      };
    }
  }

  return decision;
}
