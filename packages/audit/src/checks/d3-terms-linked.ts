import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const d3TermsLinked = defineCheck<AuditDom>({
  id: 'D3',
  category: 'eeat-and-authority',
  severity: 'high',
  points: 2,
  description: 'Terms of use linked from this page',
  rationale:
    'Terms of use set the contract between site and user — required for any service that takes payment, collects accounts, or limits user behaviour. A missing terms page raises a red flag in trust-signal audits.',
  docsUrl: 'https://answerfox.dev/docs/checks/D3',
  run: ({ dom }) => {
    const links = dom('a[href]').filter((_, el) => {
      const href = dom(el).attr('href') ?? '';
      return /\/(terms|tos)(\/|$|\?|#)/i.test(href) || /terms-of-use/i.test(href);
    });
    if (links.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Link to a /terms page from this page (typically the footer). Use the `terms` template from @answerfox/templates.',
      };
    }
    return { status: 'pass', evidence: `Found ${links.length} link(s) to /terms` };
  },
});
