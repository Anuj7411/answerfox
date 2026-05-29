import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const e11LinkedinLinked = defineCheck<AuditDom>({
  id: 'E11',
  category: 'offsite-citations',
  severity: 'low',
  points: 1,
  description: 'LinkedIn company or personal profile linked',
  rationale:
    'LinkedIn is the highest-authority "who works here" signal. For B2B-leaning products, a LinkedIn link in the footer or About page improves entity-graph completeness with minimal effort.',
  docsUrl: 'https://answerfox.dev/docs/checks/E11',
  run: ({ dom }) => {
    const links = dom('a[href]').filter((_, el) => {
      const href = (dom(el).attr('href') ?? '').toLowerCase();
      return href.includes('linkedin.com');
    });
    if (links.length === 0) {
      return {
        status: 'warn',
        fixRecommendation:
          'Link your LinkedIn company or personal profile from the footer or About page.',
      };
    }
    return { status: 'pass', evidence: `${links.length} linkedin.com link(s)` };
  },
});
