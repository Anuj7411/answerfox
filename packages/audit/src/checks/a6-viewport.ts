import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a6Viewport = defineCheck<AuditDom>({
  id: 'A6',
  category: 'meta-and-technical',
  severity: 'high',
  points: 2,
  description: 'Viewport meta tag declares device-width + initial-scale=1',
  rationale:
    'Without a viewport meta, mobile browsers render at desktop width and scale down — text becomes unreadable and Google Mobile-Friendly checks fail. The canonical value is `width=device-width, initial-scale=1`.',
  docsUrl: 'https://answerfox.dev/docs/checks/A6',
  run: ({ dom }) => {
    const content = dom('meta[name="viewport"]').attr('content')?.trim() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.',
      };
    }
    const hasWidth = /width\s*=\s*device-width/i.test(content);
    const hasScale = /initial-scale\s*=\s*1(\.0+)?\b/i.test(content);
    if (hasWidth && hasScale) {
      return { status: 'pass', evidence: `content="${content}"` };
    }
    return {
      status: 'warn',
      evidence: `content="${content}"`,
      fixRecommendation:
        'Include both width=device-width and initial-scale=1 in the viewport meta.',
    };
  },
});
