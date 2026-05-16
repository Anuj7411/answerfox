import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d5ChromeTrustLink } from './d5-chrome-trust-link.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D5 — chrome trust link', () => {
  it('passes when <nav> contains a link to /about', async () => {
    const r = await d5ChromeTrustLink.run(
      inputFor('<html><body><nav><a href="/about">About</a></nav></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes when <header> contains a link to /team', async () => {
    const r = await d5ChromeTrustLink.run(
      inputFor('<html><body><header><a href="/team">Team</a></header></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes on /newsroom or /company variants', async () => {
    const html = '<html><body><nav><a href="/company">Company</a></nav></body></html>';
    const r = await d5ChromeTrustLink.run(inputFor(html));
    expect(r.status).toBe('pass');
  });

  it('fails when chrome exists but contains no trust link', async () => {
    const r = await d5ChromeTrustLink.run(
      inputFor('<html><body><nav><a href="/pricing">Pricing</a></nav></body></html>'),
    );
    expect(r.status).toBe('fail');
  });

  it('fails when there is an /about link but only outside chrome', async () => {
    const html = '<html><body><main><a href="/about">About</a></main></body></html>';
    const r = await d5ChromeTrustLink.run(inputFor(html));
    expect(r.status).toBe('fail');
  });
});
