import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const f7TwitterImage = defineCheck<AuditDom>({
  id: 'F7',
  category: 'og-and-social',
  severity: 'medium',
  points: 1,
  description: 'twitter:image declared (or og:image fallback acceptable)',
  rationale:
    'X (Twitter) falls back to og:image when twitter:image is missing, which is fine for most cases. Set a dedicated twitter:image only when the share preview should differ from the OG image (e.g. text-optimised crop for the 2:1 Twitter aspect).',
  docsUrl: 'https://answerfox.dev/docs/checks/F7',
  run: ({ dom }) => {
    const twitterImage = dom('meta[name="twitter:image"]').attr('content')?.trim();
    if (twitterImage !== undefined && twitterImage !== '') {
      if (!/^https?:\/\//i.test(twitterImage)) {
        return {
          status: 'warn',
          evidence: `twitter:image="${twitterImage}" (relative)`,
          fixRecommendation: 'Use an absolute https URL for twitter:image.',
        };
      }
      return { status: 'pass', evidence: `twitter:image="${twitterImage}"` };
    }
    // Twitter falls back to og:image when twitter:image is missing — acceptable.
    const ogImage = dom('meta[property="og:image"]').attr('content')?.trim();
    if (ogImage !== undefined && ogImage !== '') {
      return { status: 'pass', evidence: 'Falls back to og:image' };
    }
    return {
      status: 'fail',
      fixRecommendation:
        'Add <meta name="twitter:image" content="https://example.com/og.png"> or set og:image as the fallback.',
    };
  },
});
