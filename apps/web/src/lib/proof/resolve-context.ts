import 'server-only';
import { getRepoAuditContext } from '@/lib/db/queries/repo-context';

/**
 * Resolve the linked site + last-known-audit state for a repo. Used by
 * Proof-of-Fix (merge -> re-audit -> comment) and Drift Guard
 * (deploy -> re-audit -> alert-with-PR).
 *
 * Backed by `getRepoAuditContext`: looks up the site whose
 * `repoFullName` matches, then that site's most recent audit. Returns
 * null when no site is linked (dashboard onboarding hasn't happened
 * yet) or the linked site has never been audited — both cases mean
 * there is nothing to diff against, so the webhook route correctly
 * skips the flow rather than firing on incomplete data.
 */

export interface RepoSiteContext {
  readonly siteUrl: string;
  readonly beforeScore: number;
  /** Check ids failing in the last known audit. */
  readonly priorFailedCheckIds: readonly string[];
}

export async function resolveRepoContext(repoFullName: string): Promise<RepoSiteContext | null> {
  return getRepoAuditContext(repoFullName);
}

/** Back-compat alias used by the proof flow. */
export const resolveProofContext = resolveRepoContext;
