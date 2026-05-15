import { InvalidUrlError, SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { sitemapIndex } from './sitemap-index.js';

describe('sitemapIndex', () => {
  it('returns each entry with the URL preserved', () => {
    const out = sitemapIndex([
      { url: 'https://acme.com/sitemap-1.xml' },
      { url: 'https://acme.com/sitemap-2.xml' },
    ]);
    expect(out).toEqual([
      { url: 'https://acme.com/sitemap-1.xml' },
      { url: 'https://acme.com/sitemap-2.xml' },
    ]);
  });

  it('preserves a Date lastModified', () => {
    const d = new Date('2026-05-14T00:00:00Z');
    const out = sitemapIndex([{ url: 'https://acme.com/sitemap-1.xml', lastModified: d }]);
    expect(out[0]?.lastModified).toBe(d);
  });

  it('preserves an ISO 8601 string lastModified', () => {
    const out = sitemapIndex([
      { url: 'https://acme.com/sitemap-1.xml', lastModified: '2026-05-14' },
    ]);
    expect(out[0]?.lastModified).toBe('2026-05-14');
  });

  it('throws InvalidUrlError on a malformed URL', () => {
    expect(() => sitemapIndex([{ url: 'not a url' }])).toThrow(InvalidUrlError);
  });

  it('throws SchemaValidationError on a bad date string', () => {
    expect(() =>
      sitemapIndex([{ url: 'https://acme.com/sitemap-1.xml', lastModified: '5/14/2026' }]),
    ).toThrow(SchemaValidationError);
  });

  it('throws SchemaValidationError on an Invalid Date instance', () => {
    expect(() =>
      sitemapIndex([
        { url: 'https://acme.com/sitemap-1.xml', lastModified: new Date('not a date') },
      ]),
    ).toThrow(SchemaValidationError);
  });

  it('batches every bad lastModified across entries', () => {
    try {
      sitemapIndex([
        { url: 'https://acme.com/sitemap-1.xml', lastModified: 'bad' },
        { url: 'https://acme.com/sitemap-2.xml', lastModified: '2026-02-30' },
        { url: 'https://acme.com/sitemap-3.xml' }, // ok
      ]);
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues).toHaveLength(2);
      expect(issues[0]).toContain('entries[0]');
      expect(issues[1]).toContain('entries[1]');
    }
  });

  it('accepts an empty entries array', () => {
    expect(sitemapIndex([])).toEqual([]);
  });
});
