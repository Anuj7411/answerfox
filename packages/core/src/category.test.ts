import { describe, expect, it } from 'vitest';
import { CATEGORY_ID_PREFIX, CATEGORY_POINT_BUDGET, CategorySchema } from './category.js';

describe('CategorySchema', () => {
  it('accepts each documented category', () => {
    const valid = [
      'meta-and-technical',
      'content-structure',
      'structured-data',
      'eeat-and-authority',
      'offsite-citations',
      'og-and-social',
      'agent-readiness',
      'agentic-commerce',
    ] as const;
    for (const c of valid) {
      expect(CategorySchema.parse(c)).toBe(c);
    }
  });

  it('rejects unknown categories', () => {
    expect(() => CategorySchema.parse('performance')).toThrow();
  });
});

describe('CATEGORY_ID_PREFIX', () => {
  it('maps every category to a single uppercase letter', () => {
    for (const prefix of Object.values(CATEGORY_ID_PREFIX)) {
      expect(prefix).toMatch(/^[A-Z]$/);
    }
  });

  it('uses unique prefixes across categories', () => {
    const prefixes = Object.values(CATEGORY_ID_PREFIX);
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });
});

describe('CATEGORY_POINT_BUDGET', () => {
  it('classic SEO/AEO/GEO (A-F) still totals 92, with AR + commerce on top', () => {
    // After v0.5/v0.6 reweights the budget grew: A-F unchanged in shape
    // but C shrank when v0.4 reorganised, then v0.5 re-added 4 pts. G
    // (agent-readiness) is 39 now, H (agentic-commerce) is 12.
    // Score normalisation in the runner handles the 100-point UX promise.
    const af = (
      [
        'meta-and-technical',
        'content-structure',
        'structured-data',
        'eeat-and-authority',
        'offsite-citations',
        'og-and-social',
      ] as const
    ).reduce((sum, c) => sum + CATEGORY_POINT_BUDGET[c], 0);
    expect(af).toBe(92);
    expect(CATEGORY_POINT_BUDGET['agent-readiness']).toBe(39);
    expect(CATEGORY_POINT_BUDGET['agentic-commerce']).toBe(12);
  });

  it('has a non-negative budget for every category', () => {
    for (const points of Object.values(CATEGORY_POINT_BUDGET)) {
      expect(points).toBeGreaterThanOrEqual(0);
    }
  });

  it('has a positive budget for every scored category (A-H starting v0.6)', () => {
    const scoredCategories = [
      'meta-and-technical',
      'content-structure',
      'structured-data',
      'eeat-and-authority',
      'offsite-citations',
      'og-and-social',
      'agent-readiness',
      'agentic-commerce',
    ] as const;
    for (const c of scoredCategories) {
      expect(CATEGORY_POINT_BUDGET[c]).toBeGreaterThan(0);
    }
  });

  it('weights agent-readiness as the wedge category (v0.5+ reweight)', () => {
    // G category became the headline wedge in v0.5: 35 pts after
    // phase 1 (added G7 llms.txt), then 39 after phase 2 (added G8
    // Web Bot Auth). The site detail page leads with this metric.
    expect(CATEGORY_POINT_BUDGET['agent-readiness']).toBe(39);
  });
});
