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
  it('SEO/AEO/GEO categories (A-F) total exactly 100', () => {
    // Category G (agent-readiness) is informational in v0.3.x, it has
    // points: 0 so it doesn't move the base 0-100 score. Sum the rest.
    const total = (Object.values(CATEGORY_POINT_BUDGET) as number[]).reduce((sum, n) => sum + n, 0);
    expect(total).toBe(100);
  });

  it('has a non-negative budget for every category', () => {
    for (const points of Object.values(CATEGORY_POINT_BUDGET)) {
      expect(points).toBeGreaterThanOrEqual(0);
    }
  });

  it('has a positive budget for every scored category (A-F)', () => {
    const scoredCategories = [
      'meta-and-technical',
      'content-structure',
      'structured-data',
      'eeat-and-authority',
      'offsite-citations',
      'og-and-social',
    ] as const;
    for (const c of scoredCategories) {
      expect(CATEGORY_POINT_BUDGET[c]).toBeGreaterThan(0);
    }
  });

  it('marks agent-readiness as informational (zero-pointed in v0.3.x)', () => {
    expect(CATEGORY_POINT_BUDGET['agent-readiness']).toBe(0);
  });
});
