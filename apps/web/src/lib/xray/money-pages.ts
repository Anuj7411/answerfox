/**
 * Money-page auto-detection for X-Ray (hero H1).
 *
 * We can't render every page a site has on the free Browser Rendering
 * allowance, and we shouldn't: AI crawlers cite a handful of pages that
 * decide purchase and adoption — pricing, the docs index, the
 * quickstart, the API reference. This scores a site's URLs and returns
 * the top N so rendering budget goes where being unreadable costs the
 * customer money.
 */

export interface ScoredPage {
  readonly url: string;
  readonly path: string;
  readonly score: number;
  readonly reason: string;
}

interface PathRule {
  readonly test: RegExp;
  readonly score: number;
  readonly reason: string;
}

// Higher score = more likely to be an AI-cited money page. Ordered by
// intent: commercial + entry-point docs first.
const RULES: readonly PathRule[] = [
  { test: /^\/?$/, score: 100, reason: 'Homepage' },
  { test: /\/pricing(\/|$)/i, score: 95, reason: 'Pricing page' },
  { test: /\/(docs?|documentation)\/?$/i, score: 90, reason: 'Docs index' },
  {
    test: /\/(quickstart|quick-start|getting-started|get-started)(\/|$)/i,
    score: 88,
    reason: 'Quickstart',
  },
  { test: /\/(install|installation|setup)(\/|$)/i, score: 82, reason: 'Install guide' },
  { test: /\/(api|reference|api-reference)(\/|$)/i, score: 78, reason: 'API reference' },
  { test: /\/(guide|guides|tutorial|tutorials)(\/|$)/i, score: 70, reason: 'Guide/tutorial' },
  { test: /\/(docs?|documentation)\//i, score: 62, reason: 'Docs page' },
  { test: /\/(features?|product)(\/|$)/i, score: 58, reason: 'Product/features' },
  { test: /\/(examples?|cookbook|recipes?)(\/|$)/i, score: 50, reason: 'Examples' },
  { test: /\/(about|company)(\/|$)/i, score: 40, reason: 'About' },
  { test: /\/(blog|changelog|releases?)(\/|$)/i, score: 30, reason: 'Blog/changelog' },
];

// Path segments that are never worth rendering budget.
const EXCLUDE_SEGMENT =
  /\/(tag|tags|author|authors|category|categories|feed|rss|sitemap)(\/|$)|\/page\/\d+/i;
// Asset/data file extensions anywhere in the final path segment.
const EXCLUDE_EXT = /\.(xml|json|txt|ico|png|jpe?g|gif|webp|svg|css|js|map|woff2?)$/i;

function isExcluded(path: string): boolean {
  return EXCLUDE_SEGMENT.test(path) || EXCLUDE_EXT.test(path);
}

function pathOf(url: string): string | null {
  try {
    return new URL(url).pathname;
  } catch {
    // Allow bare paths too.
    return url.startsWith('/') ? url : null;
  }
}

function scorePath(path: string): { score: number; reason: string } {
  for (const rule of RULES) {
    if (rule.test.test(path)) return { score: rule.score, reason: rule.reason };
  }
  // Unmatched but plausible content page: shallow paths beat deep ones.
  const depth = path.split('/').filter(Boolean).length;
  return { score: Math.max(10, 25 - depth * 5), reason: 'Content page' };
}

/**
 * Rank and truncate a site's URLs to the money pages worth rendering.
 * Deduplicates by path, drops assets/pagination, and returns at most
 * `limit` (default 25 — the §3 hero-page budget).
 */
export function detectMoneyPages(urls: readonly string[], limit = 25): ScoredPage[] {
  const bestByPath = new Map<string, ScoredPage>();
  for (const url of urls) {
    const path = pathOf(url);
    if (path === null || isExcluded(path)) continue;
    const { score, reason } = scorePath(path);
    const existing = bestByPath.get(path);
    if (existing === undefined || score > existing.score) {
      bestByPath.set(path, { url, path, score, reason });
    }
  }
  return [...bestByPath.values()]
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, limit);
}
