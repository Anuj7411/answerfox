import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { a4Canonical } from './a4-canonical.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

describe('A4 — canonical URL declared', () => {
  it('passes when an absolute https canonical is present', async () => {
    const html = '<html><head><link rel="canonical" href="https://example.com/page"></head></html>';
    const result = await a4Canonical.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('https://example.com/page');
  });

  it('passes when an absolute http canonical is present', async () => {
    const html = '<html><head><link rel="canonical" href="http://example.com/"></head></html>';
    const result = await a4Canonical.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('warns when canonical is a relative path', async () => {
    const html = '<html><head><link rel="canonical" href="/page"></head></html>';
    const result = await a4Canonical.run(inputFor(html));
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('relative');
    expect(result.fixRecommendation).toContain('absolute');
  });

  it('fails when no canonical link is present', async () => {
    const html = '<html><head></head></html>';
    const result = await a4Canonical.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('canonical');
  });

  it('fails when canonical href is empty', async () => {
    const html = '<html><head><link rel="canonical" href=""></head></html>';
    const result = await a4Canonical.run(inputFor(html));
    expect(result.status).toBe('fail');
  });
});
