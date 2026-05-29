import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a10AppleTouchIcon = defineCheck<AuditDom>({
  id: 'A10',
  category: 'meta-and-technical',
  severity: 'low',
  points: 1,
  description: 'Apple touch icon linked',
  rationale:
    'Pinned web apps and bookmarked sites on iOS use the apple-touch-icon. Without it, iOS scales the favicon up and the result looks pixelated. 180×180 PNG is the modern recommendation.',
  docsUrl: 'https://answerfox.dev/docs/checks/A10',
  run: ({ dom }) => {
    const apple = dom('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]');
    if (apple.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">.',
      };
    }
    return { status: 'pass', evidence: `Found ${apple.length} apple-touch-icon link(s)` };
  },
});
