import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g4AgentPermissions } from './g4-agent-permissions.js';

const URL = parseAbsoluteUrl('https://example.com');
const HTML = '<html></html>';

describe('G4 — agent-permissions.json present', () => {
  it('passes when valid JSON is served', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      expect(url).toBe('https://example.com/.well-known/agent-permissions.json');
      return new Response('{"version":"1","agents":[]}', { status: 200 });
    });
    const result = await g4AgentPermissions.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    const result = await g4AgentPermissions.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    vi.unstubAllGlobals();
  });
});
