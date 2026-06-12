import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchOriginPath } from './_origin-fetch.js';

/**
 * A11 — `sitemap.xml` present and well-formed at the origin root.
 *
 * Cloudflare's Agent Readiness Score (April 2026) ranks sitemap.xml
 * under Discoverability. Classic SEO has scored it for decades; the
 * agent era still relies on it for crawlable URL enumeration.
 *
 * We accept either a urlset (a normal sitemap) or a sitemapindex
 * (an index pointing at several child sitemaps). Either shape is
 * standards-compliant per the sitemaps.org schema.
 *
 * Weighted at 2 points, matching A8 robots.txt (the other root-level
 * discoverability check).
 */
export const a11Sitemap = defineCheck<AuditDom>({
  id: 'A11',
  category: 'meta-and-technical',
  severity: 'medium',
  points: 2,
  description: 'sitemap.xml present at /sitemap.xml with valid urlset or sitemapindex',
  rationale:
    'Crawlers and AI agents discover the full set of indexable URLs through sitemap.xml. Without one, large sites depend on link-graph traversal alone, which misses orphaned and deep-linked pages. Cloudflare scores this; classic SEO has scored it for a decade.',
  docsUrl: 'https://answerfox.dev/docs/checks/A11',
  run: async ({ url }) => {
    const result = await fetchOriginPath(url, 'sitemap.xml');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish a sitemap.xml at /sitemap.xml listing your indexable URLs. Reference it from robots.txt with a Sitemap: directive.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No sitemap.xml found at ${result.url}`,
        fixRecommendation:
          'Publish at /sitemap.xml using the sitemaps.org schema. Next.js: app/sitemap.ts. Hand-rolled: <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `sitemap.xml endpoint returned HTTP ${result.status}`,
        fixRecommendation:
          'Serve sitemap.xml with a 200 response and Content-Type: application/xml.',
      };
    }
    if (result.body === null || result.body.length === 0) {
      return {
        status: 'warn',
        evidence: `sitemap.xml at ${result.url} returned an empty body`,
        fixRecommendation:
          'Sitemap is present but empty. Generate URL entries from your routing layer.',
      };
    }
    const body = result.body;
    const hasUrlset = /<urlset[\s>]/i.test(body);
    const hasSitemapIndex = /<sitemapindex[\s>]/i.test(body);
    if (!hasUrlset && !hasSitemapIndex) {
      return {
        status: 'warn',
        evidence: `sitemap.xml present at ${result.url} but does not contain <urlset> or <sitemapindex>`,
        fixRecommendation:
          'Wrap entries in a sitemaps.org root element. Either <urlset xmlns="..."> (single sitemap) or <sitemapindex xmlns="..."> (index of child sitemaps).',
      };
    }
    return {
      status: 'pass',
      evidence: `sitemap.xml present at ${result.url} (${hasSitemapIndex ? 'sitemapindex' : 'urlset'} shape)`,
    };
  },
});
