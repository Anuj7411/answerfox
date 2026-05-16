import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d4ContactAccessible } from './d4-contact-accessible.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D4 — contact accessible', () => {
  it('passes on a /contact link', async () => {
    const r = await d4ContactAccessible.run(
      inputFor('<html><body><a href="/contact">Contact</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on a mailto: link (without a /contact page)', async () => {
    const r = await d4ContactAccessible.run(
      inputFor('<html><body><a href="mailto:hello@example.com">Email us</a></body></html>'),
    );
    expect(r.status).toBe('pass');
    expect(r.evidence).toContain('mailto');
  });

  it('passes when both /contact and mailto: are present', async () => {
    const html = `<html><body>
      <a href="/contact">Contact</a>
      <a href="mailto:hello@example.com">Email</a>
    </body></html>`;
    const r = await d4ContactAccessible.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('fails when neither is present', async () => {
    const r = await d4ContactAccessible.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
    expect(r.fixRecommendation).toContain('contact');
  });
});
