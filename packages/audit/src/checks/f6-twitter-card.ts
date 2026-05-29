import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const VALID_CARDS = new Set(['summary', 'summary_large_image', 'app', 'player']);

export const f6TwitterCard = defineCheck<AuditDom>({
  id: 'F6',
  category: 'og-and-social',
  severity: 'high',
  points: 1,
  description: 'twitter:card set to a recognised card type',
  rationale:
    'twitter:card controls how the page renders when shared on X (Twitter). Without it, the platform falls back to a tiny text-only card. `summary_large_image` is the default people actually want — full-bleed image and prominent title.',
  docsUrl: 'https://answerfox.dev/docs/checks/F6',
  run: ({ dom }) => {
    const content = dom('meta[name="twitter:card"]').attr('content')?.trim().toLowerCase() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta name="twitter:card" content="summary_large_image"> inside <head>.',
      };
    }
    if (!VALID_CARDS.has(content)) {
      return {
        status: 'warn',
        evidence: `twitter:card="${content}"`,
        fixRecommendation: `Use one of: summary, summary_large_image, app, player. Got "${content}".`,
      };
    }
    return { status: 'pass', evidence: `twitter:card="${content}"` };
  },
});
