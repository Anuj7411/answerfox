import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { b1SingleH1 } from './b1-single-h1.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('B1 — single h1', () => {
  it('passes when there is exactly one h1', async () => {
    const r = await b1SingleH1.run(inputFor('<html><body><h1>Hello</h1></body></html>'));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('Hello');
  });

  it('warns when there are multiple h1s', async () => {
    const r = await b1SingleH1.run(inputFor('<html><body><h1>One</h1><h1>Two</h1></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.evidence).toContain('2');
  });

  it('fails when there is no h1', async () => {
    const r = await b1SingleH1.run(inputFor('<html><body><h2>Just h2</h2></body></html>'));
    expect(r.status).toBe('fail');
    expect(r.fixRecommendation).toContain('h1');
  });

  it('truncates long h1 text in evidence', async () => {
    const long = 'x'.repeat(200);
    const r = await b1SingleH1.run(inputFor(`<html><body><h1>${long}</h1></body></html>`));
    expect(r.status).toBe('pass');
    expect(r.evidence?.length).toBeLessThanOrEqual(120);
  });
});
