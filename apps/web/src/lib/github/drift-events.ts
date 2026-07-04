/**
 * Pure detector for Drift Guard triggers (hero H4): a deploy landed,
 * so the live site may have regressed. Two signals:
 *
 * - `deployment_status` with state "success" — the canonical "a deploy
 *   just went live" event for repos wired to a deploy platform.
 * - `push` to the repo's default branch — the fallback for repos that
 *   deploy on push without reporting deployments.
 *
 * Pushes to OUR OWN fix branches are ignored (they are not deploys),
 * as is anything without an installation. No I/O here.
 */

export interface DriftTrigger {
  readonly installationId: number;
  readonly repoFullName: string;
  /** What fired it, for logs and the alert body. */
  readonly source: 'deployment' | 'push';
}

interface RawDriftPayload {
  installation?: { id?: unknown };
  repository?: { full_name?: unknown; default_branch?: unknown };
  deployment_status?: { state?: unknown };
  ref?: unknown;
}

export function detectDriftTrigger(eventName: string, payload: unknown): DriftTrigger | null {
  if (typeof payload !== 'object' || payload === null) return null;
  const p = payload as RawDriftPayload;

  const installationId = p.installation?.id;
  const repoFullName = p.repository?.full_name;
  if (typeof installationId !== 'number' || typeof repoFullName !== 'string') return null;

  if (eventName === 'deployment_status') {
    if (p.deployment_status?.state !== 'success') return null;
    return { installationId, repoFullName, source: 'deployment' };
  }

  if (eventName === 'push') {
    const ref = p.ref;
    const defaultBranch = p.repository?.default_branch;
    if (typeof ref !== 'string' || typeof defaultBranch !== 'string') return null;
    if (ref !== `refs/heads/${defaultBranch}`) return null;
    return { installationId, repoFullName, source: 'push' };
  }

  return null;
}
