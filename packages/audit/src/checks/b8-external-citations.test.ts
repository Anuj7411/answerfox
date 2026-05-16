import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b8ExternalCitations } from './b8-external-citations.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B8 — external citations', () => {
  it('passes when at least one external link is present', async () => {
    const html = '<html><body><a href="https://research.org/paper">Paper</a></body></html>';
    const r = await b8ExternalCitations.run(inputFor(html));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('1');
  });

  it('does not count same-origin absolute links as external', async () => {
    const html = '<html><body><a href="https://example.com/other">Same site</a></body></html>';
    const r = await b8ExternalCitations.run(inputFor(html));
    expect(r.status).toBe('warn');
  });

  it('does not count relative links as external', async () => {
    const html = '<html><body><a href="/page-a">Internal</a></body></html>';
    const r = await b8ExternalCitations.run(inputFor(html));
    expect(r.status).toBe('warn');
  });

  it('warns when no external links exist', async () => {
    const r = await b8ExternalCitations.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('external');
  });

  it('counts multiple distinct external links', async () => {
    const html = `<html><body>
      <a href="https://research.org">Research</a>
      <a href="https://wikipedia.org/wiki/Topic">Wikipedia</a>
    </body></html>`;
    const r = await b8ExternalCitations.run(inputFor(html));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('2');
  });
});
