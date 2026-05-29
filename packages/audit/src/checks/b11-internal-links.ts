import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const MIN_INTERNAL_LINKS = 3;

export const b11InternalLinks = defineCheck<AuditDom>({
  id: 'B11',
  category: 'content-structure',
  severity: 'medium',
  points: 1,
  description: '≥3 internal links to sibling pages',
  rationale:
    'Internal links distribute authority across the site and tell crawlers how pages relate. A page with zero internal links is a dead-end; a page with three or more is part of a navigable web.',
  docsUrl: 'https://answerfox.dev/docs/checks/B11',
  run: ({ dom }) => {
    const internals: string[] = [];
    dom('a[href]').each((_, el) => {
      const href = dom(el).attr('href') ?? '';
      // Internal: starts with `/` (path-only, not protocol-relative `//`).
      if (href.startsWith('/') && !href.startsWith('//')) {
        internals.push(href);
      }
    });

    if (internals.length < MIN_INTERNAL_LINKS) {
      return {
        status: 'warn',
        evidence: `Found ${internals.length} internal link(s)`,
        fixRecommendation: `Add ≥${MIN_INTERNAL_LINKS} internal links to sibling pages. Internal linking distributes authority and helps crawlers discover related content.`,
      };
    }
    return { status: 'pass', evidence: `${internals.length} internal link(s)` };
  },
});
