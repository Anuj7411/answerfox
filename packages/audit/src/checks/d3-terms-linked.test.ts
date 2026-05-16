import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d3TermsLinked } from './d3-terms-linked.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D3 — terms linked', () => {
  it('passes on a /terms link', async () => {
    const r = await d3TermsLinked.run(
      inputFor('<html><body><a href="/terms">Terms</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on a /tos link (terms-of-service abbreviation)', async () => {
    const r = await d3TermsLinked.run(inputFor('<html><body><a href="/tos">ToS</a></body></html>'));
    expect(r.status).toBe('pass');
  });

  it('passes on /terms-of-use', async () => {
    const r = await d3TermsLinked.run(
      inputFor('<html><body><a href="/terms-of-use">Terms</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('fails when no terms link exists', async () => {
    const r = await d3TermsLinked.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
  });
});
