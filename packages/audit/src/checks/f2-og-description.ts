import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const f2OgDescription = defineCheck<AuditDom>({
  id: 'F2',
  category: 'og-and-social',
  severity: 'high',
  points: 1,
  description: 'og:description set',
  rationale:
    'Open Graph description is the body text underneath the link preview when your page is shared. Without it, social platforms either pull from meta description (if you have one) or leave the snippet blank — which kills click-through.',
  docsUrl: 'https://answerfox.dev/docs/checks/F2',
  run: ({ dom }) => {
    const content = dom('meta[property="og:description"]').attr('content')?.trim() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta property="og:description" content="..."> inside <head>. defineSeo() emits this automatically.',
      };
    }
    return { status: 'pass', evidence: `og:description="${content}"` };
  },
});
