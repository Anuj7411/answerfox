import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { h2Ucp } from './h2-ucp.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';
const ctx = { url: URL, html: HTML, dom: loadHtml(HTML) };

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('H2 — UCP manifest', () => {
  it('passes when valid manifest with version + endpoint is served', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/.well-known/ucp.json');
      return new Response(
        JSON.stringify({ version: '1', endpoint: 'https://api.example.com/ucp' }),
        { status: 200 },
      );
    });
    const result = await h2Ucp.run(ctx);
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const result = await h2Ucp.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('ucp.json');
    vi.unstubAllGlobals();
  });

  it('warns on invalid JSON', async () => {
    mockFetch(async () => new Response('not json', { status: 200 }));
    const result = await h2Ucp.run(ctx);
    expect(result.status).toBe('warn');
    vi.unstubAllGlobals();
  });

  it('warns on missing required fields', async () => {
    mockFetch(async () => new Response(JSON.stringify({ other: 'thing' }), { status: 200 }));
    const result = await h2Ucp.run(ctx);
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('missing');
    vi.unstubAllGlobals();
  });
});
