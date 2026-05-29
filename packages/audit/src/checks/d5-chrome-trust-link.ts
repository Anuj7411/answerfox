import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const d5ChromeTrustLink = defineCheck<AuditDom>({
  id: 'D5',
  category: 'eeat-and-authority',
  severity: 'high',
  points: 2,
  description: 'About / Trust link present in <nav> or <header>',
  rationale:
    'A trust link in the site chrome (nav or header) tells both users and crawlers that the site stands behind a public identity. Hiding About-style pages in a deep menu signals the opposite.',
  docsUrl: 'https://answerfox.dev/docs/checks/D5',
  run: ({ dom }) => {
    const chromeLinks = dom('nav a[href], header a[href]').filter((_, el) => {
      const href = dom(el).attr('href') ?? '';
      return /\/(about|team|company|newsroom)(\/|$|\?|#)/i.test(href);
    });
    if (chromeLinks.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Put an "About" (or Team / Newsroom) link in your <nav> or <header>. Visible trust links are what users see first; AI engines weight them more than footer links.',
      };
    }
    return { status: 'pass', evidence: `${chromeLinks.length} trust link(s) in chrome` };
  },
});
