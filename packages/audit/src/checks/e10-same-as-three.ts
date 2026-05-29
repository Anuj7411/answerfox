import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const MIN_SAME_AS = 3;

/**
 * Recursively walk a JSON-LD value looking for an `Organization` node
 * (plain object, member of an array, or nested under `@graph`) and
 * return its `sameAs` value as a string[]. The first Organization
 * with a non-empty sameAs wins.
 */
function findSameAs(parsed: unknown): string[] {
  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      const out = findSameAs(item);
      if (out.length > 0) return out;
    }
    return [];
  }
  if (parsed === null || typeof parsed !== 'object') return [];
  const node = parsed as Record<string, unknown>;
  const typeField = node['@type'];
  const isOrg =
    typeField === 'Organization' ||
    (Array.isArray(typeField) && typeField.includes('Organization'));
  if (isOrg) {
    const sameAs = node.sameAs;
    if (Array.isArray(sameAs)) {
      return sameAs.filter((v): v is string => typeof v === 'string');
    }
    if (typeof sameAs === 'string') return [sameAs];
  }
  const graph = node['@graph'];
  if (Array.isArray(graph)) {
    for (const child of graph) {
      const out = findSameAs(child);
      if (out.length > 0) return out;
    }
  }
  return [];
}

export const e10SameAsThree = defineCheck<AuditDom>({
  id: 'E10',
  category: 'offsite-citations',
  severity: 'medium',
  points: 2,
  description: 'Organization JSON-LD sameAs has ≥3 authoritative profile URLs',
  rationale:
    'The sameAs property on Organization JSON-LD is the most direct entity-graph signal you control. Three or more authoritative profiles (Twitter, LinkedIn, GitHub, Wikipedia, Crunchbase) ties your brand into the wider knowledge graph.',
  docsUrl: 'https://answerfox.dev/docs/checks/E10',
  run: ({ dom }) => {
    let best: string[] = [];
    dom('script[type="application/ld+json"]').each((_, el) => {
      const raw = dom(el).text();
      try {
        const parsed: unknown = JSON.parse(raw);
        const sameAs = findSameAs(parsed);
        if (sameAs.length > best.length) {
          best = sameAs;
        }
      } catch {
        // Invalid JSON handled by C1.
      }
    });

    if (best.length === 0) {
      return {
        status: 'fail',
        fixRecommendation: `Add a sameAs array to your Organization JSON-LD with ≥${MIN_SAME_AS} authoritative profile URLs. Use organization({ sameAs: [...] }) from @answerfox/schemas.`,
      };
    }
    if (best.length < MIN_SAME_AS) {
      return {
        status: 'warn',
        evidence: `sameAs has ${best.length} entr${best.length === 1 ? 'y' : 'ies'} (need ≥${MIN_SAME_AS})`,
        fixRecommendation: `Add more sameAs URLs (target ≥${MIN_SAME_AS}). Common picks: Twitter/X, LinkedIn, GitHub, Wikipedia.`,
      };
    }
    return { status: 'pass', evidence: `sameAs has ${best.length} entries` };
  },
});
