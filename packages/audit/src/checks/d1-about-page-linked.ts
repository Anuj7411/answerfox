import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const d1AboutPageLinked = defineCheck<AuditDom>({
  id: 'D1',
  category: 'eeat-and-authority',
  severity: 'critical',
  points: 3,
  description: 'About page linked from this page',
  rationale:
    "An About page is the single most-cited E-E-A-T signal Google enumerates. AI answer engines also crawl the About page to understand who's behind the content. No About link = no trust anchor.",
  docsUrl: 'https://answerfox.dev/docs/checks/D1',
  run: ({ dom }) => {
    const links = dom('a[href]').filter((_, el) => {
      const href = dom(el).attr('href') ?? '';
      return /\/about(\/|$|\?|#)/i.test(href);
    });
    if (links.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Link to an /about page from this page (nav, footer, or body). Use the `about` template from @answerfox/templates to scaffold one.',
      };
    }
    return { status: 'pass', evidence: `Found ${links.length} link(s) to /about` };
  },
});
