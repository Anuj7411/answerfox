import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a4Canonical = defineCheck<AuditDom>({
  id: 'A4',
  category: 'meta-and-technical',
  severity: 'critical',
  points: 3,
  description: 'Canonical URL declared as an absolute http(s) link',
  rationale:
    'Without a canonical, near-duplicate pages (trailing slashes, query strings, locales) compete for the same ranking signals — splitting authority across versions. The canonical link tells search engines which URL to consolidate signals onto.',
  docsUrl: 'https://answerfox.dev/docs/checks/A4',
  run: ({ dom }) => {
    const href = dom('link[rel="canonical"]').attr('href')?.trim();
    if (!href) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <link rel="canonical" href="https://example.com/page"> inside <head>. Use defineSeo() from @answerfox/metadata to emit this automatically.',
      };
    }
    const isAbsolute = /^https?:\/\//i.test(href);
    if (!isAbsolute) {
      return {
        status: 'warn',
        evidence: `Canonical href is relative: "${href}"`,
        fixRecommendation:
          'Use an absolute https URL for the canonical link. Relative canonicals are valid but error-prone across crawlers.',
      };
    }
    return {
      status: 'pass',
      evidence: `Canonical: ${href}`,
    };
  },
});
