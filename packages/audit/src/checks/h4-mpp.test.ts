import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { h4Mpp } from './h4-mpp.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';
const ctx = { url: URL, html: HTML, dom: loadHtml(HTML) };

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('H4 — MPP manifest', () => {
  it('passes when valid manifest is served', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/.well-known/mpp.json');
      return new Response(
        JSON.stringify({ version: '1', session_endpoint: 'https://api.example.com/mpp/session' }),
        { status: 200 },
      );
    });
    const result = await h4Mpp.run(ctx);
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const result = await h4Mpp.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('mpp.json');
    vi.unstubAllGlobals();
  });

  it('warns on invalid JSON', async () => {
    mockFetch(async () => new Response('not json', { status: 200 }));
    const result = await h4Mpp.run(ctx);
    expect(result.status).toBe('warn');
    vi.unstubAllGlobals();
  });
});
