import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { d1AboutPageLinked } from './d1-about-page-linked.js';

const URL = parseAbsoluteUrl('https://example.com');
const inputFor = (html: string) => ({ url: URL, html, dom: loadHtml(html) });

describe('D1 — about page linked', () => {
  it('passes when /about is linked anywhere on the page', async () => {
    const r = await d1AboutPageLinked.run(
      inputFor('<html><body><a href="/about">About</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes for absolute-URL /about links', async () => {
    const r = await d1AboutPageLinked.run(
      inputFor('<html><body><a href="https://example.com/about">About</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('passes for /about/ with trailing slash', async () => {
    const r = await d1AboutPageLinked.run(
      inputFor('<html><body><a href="/about/">About</a></body></html>'),
    );
    expect(r.status).toBe('pass');
  });

  it('does not match /aboutus (not a word-boundary /about)', async () => {
    const r = await d1AboutPageLinked.run(
      inputFor('<html><body><a href="/aboutus">About us</a></body></html>'),
    );
    expect(r.status).toBe('fail');
  });

  it('fails when no /about link is present', async () => {
    const r = await d1AboutPageLinked.run(inputFor('<html><body></body></html>'));
    expect(r.status).toBe('fail');
    expect(r.fixRecommendation).toContain('about');
  });
});
