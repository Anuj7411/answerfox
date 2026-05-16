import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d2PrivacyLinked } from './d2-privacy-linked.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D2 — privacy linked', () => {
  it('passes on a /privacy link', async () => {
    const r = await d2PrivacyLinked.run(
      inputFor('<html><body><a href="/privacy">Privacy</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on a /privacy-policy link', async () => {
    const r = await d2PrivacyLinked.run(
      inputFor('<html><body><a href="/privacy-policy">Privacy</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('fails when no privacy link exists', async () => {
    const r = await d2PrivacyLinked.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
  });
});
