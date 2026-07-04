import { Inngest, eventType, staticSchema } from 'inngest';

/**
 * Payload for a fix-PR request. Producers (webhook route, audit
 * pipeline) and the queue consumer share this one definition.
 */
export interface FixPrRequestedData extends Record<string, unknown> {
  /** GitHub App installation the PR belongs to — the queue key. */
  installationId: number;
  /** e.g. "acme/docs" */
  repoFullName: string;
  /** Repo-relative file the fix targets (from stack detection / audit). */
  targetPath: string;
  /** Audit check that produced the finding, e.g. "C2". */
  checkId: string;
  /** Human-readable finding description for the fix prompt. */
  description: string;
  /** Recommended fix direction, if the check provides one. */
  fixRecommendation: string | null;
  /** Evidence string from the audit, if any. */
  evidence: string | null;
  /** The audited site URL, for prompt context. */
  siteUrl: string;
  /** Correlation id for logs, the dashboard, and the branch name. */
  requestId: string;
}

/**
 * Typed event definition (Inngest v4). Used both as the function
 * trigger and for `inngest.send(fixPrRequested.create({...}))`.
 * Proof-of-fix (week 3) and drift guard (week 6) add theirs here.
 */
export const fixPrRequested = eventType('answerfox/fix-pr.requested', {
  schema: staticSchema<FixPrRequestedData>(),
});

/** Payload for a Proof-of-Fix re-audit after one of our PRs merges. */
export interface ProofRequestedData extends Record<string, unknown> {
  installationId: number;
  /** e.g. "acme/docs" */
  repoFullName: string;
  prNumber: number;
  /** The audited site URL to re-score. */
  siteUrl: string;
  /** The check the merged PR fixed, e.g. "C2". */
  checkId: string;
  /** Score recorded before the fix (latest audit prior to merge). */
  beforeScore: number;
}

export const proofRequested = eventType('answerfox/proof.requested', {
  schema: staticSchema<ProofRequestedData>(),
});

/** Payload for a Drift Guard check after a deploy/push landed. */
export interface DriftCheckRequestedData extends Record<string, unknown> {
  installationId: number;
  /** e.g. "acme/docs" */
  repoFullName: string;
  /** The linked site to re-audit. */
  siteUrl: string;
  /** Score from the last known-good audit. */
  priorScore: number;
  /** Check ids already failing before this deploy. */
  priorFailedCheckIds: string[];
  /** What fired the check. */
  source: 'deployment' | 'push' | 'cron';
}

export const driftCheckRequested = eventType('answerfox/drift-check.requested', {
  schema: staticSchema<DriftCheckRequestedData>(),
});

/**
 * Free tier: 50K step-runs/month. Keys (INNGEST_EVENT_KEY,
 * INNGEST_SIGNING_KEY) are only required in production; the local dev
 * server (`npx inngest-cli dev`) runs keyless.
 */
export const inngest = new Inngest({ id: 'answerfox' });
