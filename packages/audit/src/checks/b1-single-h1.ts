import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const b1SingleH1 = defineCheck<AuditDom>({
  id: 'B1',
  category: 'content-structure',
  severity: 'critical',
  points: 3,
  description: 'Exactly one <h1> on the page',
  rationale:
    'Search engines and AI answer engines use the <h1> to identify the primary topic of the page. Zero h1s leaves them guessing; multiple h1s split the signal and dilute ranking authority.',
  docsUrl: 'https://answerfox.dev/docs/checks/B1',
  run: ({ dom }) => {
    const h1s = dom('h1');
    if (h1s.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add exactly one <h1> per page. The h1 should clearly state the page topic.',
      };
    }
    if (h1s.length > 1) {
      return {
        status: 'warn',
        evidence: `Found ${h1s.length} <h1> elements`,
        fixRecommendation:
          'Use exactly one <h1> per page. Multiple h1s confuse search engines about the primary topic — convert the extras to h2.',
      };
    }
    const text = h1s.first().text().trim();
    return {
      status: 'pass',
      evidence: text.length > 0 ? `<h1>: "${text.slice(0, 80)}"` : 'Single empty <h1>',
    };
  },
});
