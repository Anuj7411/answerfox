import { describe, expect, it } from 'vitest';
import { compareViews } from './compare';
import { extractVisibleText } from './extract-text';
import { detectMoneyPages } from './money-pages';

// Real-site X-Ray stress: fetch actual gutted SPA/docs sites the way a
// no-JS crawler does and confirm the coverage math produces sane,
// defensible numbers on real HTML (not fixtures). Gated: RUN_STRESS=1.
const RUN = process.env.RUN_STRESS === '1';
const UA = 'Mozilla/5.0; compatible; GPTBot/1.2; +https://openai.com/gptbot';

async function fetchRaw(url: string): Promise<string> {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  return r.text();
}

describe.skipIf(!RUN)('X-Ray stress on real sites', () => {
  it('flags a JS-only shell as near-empty visible text', async () => {
    const html = await fetchRaw('https://developer.apple.com/documentation/swiftui');
    const words = extractVisibleText(html)
      .split(' ')
      .filter((w) => w.length > 1).length;
    // eslint-disable-next-line no-console
    console.log(`Apple SwiftUI visible words (no JS): ${words}`);
    expect(words).toBeLessThan(30);
  }, 30_000);

  it('never crashes and returns 0-100 coverage on a batch of real sites', async () => {
    const urls = [
      'https://developer.apple.com/documentation/swiftui',
      'https://supabase.com/docs',
      'https://storybook.js.org/docs',
      'https://react.dev/learn',
    ];
    for (const url of urls) {
      const raw = await fetchRaw(url);
      // Compare the raw crawler view against itself proxied as "rendered"
      // by injecting extra content, to exercise the gap path on real HTML.
      const rendered = `${raw}<main><p>rendered-only paragraph that the crawler never received in this synthetic control</p></main>`;
      const cmp = compareViews(raw, rendered);
      // eslint-disable-next-line no-console
      console.log(
        `${url}: coverage=${cmp.coveragePercent}% rendered=${cmp.renderedWordCount} crawler=${cmp.crawlerWordCount} samples=${cmp.missingSamples.length}`,
      );
      expect(cmp.coveragePercent).toBeGreaterThanOrEqual(0);
      expect(cmp.coveragePercent).toBeLessThanOrEqual(100);
      expect(cmp.crawlerWordCount).toBeGreaterThanOrEqual(0);
    }
  }, 60_000);

  it('handles pathological HTML without hanging or throwing', () => {
    const pathological = [
      '',
      '<html>',
      '<script>'.repeat(5000),
      `<p>${'a '.repeat(100_000)}</p>`,
      '<!-- '.repeat(10_000),
      '<div>'.repeat(50_000),
    ];
    for (const html of pathological) {
      expect(() => compareViews(html, html)).not.toThrow();
      expect(() => extractVisibleText(html)).not.toThrow();
    }
  }, 20_000);

  it('detectMoneyPages survives a huge, messy URL list', () => {
    const urls: string[] = [];
    for (let i = 0; i < 20_000; i++) urls.push(`https://x.dev/blog/post-${i}`);
    urls.push('https://x.dev/pricing', 'https://x.dev/docs', 'https://x.dev/');
    const pages = detectMoneyPages(urls, 25);
    expect(pages.length).toBe(25);
    expect(pages.slice(0, 3).map((p) => p.path)).toContain('/pricing');
  });
});
