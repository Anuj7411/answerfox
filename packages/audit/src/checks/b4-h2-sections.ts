import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/** Anything longer than this in visible body text is treated as "long enough to warrant chunking". */
const LONG_THRESHOLD_CHARS = 1500;

export const b4H2Sections = defineCheck<AuditDom>({
  id: 'B4',
  category: 'content-structure',
  severity: 'high',
  points: 2,
  description: 'Long pages broken into multiple h2 sections',
  rationale:
    'AI answer engines extract paragraphs anchored to their nearest heading. A 2000-word wall with no h2 is one chunk; the same content with five h2 sections is five quotable answers. Chunking is what makes a page "answerable".',
  docsUrl: 'https://answerfox.dev/docs/checks/B4',
  run: ({ dom }) => {
    const bodyText = (dom('body').first().text() || dom.root().text()).trim();
    const len = bodyText.length;
    if (len < LONG_THRESHOLD_CHARS) {
      return {
        status: 'pass',
        evidence: `Page is short (${len} chars); h2 sectioning not required.`,
      };
    }
    const h2Count = dom('h2').length;
    if (h2Count < 2) {
      return {
        status: 'warn',
        evidence: `Long page (${len} chars) with only ${h2Count} h2 section(s)`,
        fixRecommendation:
          'Break long content into h2 sections (≥2) so AI engines can extract individual paragraphs as answers.',
      };
    }
    return { status: 'pass', evidence: `${h2Count} h2 sections across ${len} chars of body text` };
  },
});
