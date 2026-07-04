import { verify } from '@octokit/webhooks-methods';

/**
 * Verify a GitHub webhook delivery against the App's webhook secret.
 *
 * GitHub signs the RAW request body with HMAC-SHA256 and sends the hex
 * digest as `x-hub-signature-256: sha256=<hex>`. Verification must run
 * on the exact bytes received — parse the JSON only after this passes.
 *
 * Returns false (never throws) for a missing/malformed signature so
 * the route can answer 401 uniformly without leaking why.
 */
export async function verifyWebhookSignature(args: {
  secret: string;
  rawBody: string;
  signatureHeader: string | null;
}): Promise<boolean> {
  const { secret, rawBody, signatureHeader } = args;
  if (secret.length === 0) return false;
  if (signatureHeader === null || !signatureHeader.startsWith('sha256=')) return false;
  try {
    return await verify(secret, rawBody, signatureHeader);
  } catch {
    return false;
  }
}
