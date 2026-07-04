import 'server-only';
import { type XrayComparison, compareViews } from './compare';
import { detectMoneyPages } from './money-pages';
import type { RenderFn } from './render-adapter';
import { decideRender } from './render-cache';

/**
 * The X-Ray orchestrator (hero H1): ties extract-text, compare,
 * money-pages, and render-cache into one runnable pipeline.
 *
 * Per page: fetch the crawler view (free, plain fetch), hash it, and
 * only invoke the metered browser render when that hash differs from
 * what we rendered last time — the lever that keeps X-Ray inside the
 * free Browser Rendering allowance (§0.5). A cache hit reuses the
 * prior comparison verbatim rather than re-deriving it from stale
 * data, so a repeated audit of an unchanged page costs one fetch and
 * zero browser time.
 */

export type CrawlerFetchFn = (url: string) => Promise<string>;

export interface XrayCacheEntry {
  readonly hash: string;
  readonly comparison: XrayComparison;
}

export type GetCachedFn = (url: string) => Promise<XrayCacheEntry | null>;
export type SetCachedFn = (url: string, entry: XrayCacheEntry) => Promise<void>;

export type XrayPageResult =
  | {
      readonly url: string;
      readonly ok: true;
      readonly comparison: XrayComparison;
      /** false = served from cache; the browser was never invoked. */
      readonly rendered: boolean;
    }
  | { readonly url: string; readonly ok: false; readonly reason: string };

export interface XrayDeps {
  readonly crawlerFetch: CrawlerFetchFn;
  readonly render: RenderFn;
  readonly getCached: GetCachedFn;
  readonly setCached: SetCachedFn;
}

/** X-Ray one page: fetch, cache-decide, render-if-needed, compare. */
export async function runXrayForPage(url: string, deps: XrayDeps): Promise<XrayPageResult> {
  let crawlerHtml: string;
  try {
    crawlerHtml = await deps.crawlerFetch(url);
  } catch (err) {
    return { url, ok: false, reason: err instanceof Error ? err.message : 'Crawler fetch failed.' };
  }

  const cached = await deps.getCached(url);
  const decision = decideRender(crawlerHtml, cached?.hash ?? null);

  if (!decision.shouldRender && cached !== null) {
    return { url, ok: true, comparison: cached.comparison, rendered: false };
  }

  let renderedHtml: string;
  try {
    renderedHtml = await deps.render(url);
  } catch (err) {
    return { url, ok: false, reason: err instanceof Error ? err.message : 'Render failed.' };
  }

  const comparison = compareViews(crawlerHtml, renderedHtml);
  await deps.setCached(url, { hash: decision.hash, comparison });
  return { url, ok: true, comparison, rendered: true };
}

/**
 * X-Ray a whole site: rank the money pages (§3 hero-page budget) and
 * run each independently, so one broken page never stops the rest.
 */
export async function runXrayForSite(
  urls: readonly string[],
  deps: XrayDeps,
  limit = 25,
): Promise<readonly XrayPageResult[]> {
  const pages = detectMoneyPages(urls, limit);
  const results: XrayPageResult[] = [];
  for (const page of pages) {
    results.push(await runXrayForPage(page.url, deps));
  }
  return results;
}
