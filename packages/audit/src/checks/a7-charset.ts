import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

export const a7Charset = defineCheck<AuditDom>({
  id: 'A7',
  category: 'meta-and-technical',
  severity: 'medium',
  points: 1,
  description: 'Document charset declared as UTF-8',
  rationale:
    'Without an explicit charset declaration, browsers guess — usually correctly, but not always. Mis-detected encoding breaks special characters (currency symbols, accented letters, em dashes). The HTML5 form `<meta charset="utf-8">` is one line and ends the ambiguity.',
  docsUrl: 'https://answerfox.dev/docs/checks/A7',
  run: ({ dom }) => {
    // Prefer the modern <meta charset="..."> form; fall back to the legacy http-equiv form.
    const modernCharset = dom('meta[charset]').attr('charset')?.trim();
    const legacyContentType = dom('meta[http-equiv="Content-Type" i]').attr('content')?.trim();
    const legacyCharset = legacyContentType?.match(/charset\s*=\s*([\w-]+)/i)?.[1];
    const charset = (modernCharset ?? legacyCharset)?.toLowerCase();
    if (!charset) {
      return {
        status: 'fail',
        fixRecommendation: 'Add <meta charset="utf-8"> as the first element inside <head>.',
      };
    }
    if (charset !== 'utf-8' && charset !== 'utf8') {
      return {
        status: 'warn',
        evidence: `Declared charset: ${charset}`,
        fixRecommendation:
          'Use UTF-8. Non-UTF-8 encodings (Windows-1252, ISO-8859-1) break emoji and many international characters.',
      };
    }
    return { status: 'pass', evidence: `charset=${charset}` };
  },
});
