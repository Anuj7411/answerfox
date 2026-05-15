import { defineCheck } from '@answerable/core';
import type { AuditDom } from '../parser.js';

const MIN_LENGTH = 120;
const MAX_LENGTH = 160;

export const a3Description = defineCheck<AuditDom>({
  id: 'A3',
  category: 'meta-and-technical',
  severity: 'critical',
  points: 3,
  description: 'Meta description present and 120-160 chars long',
  rationale:
    'The meta description controls the SERP snippet 70% of the time. Missing descriptions force Google to synthesize one (often poorly). Out-of-range descriptions get truncated or padded with site boilerplate.',
  docsUrl: 'https://answerable.dev/docs/checks/A3',
  run: ({ dom }) => {
    const description = dom('meta[name="description"]').attr('content')?.trim() ?? '';
    if (!description) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta name="description" content="..."> inside <head>. Aim for 120-160 chars summarizing the page.',
      };
    }
    const len = description.length;
    if (len < MIN_LENGTH || len > MAX_LENGTH) {
      return {
        status: 'warn',
        evidence: `Description is ${len} chars: "${description}"`,
        fixRecommendation: `Adjust the meta description to 120-160 characters (currently ${len}).`,
      };
    }
    return {
      status: 'pass',
      evidence: `Description (${len} chars): "${description}"`,
    };
  },
});
