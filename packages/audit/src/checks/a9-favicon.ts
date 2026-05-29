import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a9Favicon = defineCheck<AuditDom>({
  id: 'A9',
  category: 'meta-and-technical',
  severity: 'medium',
  points: 1,
  description: 'Favicon linked (any of rel="icon", "shortcut icon", or "mask-icon")',
  rationale:
    'Browsers fall back to /favicon.ico when no icon is declared, but the explicit form lets you ship modern multi-size SVG and PNG icons. Missing favicon links also miss the chance to brand bookmarks, browser tabs, and platform pinned-site widgets.',
  docsUrl: 'https://answerfox.dev/docs/checks/A9',
  run: ({ dom }) => {
    const iconLinks = dom('link[rel~="icon"], link[rel="shortcut icon"], link[rel="mask-icon"]');
    if (iconLinks.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add <link rel="icon" href="/favicon.ico"> at minimum. Prefer multiple sizes (16, 32, 180) plus an SVG.',
      };
    }
    if (iconLinks.length === 1) {
      return {
        status: 'warn',
        evidence: 'Found 1 icon link',
        fixRecommendation:
          'Ship multiple favicon sizes (16, 32, 180) plus an SVG for Retina + dark-mode-aware icons.',
      };
    }
    return { status: 'pass', evidence: `Found ${iconLinks.length} icon link(s)` };
  },
});
