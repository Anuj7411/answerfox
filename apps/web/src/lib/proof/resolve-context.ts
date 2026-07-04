import 'server-only';

/**
 * Resolve the linked site + last-known-audit state for a repo. Used by
 * Proof-of-Fix (merge -> re-audit -> comment) and Drift Guard
 * (deploy -> re-audit -> alert-with-PR).
 *
 * The repo<->site association is created in the dashboard during
 * onboarding (Week 7: install<->payment-link linking). Until that
 * association exists this returns null, and the webhook route
 * correctly SKIPS both flows — an event on a repo with no linked site
 * has nothing to re-audit. Wiring the real lookup (site by repo,
 * latest audit's score + failed check ids) is a one-function change
 * once the association column lands.
 */

export interface RepoSiteContext {
  readonly siteUrl: string;
  readonly beforeScore: number;
  /** Check ids failing in the last known audit. */
  readonly priorFailedCheckIds: readonly string[];
}

export async function resolveRepoContext(_repoFullName: string): Promise<RepoSiteContext | null> {
  return null;
}

/** Back-compat alias used by the proof flow. */
export const resolveProofContext = resolveRepoContext;
