import { describe, expect, it } from 'vitest';
import { detectMoneyPages } from './money-pages';
import { contentHash, decideRender } from './render-cache';

describe('detectMoneyPages', () => {
  const urls = [
    'https://acme.dev/',
    'https://acme.dev/pricing',
    'https://acme.dev/docs',
    'https://acme.dev/docs/quickstart',
    'https://acme.dev/docs/api/reference',
    'https://acme.dev/blog/2026/some-post',
    'https://acme.dev/blog/tag/react',
    'https://acme.dev/assets/logo.png',
    'https://acme.dev/sitemap.xml',
  ];

  it('ranks commercial and entry-point pages highest', () => {
    const result = detectMoneyPages(urls);
    const top3 = result.slice(0, 3).map((p) => p.path);
    expect(top3).toContain('/');
    expect(top3).toContain('/pricing');
    expect(top3).toContain('/docs');
  });

  it('excludes assets, sitemaps, and tag pages', () => {
    const paths = detectMoneyPages(urls).map((p) => p.path);
    expect(paths).not.toContain('/assets/logo.png');
    expect(paths).not.toContain('/sitemap.xml');
    expect(paths).not.toContain('/blog/tag/react');
  });

  it('deduplicates by path and respects the limit', () => {
    const dupes = ['https://a.dev/pricing', 'https://a.dev/pricing?ref=x', '/pricing'];
    const result = detectMoneyPages(dupes, 25);
    expect(result.filter((p) => p.path === '/pricing')).toHaveLength(1);
    expect(detectMoneyPages(urls, 3)).toHaveLength(3);
  });

  it('handles bare paths and rejects malformed entries', () => {
    const result = detectMoneyPages(['/docs/guide', 'not a url', '']);
    expect(result.map((p) => p.path)).toEqual(['/docs/guide']);
  });
});

describe('render-cache', () => {
  const html = '<html><body><h1>Docs</h1><p>content</p></body></html>';

  it('renders when there is no prior hash', () => {
    const d = decideRender(html, null);
    expect(d.shouldRender).toBe(true);
    expect(d.reason).toBe('no-prior-hash');
  });

  it('skips rendering when content is unchanged (the cache hit)', () => {
    const first = contentHash(html);
    const d = decideRender(html, first);
    expect(d.shouldRender).toBe(false);
    expect(d.reason).toBe('unchanged-cache-hit');
  });

  it('re-renders when real content changes', () => {
    const first = contentHash(html);
    const d = decideRender(html.replace('content', 'new content'), first);
    expect(d.shouldRender).toBe(true);
    expect(d.reason).toBe('content-changed');
  });

  it('ignores volatile nonce/csrf noise so cosmetic churn is a cache hit', () => {
    const a =
      '<html><head><meta name="csrf-token" content="abc"><script nonce="x1"></script></head><body>Same</body></html>';
    const b =
      '<html><head><meta name="csrf-token" content="zzz"><script nonce="q9"></script></head><body>Same</body></html>';
    expect(contentHash(a)).toBe(contentHash(b));
    expect(decideRender(b, contentHash(a)).shouldRender).toBe(false);
  });
});
