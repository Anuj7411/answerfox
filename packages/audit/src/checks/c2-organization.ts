import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

function nodeHasType(value: unknown, target: string): boolean {
  if (value === null || typeof value !== 'object') return false;
  const typeField = (value as Record<string, unknown>)['@type'];
  if (typeof typeField === 'string') {
    return typeField === target;
  }
  if (Array.isArray(typeField)) {
    return typeField.some((t) => t === target);
  }
  return false;
}

function findOrganization(parsed: unknown): boolean {
  if (Array.isArray(parsed)) {
    return parsed.some((item) => findOrganization(item));
  }
  if (parsed === null || typeof parsed !== 'object') return false;
  if (nodeHasType(parsed, 'Organization')) return true;
  // schema.org Graph form: { "@context": "...", "@graph": [ ... ] }
  const graph = (parsed as Record<string, unknown>)['@graph'];
  if (Array.isArray(graph)) {
    return graph.some((node) => findOrganization(node));
  }
  return false;
}

export const c2Organization = defineCheck<AuditDom>({
  id: 'C2',
  category: 'structured-data',
  severity: 'high',
  points: 2,
  description: 'Organization JSON-LD present',
  rationale:
    'Organization schema is what tells Google and AI answer engines who you are as an entity — name, logo, social profiles, contact. It powers the brand panel in SERPs and is the foundation for E-E-A-T (the second E is for entity).',
  docsUrl: 'https://answerfox.dev/docs/checks/C2',
  run: ({ dom }) => {
    const blocks = dom('script[type="application/ld+json"]');
    if (blocks.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add an Organization JSON-LD block. Use organization() from @answerfox/schemas in your root layout.',
      };
    }
    let found = false;
    blocks.each((_, el) => {
      const raw = dom(el).text();
      try {
        const parsed: unknown = JSON.parse(raw);
        if (findOrganization(parsed)) {
          found = true;
        }
      } catch {
        // Invalid JSON is caught by C1; ignore here.
      }
    });
    if (found) {
      return { status: 'pass', evidence: 'Found @type="Organization" in JSON-LD' };
    }
    return {
      status: 'fail',
      fixRecommendation:
        'Add an Organization JSON-LD block. Use organization() from @answerfox/schemas.',
    };
  },
});
