import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const f3OgImage = defineCheck<AuditDom>({
  id: 'F3',
  category: 'og-and-social',
  severity: 'high',
  points: 2,
  description: 'og:image declared with an absolute http(s) URL',
  rationale:
    'The Open Graph image is the single biggest driver of social-share click-through. A 1200×630 dedicated image roughly triples engagement vs no image. Relative URLs are valid spec but crawled inconsistently — Facebook and LinkedIn both prefer absolute.',
  docsUrl: 'https://answerfox.dev/docs/checks/F3',
  run: ({ dom }) => {
    const content = dom('meta[property="og:image"]').attr('content')?.trim() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta property="og:image" content="https://example.com/og.png">. Target 1200×630 px.',
      };
    }
    if (!/^https?:\/\//i.test(content)) {
      return {
        status: 'warn',
        evidence: `og:image="${content}" (relative)`,
        fixRecommendation:
          'Use an absolute https URL for og:image. Facebook and LinkedIn crawlers handle absolute paths most reliably.',
      };
    }
    return { status: 'pass', evidence: `og:image="${content}"` };
  },
});
