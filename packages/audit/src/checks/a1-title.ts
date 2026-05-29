import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const MIN_LENGTH = 30;
const MAX_LENGTH = 60;

export const a1Title = defineCheck<AuditDom>({
  id: 'A1',
  category: 'meta-and-technical',
  severity: 'critical',
  points: 3,
  description: '<title> present and 30-60 chars long',
  rationale:
    'The <title> is the single most prominent surface in SERPs and AI answer engines. Empty titles disappear; titles under 30 chars under-utilize valuable space; titles over 60 are truncated in Google SERPs.',
  docsUrl: 'https://answerfox.dev/docs/checks/A1',
  run: ({ dom }) => {
    const title = dom('title').first().text().trim();
    if (!title) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add a <title> tag inside <head>. Target 30-60 characters and include the page topic + brand.',
      };
    }
    const len = title.length;
    if (len < MIN_LENGTH || len > MAX_LENGTH) {
      return {
        status: 'warn',
        evidence: `Title is ${len} chars: "${title}"`,
        fixRecommendation: `Adjust the <title> to 30-60 characters (currently ${len}).`,
      };
    }
    return {
      status: 'pass',
      evidence: `Title (${len} chars): "${title}"`,
    };
  },
});
