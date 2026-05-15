import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { c1JsonLd } from './c1-json-ld.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

describe('C1 — JSON-LD presence', () => {
  it('passes when a single valid JSON-LD block is present', async () => {
    const block = '{"@context":"https://schema.org","@type":"Organization","name":"Acme"}';
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('Organization');
  });

  it('passes when multiple blocks include distinct @types', async () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      <script type="application/ld+json">{"@type":"WebSite","name":"Acme"}</script>
    </head></html>`;
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('Organization');
    expect(result.evidence).toContain('WebSite');
  });

  it('passes when JSON-LD is an array (Graph form) and reports the first @type', async () => {
    const block = '[{"@type":"Organization","name":"Acme"},{"@type":"WebSite","name":"Acme"}]';
    const html = `<html><head><script type="application/ld+json">${block}</script></head></html>`;
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('fails when there are no JSON-LD scripts at all', async () => {
    const html = '<html><head></head></html>';
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('organization');
  });

  it('warns when every JSON-LD block is invalid JSON', async () => {
    const html = `<html><head>
      <script type="application/ld+json">{ this is not json }</script>
    </head></html>`;
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('warn');
    expect(result.fixRecommendation).toContain('JSON');
  });

  it('passes when at least one block parses and surfaces the invalid count as evidence', async () => {
    const html = `<html><head>
      <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
      <script type="application/ld+json">broken</script>
    </head></html>`;
    const result = await c1JsonLd.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('invalid');
  });
});
