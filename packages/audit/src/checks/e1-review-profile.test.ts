import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { e1ReviewProfile } from './e1-review-profile.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('E1 — review profile', () => {
  it('passes when a G2 link is present', async () => {
    const html = '<html><body><a href="https://g2.com/products/acme">G2</a></body></html>';
    const r = await e1ReviewProfile.run(inputFor(html));
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('g2.com');
  });

  it('passes on a Product Hunt link', async () => {
    const html =
      '<html><body><a href="https://www.producthunt.com/products/acme">PH</a></body></html>';
    const r = await e1ReviewProfile.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('passes on a Trustpilot or Capterra link', async () => {
    const html = `<html><body>
      <a href="https://trustpilot.com/review/acme.com">Trustpilot</a>
      <a href="https://capterra.com/p/123/acme">Capterra</a>
    </body></html>`;
    const r = await e1ReviewProfile.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('warns when no review profile link exists', async () => {
    const r = await e1ReviewProfile.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('warn');
    expect(r.fixRecommendation).toContain('review profile');
  });
});
