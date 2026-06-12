import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g7LlmsTxt } from './g7-llms-txt.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

const VALID_LLMS_TXT = `# Example Site

> Open-source toolkit for example things.

## Docs

- [Quickstart](/docs/quickstart): get running in 60 seconds
- [API reference](/docs/api): all endpoints
`;

describe('G7 — llms.txt present', () => {
  it('passes when a valid markdown llms.txt is served', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/llms.txt');
      return new Response(VALID_LLMS_TXT, {
        status: 200,
        headers: { 'Content-Type': 'text/markdown' },
      });
    });
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('H1');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('not found', { status: 404 }));
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('llms.txt');
    vi.unstubAllGlobals();
  });

  it('warns on 200 with no H1', async () => {
    mockFetch(async () => new Response('Just some plain text, no heading.', { status: 200 }));
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('H1');
    vi.unstubAllGlobals();
  });

  it('warns on H1 only with no links', async () => {
    mockFetch(
      async () => new Response('# My Site\n\nSome prose, no links anywhere.', { status: 200 }),
    );
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('no markdown links');
    vi.unstubAllGlobals();
  });

  it('warns on 200 with empty body', async () => {
    mockFetch(async () => new Response('', { status: 200 }));
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('empty');
    vi.unstubAllGlobals();
  });

  it('fails on network error', async () => {
    mockFetch(async () => {
      throw new Error('ECONNREFUSED');
    });
    const result = await g7LlmsTxt.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.evidence).toContain('ECONNREFUSED');
    vi.unstubAllGlobals();
  });
});
