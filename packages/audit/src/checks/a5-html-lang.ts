import { defineCheck } from '@answerable/core';
import type { AuditDom } from '../parser.js';

/**
 * Loose BCP 47 shape check: 2-3 letter primary tag, optional subtags.
 * Doesn't validate against the IANA registry — catches obvious junk
 * (numbers in primary tag, embedded spaces, single chars) without
 * flagging valid-but-uncommon tags.
 */
const BCP47_LIKE = /^[a-zA-Z]{2,3}(-[A-Za-z0-9]{1,8})*$/;

export const a5HtmlLang = defineCheck<AuditDom>({
  id: 'A5',
  category: 'meta-and-technical',
  severity: 'high',
  points: 2,
  description: '<html lang> attribute set to a BCP 47 language tag',
  rationale:
    'Screen readers, translation tools, and AI answer engines use <html lang> to know what language to interpret the page in. Without it, accessibility tooling guesses and assistive tech announces in the wrong voice.',
  docsUrl: 'https://answerable.dev/docs/checks/A5',
  run: ({ dom }) => {
    const lang = dom('html').attr('lang')?.trim();
    if (!lang) {
      return {
        status: 'fail',
        fixRecommendation: 'Set the lang attribute on <html>, e.g. <html lang="en">.',
      };
    }
    if (!BCP47_LIKE.test(lang)) {
      return {
        status: 'warn',
        evidence: `Suspicious lang value: "${lang}"`,
        fixRecommendation:
          'Use a BCP 47 tag like "en", "en-US", "fr", or "zh-Hant" — letters and dashes only.',
      };
    }
    return {
      status: 'pass',
      evidence: `lang="${lang}"`,
    };
  },
});
