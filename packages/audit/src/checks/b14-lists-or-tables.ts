import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const b14ListsOrTables = defineCheck<AuditDom>({
  id: 'B14',
  category: 'content-structure',
  severity: 'medium',
  points: 2,
  description: 'Page uses lists (<ul>/<ol>) or tables for structured content',
  rationale:
    'AI answer engines preferentially extract content presented as lists and tables — they parse as structured data, not prose. A comparison written as a paragraph rarely gets surfaced; the same comparison in a table often does.',
  docsUrl: 'https://answerfox.dev/docs/checks/B14',
  run: ({ dom }) => {
    const ul = dom('ul').length;
    const ol = dom('ol').length;
    const table = dom('table').length;
    if (ul + ol + table === 0) {
      return {
        status: 'warn',
        fixRecommendation:
          'Use <ul>, <ol>, or <table> for any content that compares, enumerates, or lists. Structured content is what AI engines quote.',
      };
    }
    return {
      status: 'pass',
      evidence: `${ul} <ul>, ${ol} <ol>, ${table} <table>`,
    };
  },
});
