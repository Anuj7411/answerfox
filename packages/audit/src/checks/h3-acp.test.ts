import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { h3Acp } from './h3-acp.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';
const ctx = { url: URL, html: HTML, dom: loadHtml(HTML) };

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('H3 — ACP manifest', () => {
  it('passes when manifest with checkout_endpoint is served', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/.well-known/acp.json');
      return new Response(
        JSON.stringify({
          version: '1',
          checkout_endpoint: 'https://api.example.com/acp/checkout',
        }),
        { status: 200 },
      );
    });
    const result = await h3Acp.run(ctx);
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const result = await h3Acp.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('acp.json');
    vi.unstubAllGlobals();
  });

  it('warns on invalid JSON', async () => {
    mockFetch(async () => new Response('garbage', { status: 200 }));
    const result = await h3Acp.run(ctx);
    expect(result.status).toBe('warn');
    vi.unstubAllGlobals();
  });
});
