import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { g6WebmcpForm } from './g6-webmcp-form.js';

const URL = parseAbsoluteUrl('https://example.com');

function inputFor(html: string) {
  return { url: URL, html, dom: loadHtml(html) };
}

describe('G6 — WebMCP form annotations', () => {
  it('passes when a form has a mcp-action attribute', async () => {
    const html =
      '<html><body><form mcp-action="subscribe"><input name="email"/><button>Subscribe</button></form></body></html>';
    const result = await g6WebmcpForm.run(inputFor(html));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('annotation');
  });

  it('passes when a form has data-mcp-tool attribute', async () => {
    const html =
      '<html><body><form data-mcp-tool="newsletter-signup"><input name="email"/></form></body></html>';
    const result = await g6WebmcpForm.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('passes when an input has data-mcp-action attribute', async () => {
    const html =
      '<html><body><form><input data-mcp-action="email-input" name="email"/></form></body></html>';
    const result = await g6WebmcpForm.run(inputFor(html));
    expect(result.status).toBe('pass');
  });

  it('fails when forms exist but none have WebMCP annotations', async () => {
    const html =
      '<html><body><form action="/subscribe" method="post"><input name="email"/><button>Subscribe</button></form></body></html>';
    const result = await g6WebmcpForm.run(inputFor(html));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('WebMCP');
  });

  it('skips when the page has no forms at all', async () => {
    const html = '<html><body><p>Just text, no forms here.</p></body></html>';
    const result = await g6WebmcpForm.run(inputFor(html));
    expect(result.status).toBe('skip');
  });
});
