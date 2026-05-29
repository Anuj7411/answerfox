import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const f5OgUrl = defineCheck<AuditDom>({
  id: 'F5',
  category: 'og-and-social',
  severity: 'medium',
  points: 1,
  description: 'og:url declared as the canonical absolute URL',
  rationale:
    "og:url lets social platforms know which canonical URL to associate share counts and link metadata with. Without it, the same page reachable via UTM-tagged links accumulates separate share counts. Should match the page's canonical link.",
  docsUrl: 'https://answerfox.dev/docs/checks/F5',
  run: ({ dom }) => {
    const content = dom('meta[property="og:url"]').attr('content')?.trim() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta property="og:url" content="https://example.com/page">. Should match the canonical link.',
      };
    }
    if (!/^https?:\/\//i.test(content)) {
      return {
        status: 'warn',
        evidence: `og:url="${content}" (relative)`,
        fixRecommendation: 'Use an absolute https URL for og:url.',
      };
    }
    return { status: 'pass', evidence: `og:url="${content}"` };
  },
});
