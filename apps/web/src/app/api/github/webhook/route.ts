import { applyWebhookAction } from '@/lib/db/mutations/github-installations';
import { detectDriftTrigger } from '@/lib/github/drift-events';
import { detectProofTrigger } from '@/lib/github/proof-events';
import { verifyWebhookSignature } from '@/lib/github/verify-signature';
import { mapWebhookToActions } from '@/lib/github/webhook-events';
import { driftCheckRequested, inngest, proofRequested } from '@/lib/inngest/client';
import { resolveRepoContext } from '@/lib/proof/resolve-context';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The single GitHub App webhook route (plain Octokit, no Probot).
 *
 * Order matters: read the RAW body first, verify the HMAC signature on
 * those exact bytes, and only then JSON-parse. Unknown-but-valid
 * events return 202 so GitHub marks the delivery green and never
 * retries; invalid signatures return 401 with no detail.
 */
export async function POST(request: Request) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET ?? '';
  if (secret.length === 0) {
    // Misconfiguration is a server problem, not the caller's.
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }

  const rawBody = await request.text();
  const signatureOk = await verifyWebhookSignature({
    secret,
    rawBody,
    signatureHeader: request.headers.get('x-hub-signature-256'),
  });
  if (!signatureOk) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const eventName = request.headers.get('x-github-event') ?? '';
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const actions = mapWebhookToActions(eventName, payload);
  for (const action of actions) {
    await applyWebhookAction(action);
  }

  // Proof-of-Fix: a merged fix-PR triggers a re-audit + score comment.
  let proofEnqueued = false;
  const trigger = detectProofTrigger(eventName, payload);
  if (trigger !== null && trigger.checkId !== null) {
    const context = await resolveRepoContext(trigger.repoFullName);
    if (context !== null) {
      await inngest.send(
        proofRequested.create({
          installationId: trigger.installationId,
          repoFullName: trigger.repoFullName,
          prNumber: trigger.prNumber,
          siteUrl: context.siteUrl,
          checkId: trigger.checkId,
          beforeScore: context.beforeScore,
        }),
      );
      proofEnqueued = true;
    }
  }

  // Drift Guard: a deploy/default-branch push triggers a re-audit; any
  // regression enqueues its fix-PR (debounced downstream per repo).
  let driftEnqueued = false;
  const drift = detectDriftTrigger(eventName, payload);
  if (drift !== null) {
    const context = await resolveRepoContext(drift.repoFullName);
    if (context !== null) {
      await inngest.send(
        driftCheckRequested.create({
          installationId: drift.installationId,
          repoFullName: drift.repoFullName,
          siteUrl: context.siteUrl,
          priorScore: context.beforeScore,
          priorFailedCheckIds: [...context.priorFailedCheckIds],
          source: drift.source,
        }),
      );
      driftEnqueued = true;
    }
  }

  return NextResponse.json(
    { applied: actions.length, proofEnqueued, driftEnqueued },
    { status: 202 },
  );
}
