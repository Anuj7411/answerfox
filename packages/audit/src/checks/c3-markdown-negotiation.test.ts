import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { c3MarkdownNegotiation } from './c3-markdown-negotiation.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';
const ctx = { url: URL, html: HTML, dom: loadHtml(HTML) };

function mockFetch(impl: (url: string, init: RequestInit) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('C3 — Markdown content negotiation', () => {
  it('passes when Content-Type is text/markdown', async () => {
    mockFetch(async (url, init) => {
      expect(url).toBe('https://example.com');
      const accept = (init.headers as Record<string, string>).Accept;
      expect(accept).toContain('text/markdown');
      return new Response('# Hi', {
        status: 200,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      });
    });
    const result = await c3MarkdownNegotiation.run(ctx);
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('text/markdown');
    vi.unstubAllGlobals();
  });

  it('warns when body looks like markdown but Content-Type is wrong', async () => {
    mockFetch(
      async () =>
        new Response('# Example\n\nSome content here', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }),
    );
    const result = await c3MarkdownNegotiation.run(ctx);
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('text/plain');
    vi.unstubAllGlobals();
  });

  it('fails when server returns HTML despite markdown Accept', async () => {
    mockFetch(
      async () =>
        new Response('<!DOCTYPE html><html><body>hi</body></html>', {
          status: 200,
          headers: { 'Content-Type': 'text/html' },
        }),
    );
    const result = await c3MarkdownNegotiation.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.evidence).toContain('text/html');
    vi.unstubAllGlobals();
  });

  it('fails on non-2xx response', async () => {
    mockFetch(async () => new Response('not found', { status: 404 }));
    const result = await c3MarkdownNegotiation.run(ctx);
    expect(result.status).toBe('fail');
    vi.unstubAllGlobals();
  });
});
