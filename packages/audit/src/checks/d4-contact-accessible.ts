import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const d4ContactAccessible = defineCheck<AuditDom>({
  id: 'D4',
  category: 'eeat-and-authority',
  severity: 'high',
  points: 2,
  description: 'Contact information accessible from this page',
  rationale:
    'A clear way to reach the team is an E-E-A-T baseline. Either a /contact page or a visible mailto: link counts — but one of them must be present, or AI engines (and humans) flag the site as untrustworthy.',
  docsUrl: 'https://answerfox.dev/docs/checks/D4',
  run: ({ dom }) => {
    const contactLinks = dom('a[href]').filter((_, el) => {
      const href = dom(el).attr('href') ?? '';
      return /\/contact(\/|$|\?|#)/i.test(href);
    });
    const mailtoLinks = dom('a[href^="mailto:"]');
    if (contactLinks.length === 0 && mailtoLinks.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Provide a way to reach you — either a /contact page or a mailto: link in the footer. Use the `contact` template from @answerfox/templates.',
      };
    }
    const evidence: string[] = [];
    if (contactLinks.length > 0) evidence.push(`${contactLinks.length} /contact link(s)`);
    if (mailtoLinks.length > 0) evidence.push(`${mailtoLinks.length} mailto: link(s)`);
    return { status: 'pass', evidence: evidence.join(', ') };
  },
});
