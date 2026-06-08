import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g3ApiCatalog } from './g3-api-catalog.js';

const URL = parseAbsoluteUrl('https://api.example.com/v1/things');
const HTML = '<html></html>';

describe('G3 — API Catalog (RFC 9727) present', () => {
  it('passes when valid JSON linkset is served at the origin', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      expect(url).toBe('https://api.example.com/.well-known/api-catalog');
      return new Response(
        '{"linkset":[{"anchor":"https://api.example.com/v1","service-desc":[{"href":"https://api.example.com/openapi.json","type":"application/json"}]}]}',
        { status: 200 },
      );
    });
    const result = await g3ApiCatalog.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    const result = await g3ApiCatalog.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('RFC 9727');
    vi.unstubAllGlobals();
  });
});
