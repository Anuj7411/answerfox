import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const f1OgTitle = defineCheck<AuditDom>({
  id: 'F1',
  category: 'og-and-social',
  severity: 'high',
  points: 1,
  description: 'og:title set',
  rationale:
    'Open Graph title is what appears when your page is shared on Facebook, LinkedIn, Slack, iMessage, and dozens of other platforms. Without it, those platforms fall back to the <title> tag — which often differs from how you want the shared link to read.',
  docsUrl: 'https://answerfox.dev/docs/checks/F1',
  run: ({ dom }) => {
    const content = dom('meta[property="og:title"]').attr('content')?.trim() ?? '';
    if (!content) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <meta property="og:title" content="..."> inside <head>. defineSeo() emits this automatically.',
      };
    }
    return { status: 'pass', evidence: `og:title="${content}"` };
  },
});
