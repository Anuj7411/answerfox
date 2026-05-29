import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a8Robots = defineCheck<AuditDom>({
  id: 'A8',
  category: 'meta-and-technical',
  severity: 'high',
  points: 2,
  description: 'Robots meta consistent with intent (no accidental noindex)',
  rationale:
    'A stray `noindex` is the most common SEO own-goal — usually left over from a staging environment. Pages with noindex never rank, period. This check flags any robots directive that could be hiding the page from search.',
  docsUrl: 'https://answerfox.dev/docs/checks/A8',
  run: ({ dom }) => {
    const content = dom('meta[name="robots"]').attr('content')?.trim().toLowerCase() ?? '';
    if (!content) {
      // No robots meta means default (index, follow) — fine for a live page.
      return { status: 'pass', evidence: 'No robots meta (default: index, follow)' };
    }
    const hasNoindex = /\bnoindex\b/.test(content);
    const hasNofollow = /\bnofollow\b/.test(content);
    // Contradictory declarations: both "index" and "noindex", or both "follow" and "nofollow".
    if ((/\bindex\b/.test(content) && hasNoindex) || (/\bfollow\b/.test(content) && hasNofollow)) {
      return {
        status: 'fail',
        evidence: `content="${content}"`,
        fixRecommendation:
          'Resolve contradictory robots directives. Use either `index, follow` or `noindex, nofollow` — never both.',
      };
    }
    if (hasNoindex) {
      return {
        status: 'warn',
        evidence: `content="${content}"`,
        fixRecommendation:
          'Page is noindexed. If this is a live page, remove `noindex` — staging directives often leak into production.',
      };
    }
    if (hasNofollow) {
      return {
        status: 'warn',
        evidence: `content="${content}"`,
        fixRecommendation:
          'Page links carry `nofollow`. Confirm this is intentional — it tells search engines not to follow outbound links.',
      };
    }
    return {
      status: 'pass',
      evidence: `content="${content}"`,
    };
  },
});
