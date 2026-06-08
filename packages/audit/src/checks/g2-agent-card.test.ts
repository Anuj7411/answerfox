import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g2AgentCard } from './g2-agent-card.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

describe('G2 — A2A agent-card.json present', () => {
  it('passes when valid JSON card is served', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      expect(url).toBe('https://example.com/.well-known/agent-card.json');
      return new Response('{"name":"Example Agent","capabilities":["read"]}', { status: 200 });
    });
    const result = await g2AgentCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    const result = await g2AgentCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('agent-card.json');
    vi.unstubAllGlobals();
  });

  it('warns on invalid JSON', async () => {
    vi.stubGlobal('fetch', async () => new Response('xml not json', { status: 200 }));
    const result = await g2AgentCard.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    vi.unstubAllGlobals();
  });
});
