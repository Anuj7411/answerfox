import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { a5HtmlLang } from './a5-html-lang.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

describe('A5 — <html lang>', () => {
  it('passes on simple two-letter primary tag', async () => {
    const html = '<html lang="en"><head></head></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('en');
  });

  it('passes on region-subtagged values like en-US', async () => {
    const html = '<html lang="en-US"></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('passes on script-subtagged values like zh-Hant', async () => {
    const html = '<html lang="zh-Hant"></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('warns when lang has illegal characters (numbers in primary tag, spaces)', async () => {
    const html = '<html lang="english language"></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('warn');
    expect(result.fixRecommendation).toContain('BCP 47');
  });

  it('fails when the lang attribute is missing', async () => {
    const html = '<html></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('lang');
  });

  it('fails when lang is empty whitespace', async () => {
    const html = '<html lang=" "></html>';
    const result = await a5HtmlLang.run(inputFor(html));
    expect(result.status).toBe('fail');
  });
});
