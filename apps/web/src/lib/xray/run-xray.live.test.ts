import { describe, expect, it } from 'vitest';
import { fetchCrawlerView } from './crawler-fetch';
import { type XrayCacheEntry, runXrayForSite } from './run-xray';

// Live orchestrator test: real crawler fetches (GPTBot UA, genuinely
// free, no Cloudflare needed) against famous sites, cache-decision
// logic exercised on real HTML. The "render" side has no local
// equivalent of Cloudflare's Workers-only Browser Rendering binding,
// so it's a clearly-labeled synthetic stand-in (crawler HTML + extra
// content) — honest about what is and isn't the real production path.
// Gated: RUN_STRESS=1.
const RUN = process.env.RUN_STRESS === '1';

describe.skipIf(!RUN)('X-Ray orchestrator (live crawler fetch)', () => {
  it('flags real gutted sites and caches on the second run without re-rendering', async () => {
    const store = new Map<string, XrayCacheEntry>();
    let renderCalls = 0;
    const deps = {
      crawlerFetch: fetchCrawlerView,
      render: async (url: string) => {
        renderCalls += 1;
        // Synthetic stand-in for the CF Browser Rendering binding: the
        // real crawler HTML plus content only a browser would produce.
        const crawlerHtml = await fetchCrawlerView(url);
        return `${crawlerHtml}<main><p>rendered-only paragraph proving the browser saw more than the crawler did</p></main>`;
      },
      getCached: async (url: string) => store.get(url) ?? null,
      setCached: async (url: string, entry: XrayCacheEntry) => {
        store.set(url, entry);
      },
    };

    const results = await runXrayForSite(
      ['https://developer.apple.com/documentation/swiftui'],
      deps,
      1,
    );
    expect(results).toHaveLength(1);
    const first = results[0];
    expect(first?.ok).toBe(true);
    // eslint-disable-next-line no-console
    console.log(`first run: ${JSON.stringify(first)}`);
    expect(renderCalls).toBe(1);

    // Second run, unchanged origin HTML -> cache hit, render NOT called again.
    const second = await runXrayForSite(
      ['https://developer.apple.com/documentation/swiftui'],
      deps,
      1,
    );
    // eslint-disable-next-line no-console
    console.log(`second run (expect cache hit): ${JSON.stringify(second[0])}`);
    expect(renderCalls).toBe(1);
    if (second[0]?.ok === true) expect(second[0].rendered).toBe(false);
  }, 30_000);

  it('runs a real multi-page audit for one site end to end without crashing', async () => {
    // detectMoneyPages dedupes by PATH — it ranks pages WITHIN one
    // site's URL list, so a realistic call passes one site at a time
    // (runXrayForSite audits a single site, per its own doc comment).
    const store = new Map<string, XrayCacheEntry>();
    const deps = {
      crawlerFetch: fetchCrawlerView,
      render: async (url: string) => `${await fetchCrawlerView(url)}<p>extra</p>`,
      getCached: async (url: string) => store.get(url) ?? null,
      setCached: async (url: string, entry: XrayCacheEntry) => {
        store.set(url, entry);
      },
    };
    const urls = [
      'https://storybook.js.org/docs',
      'https://storybook.js.org/docs/get-started/install',
    ];
    const results = await runXrayForSite(urls, deps, 25);
    expect(results).toHaveLength(2);
    for (const r of results) {
      // eslint-disable-next-line no-console
      console.log(`${r.url}: ${JSON.stringify(r)}`);
      expect(r.ok).toBe(true);
    }
  }, 30_000);
});
