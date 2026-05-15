import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { a1Title } from './a1-title.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

describe('A1 — title 30-60 chars', () => {
  it('passes when title is present and in range', async () => {
    const title = 'A reasonable page title that lands between thirty and sixty';
    const html = `<html><head><title>${title}</title></head><body></body></html>`;
    const result = await a1Title.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain(`${title.length} chars`);
  });

  it('warns when title is too short', async () => {
    const html = '<html><head><title>Too short</title></head></html>';
    const result = await a1Title.run(inputFor(html));
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('chars');
    expect(result.fixRecommendation).toContain('30-60');
  });

  it('warns when title is too long', async () => {
    const long = 'x'.repeat(120);
    const html = `<html><head><title>${long}</title></head></html>`;
    const result = await a1Title.run(inputFor(html));
    expect(result.status).toBe('warn');
  });

  it('fails when title is missing entirely', async () => {
    const html = '<html><head></head><body><h1>No title</h1></body></html>';
    const result = await a1Title.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('<title>');
  });

  it('fails when title is empty whitespace', async () => {
    const html = '<html><head><title>   </title></head></html>';
    const result = await a1Title.run(inputFor(html));
    expect(result.status).toBe('fail');
  });
});
