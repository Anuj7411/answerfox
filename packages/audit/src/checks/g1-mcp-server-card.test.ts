import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g1McpServerCard } from './g1-mcp-server-card.js';

const URL = parseAbsoluteUrl('https://example.com/blog/post');
const HTML = '<html><head></head><body></body></html>';

function mockFetch(impl: (url: string) => Promise<Response>) {
  // Replace global fetch for the duration of one test.
  vi.stubGlobal('fetch', impl);
}

describe('G1 — MCP Server Card present', () => {
  it('passes when a valid JSON card is served at the origin', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/.well-known/mcp/server-card.json');
      return new Response('{"name":"example","endpoint":"https://api.example.com/mcp"}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    const result = await g1McpServerCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('present');
    vi.unstubAllGlobals();
  });

  it('fails when the card is not found (404)', async () => {
    mockFetch(async () => new Response('not found', { status: 404 }));
    const result = await g1McpServerCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('MCP Server Card');
    vi.unstubAllGlobals();
  });

  it('warns when the card endpoint returns 500', async () => {
    mockFetch(async () => new Response('boom', { status: 500 }));
    const result = await g1McpServerCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('500');
    vi.unstubAllGlobals();
  });

  it('warns when the card endpoint returns invalid JSON', async () => {
    mockFetch(async () => new Response('not json', { status: 200 }));
    const result = await g1McpServerCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('not valid JSON');
    vi.unstubAllGlobals();
  });

  it('fails on network error', async () => {
    mockFetch(async () => {
      throw new Error('ENOTFOUND');
    });
    const result = await g1McpServerCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.evidence).toContain('ENOTFOUND');
    vi.unstubAllGlobals();
  });
});
