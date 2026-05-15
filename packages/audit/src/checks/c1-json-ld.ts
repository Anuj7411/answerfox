import { defineCheck } from '@answerable/core';
import type { AuditDom } from '../parser.js';

interface JsonLdSummary {
  readonly index: number;
  readonly type: string | undefined;
}

function summarizeJsonLd(raw: string, index: number): JsonLdSummary | { error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  if (parsed === null || typeof parsed !== 'object') {
    return { index, type: undefined };
  }
  // schema.org JSON-LD may be a single object, an array (Graph form), or
  // an object with @graph. Pull a representative @type label for evidence.
  const root = Array.isArray(parsed) ? parsed[0] : parsed;
  if (root === null || typeof root !== 'object') {
    return { index, type: undefined };
  }
  const typeValue = (root as Record<string, unknown>)['@type'];
  const type = typeof typeValue === 'string' ? typeValue : undefined;
  return { index, type };
}

export const c1JsonLd = defineCheck<AuditDom>({
  id: 'C1',
  category: 'structured-data',
  severity: 'critical',
  points: 3,
  description: 'At least one <script type="application/ld+json"> with valid JSON',
  rationale:
    'JSON-LD is how Google, Perplexity, ChatGPT, and Claude understand a page beyond its prose. Missing structured data forces engines to infer entity type, often badly. Even one block (Organization, WebSite) lifts most pages out of the lowest tier.',
  docsUrl: 'https://answerable.dev/docs/checks/C1',
  run: ({ dom }) => {
    const blocks = dom('script[type="application/ld+json"]');
    if (blocks.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add a JSON-LD block. Start with organization() from @answerable/schemas in your root layout.',
      };
    }

    const summaries: JsonLdSummary[] = [];
    const errors: string[] = [];
    blocks.each((i, el) => {
      const raw = dom(el).text();
      const result = summarizeJsonLd(raw, i);
      if ('error' in result) {
        errors.push(`block ${i}: ${result.error}`);
      } else {
        summaries.push(result);
      }
    });

    if (summaries.length === 0) {
      return {
        status: 'warn',
        evidence: `Found ${blocks.length} JSON-LD block(s), but none parsed: ${errors.join('; ')}`,
        fixRecommendation:
          'Fix the JSON syntax in your structured-data blocks. JSON.parse must succeed.',
      };
    }

    const typeList = summaries
      .map((s) => s.type ?? '?')
      .filter((t, i, arr) => arr.indexOf(t) === i)
      .join(', ');
    const errorTail = errors.length > 0 ? ` (${errors.length} invalid block(s) ignored)` : '';
    return {
      status: 'pass',
      evidence: `${summaries.length} block(s): ${typeList}${errorTail}`,
    };
  },
});
