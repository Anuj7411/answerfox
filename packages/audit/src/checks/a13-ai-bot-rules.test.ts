import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { a13AiBotRules } from './a13-ai-bot-rules.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';
const ctx = { url: URL, html: HTML, dom: loadHtml(HTML) };

function mockFetch(impl: (url: string) => Promise<Response>) {
  vi.stubGlobal('fetch', impl);
}

describe('A13 — robots.txt AI bot rules', () => {
  it('passes when robots.txt declares explicit AI bots', async () => {
    mockFetch(async (url) => {
      expect(url).toBe('https://example.com/robots.txt');
      return new Response('User-agent: GPTBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n', {
        status: 200,
      });
    });
    const result = await a13AiBotRules.run(ctx);
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('gptbot');
    vi.unstubAllGlobals();
  });

  it('warns when robots.txt has only generic rules', async () => {
    mockFetch(async () => new Response('User-agent: *\nDisallow:\n', { status: 200 }));
    const result = await a13AiBotRules.run(ctx);
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('no explicit AI bot');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    mockFetch(async () => new Response('', { status: 404 }));
    const result = await a13AiBotRules.run(ctx);
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('robots.txt');
    vi.unstubAllGlobals();
  });

  it('passes on case-insensitive bot name matching', async () => {
    mockFetch(async () => new Response('User-Agent: gptbot\nAllow: /\n', { status: 200 }));
    const result = await a13AiBotRules.run(ctx);
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on network error', async () => {
    mockFetch(async () => {
      throw new Error('ENOTFOUND');
    });
    const result = await a13AiBotRules.run(ctx);
    expect(result.status).toBe('fail');
    vi.unstubAllGlobals();
  });
});
