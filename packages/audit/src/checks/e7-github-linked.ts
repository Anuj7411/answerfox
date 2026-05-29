import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const e7GithubLinked = defineCheck<AuditDom>({
  id: 'E7',
  category: 'offsite-citations',
  severity: 'medium',
  points: 2,
  description: 'GitHub profile / repository linked from the page',
  rationale:
    'For technical products, GitHub is the canonical proof-of-work surface. A visible GitHub link tells AI engines (and developer users) you ship real code; absence is a soft red flag for any dev-tools product.',
  docsUrl: 'https://answerfox.dev/docs/checks/E7',
  run: ({ dom }) => {
    const links = dom('a[href]').filter((_, el) => {
      const href = (dom(el).attr('href') ?? '').toLowerCase();
      return href.includes('github.com');
    });
    if (links.length === 0) {
      return {
        status: 'warn',
        fixRecommendation:
          "Link your GitHub from somewhere visible (footer or 'About' page). Skip this check for non-technical products by setting the audit to ignore E7.",
      };
    }
    return { status: 'pass', evidence: `${links.length} github.com link(s)` };
  },
});
