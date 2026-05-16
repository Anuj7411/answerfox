import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b11InternalLinks } from './b11-internal-links.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B11 — internal links ≥3', () => {
  it('passes when there are 3+ internal links', async () => {
    const html = `<html><body>
      <a href="/a">A</a><a href="/b">B</a><a href="/c">C</a>
    </body></html>`;
    const r = await b11InternalLinks.run(inputFor(html));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('3');
  });

  it('warns when there are fewer than 3 internal links', async () => {
    const html = '<html><body><a href="/a">A</a></body></html>';
    const r = await b11InternalLinks.run(inputFor(html));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('3');
  });

  it('does not count protocol-relative // links as internal', async () => {
    const html =
      '<html><body><a href="//other.com/page">External via protocol-relative</a></body></html>';
    const r = await b11InternalLinks.run(inputFor(html));
    expect(r.status).toBe('warn');
  });

  it('does not count absolute URLs as internal', async () => {
    const html = '<html><body><a href="https://example.com/a">A</a></body></html>';
    const r = await b11InternalLinks.run(inputFor(html));
    expect(r.status).toBe('warn');
  });
});
