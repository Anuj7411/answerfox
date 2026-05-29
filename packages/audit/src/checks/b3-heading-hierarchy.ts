import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const b3HeadingHierarchy = defineCheck<AuditDom>({
  id: 'B3',
  category: 'content-structure',
  severity: 'high',
  points: 2,
  description: 'Logical heading hierarchy (h2 before h3, no skipped levels)',
  rationale:
    'Screen readers and AI extraction models use heading order as the document outline. Skipping from h1 → h3 (with no h2 between) tells them the h3 is a subsection of nothing, which breaks chunking.',
  docsUrl: 'https://answerfox.dev/docs/checks/B3',
  run: ({ dom }) => {
    const headings = dom('h2, h3');
    if (headings.length === 0) {
      return { status: 'skip', evidence: 'No h2 or h3 elements to evaluate.' };
    }

    const firstTag = headings.first().prop('tagName')?.toLowerCase();
    if (firstTag === 'h3' && dom('h2').length === 0) {
      return {
        status: 'warn',
        evidence: 'Page uses h3 without any h2',
        fixRecommendation:
          'Use h2 for major sections and h3 for subsections under each h2. Skipping h2 confuses screen readers and content extractors.',
      };
    }
    if (firstTag === 'h3') {
      return {
        status: 'warn',
        evidence: 'First subheading is an h3 (precedes any h2)',
        fixRecommendation: 'Start the page outline with h2 before introducing h3 subsections.',
      };
    }
    return {
      status: 'pass',
      evidence: `${dom('h2').length} h2, ${dom('h3').length} h3 in order`,
    };
  },
});
