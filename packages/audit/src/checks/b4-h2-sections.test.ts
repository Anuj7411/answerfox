import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b4H2Sections } from './b4-h2-sections.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B4 — h2 sections on long pages', () => {
  it('passes short pages regardless of h2 count', async () => {
    const r = await b4H2Sections.run(inputFor('<html><body><p>Short.</p></body></html>'));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('short');
  });

  it('passes long pages with ≥2 h2 sections', async () => {
    const filler = 'word '.repeat(400); // ~2000 chars
    const html = `<html><body><h2>One</h2><p>${filler}</p><h2>Two</h2></body></html>`;
    const r = await b4H2Sections.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('warns on long pages with fewer than 2 h2 sections', async () => {
    const filler = 'word '.repeat(400);
    const html = `<html><body><p>${filler}</p></body></html>`;
    const r = await b4H2Sections.run(inputFor(html));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('h2');
  });
});
