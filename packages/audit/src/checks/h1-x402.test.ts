import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { h1X402 } from './h1-x402.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('H1 — x402 capability', () => {
  it('passes when /.well-known/x402 manifest is served', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/.well-known/x402');
      return new Response(
        JSON.stringify({ endpoint: 'https://api.example.com/x402', chains: ['base-mainnet'] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });
    const result = await h1X402.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('manifest present');
    vi.unstubAllGlobals();
  });

  it('passes when X-Payment-Required header is set', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const h = new Headers();
    h.set('X-Payment-Required', 'x402');
    const result = await h1X402.run({ url: URL, html: HTML, dom: loadHtml(HTML), headers: h });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('X-Payment-Required');
    vi.unstubAllGlobals();
  });

  it('fails when no signal is present', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const result = await h1X402.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('x402');
    vi.unstubAllGlobals();
  });

  it('fails on network error fetching the manifest', async () => {
    mockFetch(async () => {
      throw new Error('ECONNREFUSED');
    });
    const result = await h1X402.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    vi.unstubAllGlobals();
  });
});
