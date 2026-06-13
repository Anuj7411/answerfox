import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { a12LinkHeaders } from './a12-link-headers.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

function ctx(linkHeader: string | null) {
  const h = new Headers();
  if (linkHeader !== null) h.set('Link', linkHeader);
  return { url: URL, html: HTML, dom: loadHtml(HTML), headers: h };
}

describe('A12 — RFC 8288 Link headers', () => {
  it('passes when a Link header with rel= is present', async () => {
    const result = await a12LinkHeaders.run(ctx('<https://example.com/page>; rel="canonical"'));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('1 rel-tagged');
  });

  it('passes with multiple rel-tagged entries', async () => {
    const link =
      '<https://example.com/page>; rel="canonical", <https://example.com/feed>; rel="alternate"; type="application/rss+xml"';
    const result = await a12LinkHeaders.run(ctx(link));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('2 rel-tagged');
  });

  it('warns on a Link header without rel attribute', async () => {
    const result = await a12LinkHeaders.run(ctx('<https://example.com/page>'));
    expect(result.status).toBe('warn');
  });

  it('fails when no Link header is present', async () => {
    const result = await a12LinkHeaders.run(ctx(null));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('RFC 8288');
  });

  it('skips when headers are absent (fixture test path)', async () => {
    const result = await a12LinkHeaders.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('skip');
  });
});
