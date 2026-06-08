import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it, vi } from 'vitest';
import { loadHtml } from '../parser.js';
import { g5OauthDiscovery } from './g5-oauth-discovery.js';

const URL = parseAbsoluteUrl('https://auth.example.com');
const HTML = '<html></html>';

describe('G5 — OAuth Authorization Server Metadata (RFC 8414)', () => {
  it('passes when a valid discovery document with issuer is served', async () => {
    vi.stubGlobal('fetch', async (url: string) => {
      expect(url).toBe('https://auth.example.com/.well-known/oauth-authorization-server');
      return new Response(
        '{"issuer":"https://auth.example.com","authorization_endpoint":"https://auth.example.com/authorize","token_endpoint":"https://auth.example.com/token"}',
        { status: 200 },
      );
    });
    const result = await g5OauthDiscovery.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('issuer');
    vi.unstubAllGlobals();
  });

  it('warns when discovery exists but lacks required issuer field', async () => {
    vi.stubGlobal(
      'fetch',
      async () => new Response('{"authorization_endpoint":"..."}', { status: 200 }),
    );
    const result = await g5OauthDiscovery.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('warn');
    expect(result.evidence).toContain('issuer');
    vi.unstubAllGlobals();
  });

  it('fails on 404', async () => {
    vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
    const result = await g5OauthDiscovery.run({ url: URL, html: HTML, dom: loadHtml(HTML) });
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('RFC 8414');
    vi.unstubAllGlobals();
  });
});
