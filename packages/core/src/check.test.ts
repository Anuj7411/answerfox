import { describe, expect, it } from 'vitest';
import { defineCheck } from './check.js';
import { parseAbsoluteUrl } from './url.js';

describe('defineCheck', () => {
  it('returns the input unchanged (identity helper)', () => {
    const check = defineCheck({
      id: 'A1',
      category: 'meta-and-technical',
      severity: 'critical',
      points: 3,
      description: '<title> present, 30-60 chars',
      rationale: 'Search and AI engines display the title verbatim.',
      docsUrl: 'https://answerfox.dev/docs/checks/A1',
      run: () => ({ status: 'pass' }),
    });

    expect(check.id).toBe('A1');
    expect(check.category).toBe('meta-and-technical');
    expect(check.severity).toBe('critical');
    expect(check.points).toBe(3);
  });

  it('runs a sync check and returns its result', async () => {
    const check = defineCheck({
      id: 'A1',
      category: 'meta-and-technical',
      severity: 'critical',
      points: 3,
      description: '<title> present',
      rationale: 'A page must declare a title.',
      docsUrl: 'https://answerfox.dev/docs/checks/A1',
      run: ({ html }) =>
        /<title>/i.test(html)
          ? { status: 'pass' }
          : { status: 'fail', fixRecommendation: 'Add <title>' },
    });

    const url = parseAbsoluteUrl('https://example.com');
    const pass = await check.run({ url, html: '<html><title>Hi</title></html>', dom: null });
    expect(pass.status).toBe('pass');

    const fail = await check.run({ url, html: '<html></html>', dom: null });
    expect(fail.status).toBe('fail');
    expect(fail.fixRecommendation).toContain('Add');
  });

  it('supports async run functions', async () => {
    const check = defineCheck({
      id: 'A3',
      category: 'meta-and-technical',
      severity: 'critical',
      points: 3,
      description: 'meta description present',
      rationale: 'Snippets are pulled from meta description.',
      docsUrl: 'https://answerfox.dev/docs/checks/A3',
      run: async () => ({ status: 'pass' }),
    });

    const url = parseAbsoluteUrl('https://example.com');
    const result = await check.run({ url, html: '', dom: null });
    expect(result.status).toBe('pass');
  });
});
