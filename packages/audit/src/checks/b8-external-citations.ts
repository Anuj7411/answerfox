import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const b8ExternalCitations = defineCheck<AuditDom>({
  id: 'B8',
  category: 'content-structure',
  severity: 'medium',
  points: 1,
  description: 'At least one external citation (link to a different origin)',
  rationale:
    'Pages that cite authoritative outside sources earn more trust from both human readers and AI answer engines. Zero external links flag a page as a closed garden.',
  docsUrl: 'https://answerfox.dev/docs/checks/B8',
  run: ({ dom, url }) => {
    let pageOrigin: string;
    try {
      pageOrigin = new URL(url).origin;
    } catch {
      return { status: 'skip', evidence: 'Could not parse the page URL.' };
    }

    const externals: string[] = [];
    dom('a[href]').each((_, el) => {
      const href = dom(el).attr('href');
      if (href === undefined || !/^https?:\/\//i.test(href)) return;
      try {
        if (new URL(href).origin !== pageOrigin) {
          externals.push(href);
        }
      } catch {
        // ignore malformed
      }
    });

    if (externals.length === 0) {
      return {
        status: 'warn',
        fixRecommendation:
          'Add at least one external link to an authoritative source (research, official docs, well-known industry sites). External citations are a small but meaningful trust signal.',
      };
    }
    return { status: 'pass', evidence: `${externals.length} external link(s)` };
  },
});
