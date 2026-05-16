import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b3HeadingHierarchy } from './b3-heading-hierarchy.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B3 — heading hierarchy', () => {
  it('passes when h2 precedes h3', async () => {
    const html = '<html><body><h2>Section</h2><h3>Subsection</h3></body></html>';
    const r = await b3HeadingHierarchy.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('passes when only h2 is present', async () => {
    const r = await b3HeadingHierarchy.run(inputFor('<html><body><h2>Only h2</h2></body></html>'));
    expect(r.status).toBe('pass');
  });

  it('warns when h3 appears with no h2 at all', async () => {
    const r = await b3HeadingHierarchy.run(inputFor('<html><body><h3>Lonely</h3></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('h2');
  });

  it('warns when h3 appears before any h2', async () => {
    const html = '<html><body><h3>First</h3><h2>Second</h2></body></html>';
    const r = await b3HeadingHierarchy.run(inputFor(html));
    expect(r.status).toBe('warn');
  });

  it('skips when no h2/h3 are present', async () => {
    const r = await b3HeadingHierarchy.run(inputFor('<html><body><h1>Only h1</h1></body></html>'));
    expect(r.status).toBe('skip');
  });
});
