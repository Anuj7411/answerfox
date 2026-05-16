import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d6FooterTrustLinks } from './d6-footer-trust-links.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D6 — footer trust links', () => {
  it('passes when all three trust links are in the footer', async () => {
    const html = `<html><body><footer>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
    </footer></body></html>`;
    const r = await d6FooterTrustLinks.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('warns when only 1 of 3 is present', async () => {
    const html = '<html><body><footer><a href="/privacy">Privacy</a></footer></body></html>';
    const r = await d6FooterTrustLinks.run(inputFor(html));
    expect(r.status).toBe('warn');
    expect(r.evidence).toContain('1 of 3');
  });

  it('warns when 2 of 3 are present', async () => {
    const html = `<html><body><footer>
      <a href="/privacy">Privacy</a>
      <a href="/contact">Contact</a>
    </footer></body></html>`;
    const r = await d6FooterTrustLinks.run(inputFor(html));
    expect(r.status).toBe('warn');
    expect(r.evidence).toContain('2 of 3');
  });

  it('fails when the footer exists but has none of the trust links', async () => {
    const html = '<html><body><footer><a href="/sitemap">Sitemap</a></footer></body></html>';
    const r = await d6FooterTrustLinks.run(inputFor(html));
    expect(r.status).toBe('fail');
  });

  it('fails when there is no footer at all', async () => {
    const r = await d6FooterTrustLinks.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
    expect(r.fixRecommendation).toContain('footer');
  });
});
