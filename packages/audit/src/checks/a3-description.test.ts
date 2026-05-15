import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { a3Description } from './a3-description.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

const GOOD_DESCRIPTION =
  'A precise meta description that summarizes the page in roughly the 120-160 character window Google uses for SERP snippets without truncating.';

describe('A3 — meta description 120-160 chars', () => {
  it('passes when description is present and in range', async () => {
    const html = `<html><head><meta name="description" content="${GOOD_DESCRIPTION}"></head></html>`;
    const result = await a3Description.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('chars');
  });

  it('warns when description is too short', async () => {
    const html = '<html><head><meta name="description" content="Brief."></head></html>';
    const result = await a3Description.run(inputFor(html));
    expect(result.status).toBe('warn');
    expect(result.fixRecommendation).toContain('120-160');
  });

  it('warns when description is too long', async () => {
    const long = 'x'.repeat(220);
    const html = `<html><head><meta name="description" content="${long}"></head></html>`;
    const result = await a3Description.run(inputFor(html));
    expect(result.status).toBe('warn');
  });

  it('fails when meta description tag is missing', async () => {
    const html = '<html><head></head></html>';
    const result = await a3Description.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('description');
  });

  it('fails when content attribute is empty whitespace', async () => {
    const html = '<html><head><meta name="description" content="   "></head></html>';
    const result = await a3Description.run(inputFor(html));
    expect(result.status).toBe('fail');
  });
});
