import { InvalidUrlError, SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { buildSitemap } from './build-sitemap.js';

const BASE = { baseUrl: 'https://acme.com' } as const;

describe('buildSitemap — URL composition', () => {
  it('joins baseUrl + path without producing a double slash', () => {
    const out = buildSitemap([{ path: '/' }, { path: '/about' }], BASE);
    expect(out[0]?.url).toBe('https://acme.com/');
    expect(out[1]?.url).toBe('https://acme.com/about');
  });

  it('strips a trailing slash from baseUrl before joining', () => {
    const out = buildSitemap([{ path: '/about' }], { baseUrl: 'https://acme.com/' });
    expect(out[0]?.url).toBe('https://acme.com/about');
  });

  it('throws InvalidUrlError on a non-http baseUrl', () => {
    expect(() => buildSitemap([{ path: '/' }], { baseUrl: 'ftp://acme.com' })).toThrow(
      InvalidUrlError,
    );
  });
});

describe('buildSitemap — smart defaults', () => {
  it('infers home as priority 1.0 / daily', () => {
    const out = buildSitemap([{ path: '/' }], BASE);
    expect(out[0]?.priority).toBe(1.0);
    expect(out[0]?.changeFrequency).toBe('daily');
  });

  it('infers /blog/* as priority 0.7 / weekly', () => {
    const out = buildSitemap([{ path: '/blog/launch' }], BASE);
    expect(out[0]?.priority).toBe(0.7);
    expect(out[0]?.changeFrequency).toBe('weekly');
  });

  it('infers /news/* and /posts/* the same way as /blog/*', () => {
    const out = buildSitemap([{ path: '/news/may' }, { path: '/posts/some-post' }], BASE);
    expect(out[0]?.priority).toBe(0.7);
    expect(out[1]?.priority).toBe(0.7);
  });

  it('infers /docs/* as priority 0.6 / weekly', () => {
    const out = buildSitemap([{ path: '/docs/intro' }], BASE);
    expect(out[0]?.priority).toBe(0.6);
    expect(out[0]?.changeFrequency).toBe('weekly');
  });

  it('infers /products/* and /pricing as priority 0.8 / weekly', () => {
    const out = buildSitemap([{ path: '/products/widget' }, { path: '/pricing' }], BASE);
    expect(out[0]?.priority).toBe(0.8);
    expect(out[1]?.priority).toBe(0.8);
  });

  it('infers trust pages as priority 0.3 / yearly', () => {
    for (const path of ['/about', '/privacy', '/terms', '/contact', '/faq']) {
      const out = buildSitemap([{ path }], BASE);
      expect(out[0]?.priority).toBe(0.3);
      expect(out[0]?.changeFrequency).toBe('yearly');
    }
  });

  it('falls back to priority 0.5 / monthly for unmatched paths', () => {
    const out = buildSitemap([{ path: '/some-random-page' }], BASE);
    expect(out[0]?.priority).toBe(0.5);
    expect(out[0]?.changeFrequency).toBe('monthly');
  });

  it('lets explicit priority and changeFrequency override inferred defaults', () => {
    const out = buildSitemap(
      [{ path: '/blog/post', priority: 0.9, changeFrequency: 'always' }],
      BASE,
    );
    expect(out[0]?.priority).toBe(0.9);
    expect(out[0]?.changeFrequency).toBe('always');
  });

  it('mixes explicit and inferred per-field (priority set, frequency inferred)', () => {
    const out = buildSitemap([{ path: '/blog/post', priority: 0.95 }], BASE);
    expect(out[0]?.priority).toBe(0.95);
    expect(out[0]?.changeFrequency).toBe('weekly'); // inferred
  });
});

describe('buildSitemap — lastModified', () => {
  it('passes a Date instance through unchanged', () => {
    const d = new Date('2026-05-14T12:00:00Z');
    const out = buildSitemap([{ path: '/', lastModified: d }], BASE);
    expect(out[0]?.lastModified).toBe(d);
  });

  it('passes a valid ISO 8601 string through unchanged', () => {
    const out = buildSitemap([{ path: '/', lastModified: '2026-05-14' }], BASE);
    expect(out[0]?.lastModified).toBe('2026-05-14');
  });

  it('throws SchemaValidationError on an invalid ISO date string', () => {
    expect(() => buildSitemap([{ path: '/', lastModified: '5/14/2026' }], BASE)).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on an impossible calendar date', () => {
    expect(() => buildSitemap([{ path: '/', lastModified: '2026-02-30' }], BASE)).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on an Invalid Date object', () => {
    expect(() => buildSitemap([{ path: '/', lastModified: new Date('not a date') }], BASE)).toThrow(
      SchemaValidationError,
    );
  });
});

describe('buildSitemap — validation', () => {
  it('throws SchemaValidationError when a path does not start with /', () => {
    try {
      buildSitemap([{ path: 'about' }], BASE);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues[0]).toContain('must start with "/"');
    }
  });

  it('throws SchemaValidationError when a path is a full URL', () => {
    expect(() => buildSitemap([{ path: 'https://acme.com/about' }], BASE)).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on out-of-range priority', () => {
    expect(() => buildSitemap([{ path: '/', priority: 1.5 }], BASE)).toThrow(SchemaValidationError);
    expect(() => buildSitemap([{ path: '/', priority: -0.1 }], BASE)).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on duplicate paths', () => {
    try {
      buildSitemap([{ path: '/about' }, { path: '/contact' }, { path: '/about' }], BASE);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues[0]).toContain('duplicate');
    }
  });

  it('batches every issue across paths, priorities, and lastModified', () => {
    try {
      buildSitemap(
        [
          { path: 'about' }, // missing leading /
          { path: '/', priority: 2 }, // out of range
          { path: '/', lastModified: 'bad' }, // duplicate path + bad date
        ],
        BASE,
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues.length).toBeGreaterThanOrEqual(4);
      expect(issues.some((i) => i.includes('start with "/"'))).toBe(true);
      expect(issues.some((i) => i.includes('priority'))).toBe(true);
      expect(issues.some((i) => i.includes('duplicate'))).toBe(true);
      expect(issues.some((i) => i.includes('lastModified'))).toBe(true);
    }
  });

  it('accepts an empty routes array without throwing', () => {
    const out = buildSitemap([], BASE);
    expect(out).toEqual([]);
  });
});

describe('buildSitemap — alternates', () => {
  it('wraps a locale-URL map into the languages structure', () => {
    const out = buildSitemap(
      [
        {
          path: '/about',
          alternates: {
            'en-US': 'https://acme.com/about',
            'es-ES': 'https://acme.com/es/about',
          },
        },
      ],
      BASE,
    );
    expect(out[0]?.alternates).toEqual({
      languages: {
        'en-US': 'https://acme.com/about',
        'es-ES': 'https://acme.com/es/about',
      },
    });
  });

  it('throws InvalidUrlError on a malformed alternates URL', () => {
    expect(() =>
      buildSitemap([{ path: '/about', alternates: { 'en-US': 'not a url' } }], BASE),
    ).toThrow(InvalidUrlError);
  });
});
