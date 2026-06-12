import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { c4ContentSignals } from './c4-content-signals.js';

const URL = parseAbsoluteUrl('https://example.com');

function ctx(opts: { headerValue?: string | null; metaContent?: string | null }) {
  const headers = new Headers();
  if (opts.headerValue !== undefined && opts.headerValue !== null) {
    headers.set('X-Content-Signals', opts.headerValue);
  }
  const meta =
    opts.metaContent !== undefined && opts.metaContent !== null
      ? `<meta name="content-signals" content="${opts.metaContent}">`
      : '';
  const html = `<html><head>${meta}</head><body></body></html>`;
  return { url: URL, html, dom: loadHtml(html), headers };
}

describe('C4 — Content Signals', () => {
  it('passes when X-Content-Signals header carries recognised fields', async () => {
    const result = await c4ContentSignals.run(
      ctx({ headerValue: 'citation=required, training=opt-out' }),
    );
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('header');
    expect(result.evidence).toContain('citation');
  });

  it('passes when only the meta tag carries a recognised field', async () => {
    const result = await c4ContentSignals.run(ctx({ metaContent: 'use-policy=cite-with-link' }));
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('meta tag');
  });

  it('prefers the header over the meta tag when both are present', async () => {
    const result = await c4ContentSignals.run(
      ctx({ headerValue: 'training=opt-out', metaContent: 'paywall=hard' }),
    );
    expect(result.status).toBe('pass');
    expect(result.evidence).toContain('header');
    expect(result.evidence).toContain('training');
  });

  it('warns when present but with no recognised field', async () => {
    const result = await c4ContentSignals.run(ctx({ headerValue: 'random-value' }));
    expect(result.status).toBe('warn');
  });

  it('fails when neither header nor meta tag is present', async () => {
    const result = await c4ContentSignals.run(ctx({}));
    expect(result.status).toBe('fail');
    expect(result.fixRecommendation).toContain('X-Content-Signals');
  });
});
