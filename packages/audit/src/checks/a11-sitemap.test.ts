import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { a11Sitemap } from './a11-sitemap.js';

const URL = parseAbsoluteUrl('https://example.com/blog/post');
const HTML = '<html></html>';

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

const VALID_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/</loc></url></urlset>';

const VALID_SITEMAPINDEX =
  '<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://example.com/sitemap-pages.xml</loc></sitemap></sitemapindex>';

describe('A11 — sitemap.xml present', () => {
  it('passes when a valid urlset is served at /sitemap.xml', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/sitemap.xml');
      return new Response(VALID_URLSET, {
        status: 200,
        headers: { 'Content-Type': 'application/xml' },
      });
    });
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('urlset');
    vi.unstubAllGlobals();
  });

  it('passes on a valid sitemapindex', async () => {
    mockFetch(async () => new Response(VALID_SITEMAPINDEX, { status: 200 }));
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('sitemapindex');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('not found', { status: 404 }));
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('sitemap');
    vi.unstubAllGlobals();
  });

  it('warns on 200 with empty body', async () => {
    mockFetch(async () => new Response('', { status: 200 }));
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('empty');
    vi.unstubAllGlobals();
  });

  it('warns on 200 with body that lacks urlset or sitemapindex', async () => {
    mockFetch(async () => new Response('<html><body>not a sitemap</body></html>', { status: 200 }));
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('does not contain');
    vi.unstubAllGlobals();
  });

  it('warns on 5xx', async () => {
    mockFetch(async () => new Response('boom', { status: 503 }));
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('503');
    vi.unstubAllGlobals();
  });

  it('fails on network error', async () => {
    mockFetch(async () => {
      throw new Error('ENOTFOUND');
    });
    const result = await a11Sitemap.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.evidence).toContain('ENOTFOUND');
    vi.unstubAllGlobals();
  });
});
