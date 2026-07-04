import { BRANCH_PREFIX } from './create-fix-pr';

/**
 * Pure detector for the Proof-of-Fix trigger: a `pull_request` webhook
 * where one of OUR fix-PRs was merged. No I/O — the route turns a hit
 * into an `answerfox/proof.requested` queue event. Kept separate from
 * webhook-events.ts (installation handshake) because it feeds the
 * queue, not the DB.
 */

export interface ProofTrigger {
  readonly installationId: number;
  readonly repoFullName: string;
  readonly prNumber: number;
  readonly branch: string;
  /** The check the merged PR fixed, recovered from the branch name. */
  readonly checkId: string | null;
}

interface RawPullRequestPayload {
  action?: unknown;
  installation?: { id?: unknown };
  repository?: { full_name?: unknown };
  pull_request?: {
    number?: unknown;
    merged?: unknown;
    head?: { ref?: unknown };
  };
}

/** Recover the check id from a branch like "answerfox/fix-c2-<id>". */
function checkIdFromBranch(branch: string): string | null {
  const m = branch.match(/^answerfox\/fix-([a-z0-9]+)-/i);
  return m ? (m[1]?.toUpperCase() ?? null) : null;
}

/**
 * Returns a trigger only when: event is `pull_request`, action is
 * `closed`, the PR was actually MERGED (not just closed), and the head
 * branch is one of ours. Everything else returns null (route ACKs 202).
 */
export function detectProofTrigger(eventName: string, payload: unknown): ProofTrigger | null {
  if (eventName !== 'pull_request') return null;
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as RawPullRequestPayload;

  if (p.action !== 'closed') return null;
  if (p.pull_request?.merged !== true) return null;

  const installationId = p.installation?.id;
  const repoFullName = p.repository?.full_name;
  const prNumber = p.pull_request?.number;
  const branch = p.pull_request?.head?.ref;

  if (typeof installationId !== 'number') return null;
  if (typeof repoFullName !== 'string') return null;
  if (typeof prNumber !== 'number') return null;
  if (typeof branch !== 'string' || !branch.startsWith(BRANCH_PREFIX)) return null;

  return {
    installationId,
    repoFullName,
    prNumber,
    branch,
    checkId: checkIdFromBranch(branch),
  };
}
