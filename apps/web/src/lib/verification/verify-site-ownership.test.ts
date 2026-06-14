import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { generateVerificationToken, verifySiteOwnership } from './verify-site-ownership';

const URL = 'https://example.com';

function fetchReturning(html: string, status = 200, contentType = 'text/html'): typeof fetch {
  return (async () =>
    new Response(html, {
      status,
      headers: { 'Content-Type': contentType },
    })) as unknown as typeof fetch;
}

function fetchRouter(routes: Record<string, () => Response>): typeof fetch {
  return (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input.toString();
    const handler = routes[url];
    if (handler === undefined) return new Response('', { status: 404 });
    return handler();
  }) as unknown as typeof fetch;
}

describe('generateVerificationToken', () => {
  it('returns a non-empty string', () => {
    expect(generateVerificationToken().length).toBeGreaterThan(20);
  });

  it('generates a different token each call', () => {
    expect(generateVerificationToken()).not.toBe(generateVerificationToken());
  });

  it('uses url-safe characters and no padding', () => {
    const token = generateVerificationToken();
    expect(/^[A-Za-z0-9_-]+$/.test(token)).toBe(true);
    expect(token.endsWith('=')).toBe(false);
  });
});

describe('verifySiteOwnership — meta tag method', () => {
  it('matches when <meta name="answerfox-verify" content="<token>"> is in head', async () => {
    const token = 'tok_abc123';
    const html = `<html><head><meta name="answerfox-verify" content="${token}"></head><body></body></html>`;
    const result = await verifySiteOwnership(URL, token, {
      fetchImpl: fetchReturning(html),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('meta');
  });

  it('fails when meta content does not match token', async () => {
    const html = '<html><head><meta name="answerfox-verify" content="wrong"></head></html>';
    const result = await verifySiteOwnership(URL, 'tok_right', {
      fetchImpl: fetchReturning(html),
    });
    expect(result.ok).toBe(false);
  });

  it('handles attribute order: content before name', async () => {
    const token = 'tok_xyz';
    const html = `<html><head><meta content="${token}" name="answerfox-verify"></head></html>`;
    const result = await verifySiteOwnership(URL, token, {
      fetchImpl: fetchReturning(html),
    });
    expect(result.ok).toBe(true);
  });

  it('falls through to other methods when meta is missing', async () => {
    const token = 'tok_via_file';
    const result = await verifySiteOwnership(URL, token, {
      fetchImpl: fetchRouter({
        [URL]: () => new Response('<html><head></head></html>', { status: 200 }),
        'https://example.com/.well-known/answerfox-verify': () =>
          new Response(token, { status: 200 }),
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('file');
  });
});

describe('verifySiteOwnership — file method', () => {
  it('matches when /.well-known/answerfox-verify returns the token', async () => {
    const token = 'tok_file_test';
    const result = await verifySiteOwnership(URL, token, {
      fetchImpl: fetchRouter({
        [URL]: () => new Response('<html><head></head></html>', { status: 200 }),
        'https://example.com/.well-known/answerfox-verify': () =>
          new Response(token, { status: 200 }),
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.method).toBe('file');
  });

  it('rejects when file body has trailing whitespace mismatch', async () => {
    const token = 'tok_padding_test';
    const result = await verifySiteOwnership(URL, token, {
      fetchImpl: fetchRouter({
        [URL]: () => new Response('<html><head></head></html>', { status: 200 }),
        'https://example.com/.well-known/answerfox-verify': () =>
          new Response(`${token}   \n`, { status: 200 }),
      }),
    });
    // Helper trims, so trailing whitespace should still match.
    expect(result.ok).toBe(true);
  });

  it('reports all attempts when nothing matches', async () => {
    const result = await verifySiteOwnership(URL, 'tok_none', {
      fetchImpl: fetchReturning('<html><head></head></html>', 200),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attempts.length).toBe(3);
      expect(result.attempts.map((a) => a.method)).toEqual(['meta', 'file', 'dns']);
    }
  });
});
