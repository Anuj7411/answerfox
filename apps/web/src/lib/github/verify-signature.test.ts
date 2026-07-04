import { sign } from '@octokit/webhooks-methods';
import { describe, expect, it } from 'vitest';
import { verifyWebhookSignature } from './verify-signature';

const SECRET = 'test-webhook-secret';
const BODY = JSON.stringify({ action: 'created', installation: { id: 1 } });

describe('verifyWebhookSignature', () => {
  it('accepts a correctly signed body', async () => {
    const signatureHeader = await sign(SECRET, BODY);
    expect(await verifyWebhookSignature({ secret: SECRET, rawBody: BODY, signatureHeader })).toBe(
      true,
    );
  });

  it('rejects a signature made with a different secret', async () => {
    const signatureHeader = await sign('wrong-secret', BODY);
    expect(await verifyWebhookSignature({ secret: SECRET, rawBody: BODY, signatureHeader })).toBe(
      false,
    );
  });

  it('rejects a tampered body', async () => {
    const signatureHeader = await sign(SECRET, BODY);
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        rawBody: `${BODY} `,
        signatureHeader,
      }),
    ).toBe(false);
  });

  it('rejects a missing or malformed signature header', async () => {
    expect(
      await verifyWebhookSignature({ secret: SECRET, rawBody: BODY, signatureHeader: null }),
    ).toBe(false);
    expect(
      await verifyWebhookSignature({ secret: SECRET, rawBody: BODY, signatureHeader: 'sha1=abc' }),
    ).toBe(false);
    expect(
      await verifyWebhookSignature({
        secret: SECRET,
        rawBody: BODY,
        signatureHeader: 'sha256=not-hex',
      }),
    ).toBe(false);
  });

  it('rejects everything when the secret is empty (misconfiguration)', async () => {
    const signatureHeader = await sign(SECRET, BODY);
    expect(await verifyWebhookSignature({ secret: '', rawBody: BODY, signatureHeader })).toBe(
      false,
    );
  });
});
