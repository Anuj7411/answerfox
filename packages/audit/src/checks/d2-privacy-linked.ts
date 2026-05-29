import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const d2PrivacyLinked = defineCheck<AuditDom>({
  id: 'D2',
  category: 'eeat-and-authority',
  severity: 'critical',
  points: 3,
  description: 'Privacy policy linked from this page',
  rationale:
    "A privacy policy is a baseline legal and trust requirement — GDPR, CCPA, and Google all expect one. Missing privacy is both a compliance risk and a signal that the site isn't serious.",
  docsUrl: 'https://answerfox.dev/docs/checks/D2',
  run: ({ dom }) => {
    const links = dom('a[href]').filter((_, el) => {
      const href = dom(el).attr('href') ?? '';
      return /\/privacy(\/|$|\?|#)/i.test(href) || /privacy-policy/i.test(href);
    });
    if (links.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Link to a /privacy page from this page (typically the footer). Use the `privacy` template from @answerfox/templates.',
      };
    }
    return { status: 'pass', evidence: `Found ${links.length} link(s) to /privacy` };
  },
});
