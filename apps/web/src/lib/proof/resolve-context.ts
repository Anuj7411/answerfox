import 'server-only';

/**
 * Resolve the site URL + prior score to re-audit when a repo's fix-PR
 * merges. This depends on a repo<->site association the dashboard
 * creates during onboarding (Week 7: install<->payment-link linking).
 *
 * Until that association exists, this returns null and the webhook
 * route correctly SKIPS the proof re-audit — a merged PR on a repo we
 * have no linked site for has nothing to re-score. Wiring the real
 * lookup here (query sites by repo, read latest audit score) is a
 * one-function change once the association column lands.
 */

export interface ProofContext {
  readonly siteUrl: string;
  readonly beforeScore: number;
}

export async function resolveProofContext(_repoFullName: string): Promise<ProofContext | null> {
  return null;
}
