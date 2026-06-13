import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { g8WebBotAuth } from './g8-web-bot-auth.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

function ctx(opts: { signatureInput?: string; signature?: string }) {
  const h = new Headers();
  if (opts.signatureInput !== undefined) h.set('Signature-Input', opts.signatureInput);
  if (opts.signature !== undefined) h.set('Signature', opts.signature);
  return { url: URL, html: HTML, dom: loadHtml(HTML), headers: h };
}

describe('G8 — Web Bot Auth (RFC 9421)', () => {
  it('passes when both Signature-Input and Signature headers are present', async () => {
    const result = await g8WebBotAuth.run(
      ctx({
        signatureInput: 'sig1=("@authority" "@path");keyid="ed25519-key-1"',
        signature: 'sig1=:base64sig:',
      }),
    );
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('Signature-Input');
  });

  it('warns when only Signature-Input is present', async () => {
    const result = await g8WebBotAuth.run(ctx({ signatureInput: 'sig1=("@authority")' }));
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('Signature-Input');
  });

  it('warns when only Signature is present', async () => {
    const result = await g8WebBotAuth.run(ctx({ signature: 'sig1=:abc:' }));
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('Signature');
  });

  it('fails when neither header is present', async () => {
    const result = await g8WebBotAuth.run(ctx({}));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('RFC 9421');
  });

  it('skips when headers context is absent', async () => {
    const result = await g8WebBotAuth.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('skip');
  });
});
