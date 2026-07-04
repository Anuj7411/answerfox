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
  /** Audit check that produced the finding, e.g. "C2". */
  checkId: string;
  /** Correlation id for logs and the dashboard. */
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

/**
 * Free tier: 50K step-runs/month. Keys (INNGEST_EVENT_KEY,
 * INNGEST_SIGNING_KEY) are only required in production; the local dev
 * server (`npx inngest-cli dev`) runs keyless.
 */
export const inngest = new Inngest({ id: 'answerfox' });
