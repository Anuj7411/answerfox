import { applyWebhookAction } from '@/lib/db/mutations/github-installations';
import { verifyWebhookSignature } from '@/lib/github/verify-signature';
import { mapWebhookToActions } from '@/lib/github/webhook-events';
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

  return NextResponse.json({ applied: actions.length }, { status: 202 });
}
