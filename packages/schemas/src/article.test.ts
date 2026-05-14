import { InvalidUrlError, SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { article, blogPosting } from './article.js';

const ORG_AUTHOR = {
  type: 'Organization',
  name: 'Acme Co',
  url: 'https://acme.com',
} as const;

const PERSON_AUTHOR = {
  type: 'Person',
  name: 'Jane Doe',
} as const;

const PUBLISHER = {
  name: 'Acme Press',
  url: 'https://acme.com',
  logo: 'https://acme.com/logo.png',
} as const;

const MINIMAL_INPUT = {
  headline: 'Hello, world',
  url: 'https://acme.com/posts/hello',
  datePublished: '2026-05-14',
  author: PERSON_AUTHOR,
  publisher: PUBLISHER,
} as const;

describe('article', () => {
  it('emits a well-formed Article with the minimum required fields', () => {
    const out = article(MINIMAL_INPUT);
    expect(out['@context']).toBe('https://schema.org');
    expect(out['@type']).toBe('Article');
    expect(out.headline).toBe('Hello, world');
    expect(out.url).toBe('https://acme.com/posts/hello');
    expect(out.mainEntityOfPage).toBe('https://acme.com/posts/hello');
    expect(out.datePublished).toBe('2026-05-14');
    expect(out.author).toEqual({ '@type': 'Person', name: 'Jane Doe' });
    expect(out.publisher).toEqual({
      '@type': 'Organization',
      name: 'Acme Press',
      url: 'https://acme.com',
      logo: 'https://acme.com/logo.png',
    });
  });

  it('includes optional description, image, and dateModified when supplied', () => {
    const out = article({
      ...MINIMAL_INPUT,
      description: 'A friendly greeting.',
      image: 'https://acme.com/posts/hello/cover.jpg',
      dateModified: '2026-05-15T09:30:00Z',
    });
    expect(out.description).toBe('A friendly greeting.');
    expect(out.image).toBe('https://acme.com/posts/hello/cover.jpg');
    expect(out.dateModified).toBe('2026-05-15T09:30:00Z');
  });

  it('omits description, image, and dateModified when not supplied', () => {
    const out = article(MINIMAL_INPUT);
    expect('description' in out).toBe(false);
    expect('image' in out).toBe(false);
    expect('dateModified' in out).toBe(false);
  });

  it('supports an Organization author with optional logo', () => {
    const out = article({
      ...MINIMAL_INPUT,
      author: { ...ORG_AUTHOR, logo: 'https://acme.com/byline.png' },
    });
    expect(out.author).toEqual({
      '@type': 'Organization',
      name: 'Acme Co',
      url: 'https://acme.com',
      logo: 'https://acme.com/byline.png',
    });
  });

  it('supports a Person author with optional url', () => {
    const out = article({
      ...MINIMAL_INPUT,
      author: { type: 'Person', name: 'Jane Doe', url: 'https://acme.com/team/jane' },
    });
    expect(out.author).toEqual({
      '@type': 'Person',
      name: 'Jane Doe',
      url: 'https://acme.com/team/jane',
    });
  });

  it('accepts ISO 8601 date-only and full date-time variants', () => {
    for (const date of [
      '2026-05-14',
      '2026-05-14T09:30:00Z',
      '2026-05-14T09:30:00.123Z',
      '2026-05-14T09:30:00+05:30',
      '2026-05-14T09:30:00-08:00',
    ]) {
      expect(() => article({ ...MINIMAL_INPUT, datePublished: date })).not.toThrow();
    }
  });

  it('rejects non-ISO date formats with a helpful message', () => {
    try {
      article({ ...MINIMAL_INPUT, datePublished: '5/14/2026' });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues[0]).toContain('datePublished');
      expect((e as SchemaValidationError).issues[0]).toContain('5/14/2026');
    }
  });

  it('rejects an impossible calendar date (e.g. Feb 30)', () => {
    expect(() => article({ ...MINIMAL_INPUT, datePublished: '2026-02-30' })).toThrow(
      SchemaValidationError,
    );
  });

  it('batches multiple validation issues into one SchemaValidationError', () => {
    try {
      article({
        headline: '   ',
        url: 'https://acme.com/post',
        datePublished: 'not-a-date',
        dateModified: 'also-not-a-date',
        author: { type: 'Person', name: '' },
        publisher: { name: '', url: 'https://acme.com' },
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues).toHaveLength(5);
      expect(issues.some((i) => i.includes('headline'))).toBe(true);
      expect(issues.some((i) => i.includes('author.name'))).toBe(true);
      expect(issues.some((i) => i.includes('publisher.name'))).toBe(true);
      expect(issues.some((i) => i.includes('datePublished'))).toBe(true);
      expect(issues.some((i) => i.includes('dateModified'))).toBe(true);
    }
  });

  it('throws InvalidUrlError on a bad article URL', () => {
    expect(() => article({ ...MINIMAL_INPUT, url: 'not a url' })).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad image URL', () => {
    expect(() => article({ ...MINIMAL_INPUT, image: 'not a url' })).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad publisher logo URL', () => {
    expect(() =>
      article({
        ...MINIMAL_INPUT,
        publisher: { ...PUBLISHER, logo: 'not a url' },
      }),
    ).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad Organization author URL', () => {
    expect(() =>
      article({
        ...MINIMAL_INPUT,
        author: { type: 'Organization', name: 'Acme', url: 'ftp://acme.com' },
      }),
    ).toThrow(InvalidUrlError);
  });
});

describe('blogPosting', () => {
  it('emits the same shape as article() but with @type: "BlogPosting"', () => {
    const a = article(MINIMAL_INPUT);
    const b = blogPosting(MINIMAL_INPUT);
    expect(b['@type']).toBe('BlogPosting');
    // Every other field matches the article equivalent.
    expect({ ...b, '@type': 'Article' }).toEqual(a);
  });

  it('applies the same validation as article()', () => {
    expect(() => blogPosting({ ...MINIMAL_INPUT, datePublished: 'bad' })).toThrow(
      SchemaValidationError,
    );
  });
});
