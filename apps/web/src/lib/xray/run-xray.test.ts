import { describe, expect, it, vi } from 'vitest';
import type { XrayCacheEntry, XrayDeps } from './run-xray';
import { runXrayForPage, runXrayForSite } from './run-xray';

const RENDERED =
  '<html><body><h1>Docs</h1><p>Some real content that a browser would render.</p></body></html>';
const CRAWLER_GUTTED = '<html><body><div id="root"></div></body></html>';

function makeDeps(
  overrides: Partial<XrayDeps> = {},
): XrayDeps & { store: Map<string, XrayCacheEntry> } {
  const store = new Map<string, XrayCacheEntry>();
  return {
    store,
    crawlerFetch: vi.fn(async () => CRAWLER_GUTTED),
    render: vi.fn(async () => RENDERED),
    getCached: async (url) => store.get(url) ?? null,
    setCached: async (url, entry) => {
      store.set(url, entry);
    },
    ...overrides,
  };
}

describe('runXrayForPage', () => {
  it('renders on first run (no cache) and stores the result', async () => {
    const deps = makeDeps();
    const result = await runXrayForPage('https://acme.dev/docs', deps);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.rendered).toBe(true);
      expect(result.comparison.coveragePercent).toBeLessThan(50);
    }
    expect(deps.render).toHaveBeenCalledTimes(1);
    expect(deps.store.size).toBe(1);
  });

  it('is a cache hit (skips the browser) when crawler HTML is unchanged', async () => {
    const deps = makeDeps();
    await runXrayForPage('https://acme.dev/docs', deps);
    const second = await runXrayForPage('https://acme.dev/docs', deps);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.rendered).toBe(false);
    expect(deps.render).toHaveBeenCalledTimes(1); // NOT called again
  });

  it('re-renders when the crawler HTML changes since the cached hash', async () => {
    let call = 0;
    const deps = makeDeps({
      crawlerFetch: vi.fn(async () => {
        call += 1;
        return call === 1 ? CRAWLER_GUTTED : `${CRAWLER_GUTTED}<p>new content appeared</p>`;
      }),
    });
    await runXrayForPage('https://acme.dev/docs', deps);
    const second = await runXrayForPage('https://acme.dev/docs', deps);
    expect(second.ok).toBe(true);
    if (second.ok) expect(second.rendered).toBe(true);
    expect(deps.render).toHaveBeenCalledTimes(2);
  });

  it('returns ok:false without calling render when the crawler fetch fails', async () => {
    const deps = makeDeps({
      crawlerFetch: vi.fn(async () => {
        throw new Error('ETIMEDOUT');
      }),
    });
    const result = await runXrayForPage('https://acme.dev/down', deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('ETIMEDOUT');
    expect(deps.render).not.toHaveBeenCalled();
  });

  it('returns ok:false (not a crash) when the render call fails', async () => {
    const deps = makeDeps({
      render: vi.fn(async () => {
        throw new Error('Browser Rendering is not wired in this environment.');
      }),
    });
    const result = await runXrayForPage('https://acme.dev/docs', deps);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('not wired');
    // A failed render must not poison the cache with a bad entry.
    expect(deps.store.size).toBe(0);
  });
});

describe('runXrayForSite', () => {
  it('runs only the top-ranked money pages, respecting the limit', async () => {
    const urls = [
      'https://acme.dev/',
      'https://acme.dev/pricing',
      'https://acme.dev/docs',
      'https://acme.dev/blog/post-1',
      'https://acme.dev/blog/post-2',
    ];
    const deps = makeDeps();
    const results = await runXrayForSite(urls, deps, 2);
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.url)).toEqual(
      expect.arrayContaining(['https://acme.dev/', 'https://acme.dev/pricing']),
    );
  });

  it('one failing page does not stop the rest of the site', async () => {
    let call = 0;
    const deps = makeDeps({
      crawlerFetch: vi.fn(async (url: string) => {
        call += 1;
        if (url.includes('pricing')) throw new Error('502');
        return CRAWLER_GUTTED;
      }),
    });
    const results = await runXrayForSite(
      ['https://acme.dev/', 'https://acme.dev/pricing'],
      deps,
      25,
    );
    expect(results).toHaveLength(2);
    const pricing = results.find((r) => r.url.includes('pricing'));
    const home = results.find((r) => r.url === 'https://acme.dev/');
    expect(pricing?.ok).toBe(false);
    expect(home?.ok).toBe(true);
    expect(call).toBe(2);
  });
});
