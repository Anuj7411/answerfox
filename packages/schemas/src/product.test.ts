import { InvalidUrlError, SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { product } from './product.js';

const MINIMAL = { name: 'Widget', url: 'https://acme.com/widget' } as const;

describe('product', () => {
  it('emits a well-formed Product with the minimum required fields', () => {
    const out = product(MINIMAL);
    expect(out).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Widget',
      url: 'https://acme.com/widget',
    });
  });

  it('includes optional description, image, brand, and sku', () => {
    const out = product({
      ...MINIMAL,
      description: 'A widget.',
      image: 'https://acme.com/widget.png',
      brand: 'Acme',
      sku: 'W-001',
    });
    expect(out.description).toBe('A widget.');
    expect(out.image).toBe('https://acme.com/widget.png');
    expect(out.brand).toEqual({ '@type': 'Brand', name: 'Acme' });
    expect(out.sku).toBe('W-001');
  });

  it('emits a fully-formed Offer with availability URI when supplied', () => {
    const out = product({
      ...MINIMAL,
      offers: {
        price: 29.99,
        priceCurrency: 'USD',
        availability: 'InStock',
        url: 'https://acme.com/widget/buy',
      },
    });
    expect(out.offers).toEqual({
      '@type': 'Offer',
      price: 29.99,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: 'https://acme.com/widget/buy',
    });
  });

  it('accepts a price of 0 (free product)', () => {
    const out = product({ ...MINIMAL, offers: { price: 0, priceCurrency: 'USD' } });
    expect(out.offers).toMatchObject({ price: 0 });
  });

  it('emits AggregateRating with defaulted best/worst when omitted', () => {
    const out = product({
      ...MINIMAL,
      aggregateRating: { ratingValue: 4.5, ratingCount: 123 },
    });
    expect(out.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.5,
      ratingCount: 123,
    });
  });

  it('preserves explicit best/worst on AggregateRating', () => {
    const out = product({
      ...MINIMAL,
      aggregateRating: {
        ratingValue: 8,
        ratingCount: 50,
        bestRating: 10,
        worstRating: 0,
      },
    });
    expect(out.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 8,
      ratingCount: 50,
      bestRating: 10,
      worstRating: 0,
    });
  });

  it('throws SchemaValidationError on an empty name', () => {
    expect(() => product({ name: '   ', url: 'https://acme.com/widget' })).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on a non-ISO-4217 currency', () => {
    try {
      product({ ...MINIMAL, offers: { price: 10, priceCurrency: 'us-dollars' } });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues[0]).toContain('ISO 4217');
    }
  });

  it('throws SchemaValidationError on a negative price', () => {
    expect(() => product({ ...MINIMAL, offers: { price: -1, priceCurrency: 'USD' } })).toThrow(
      SchemaValidationError,
    );
  });

  it('throws SchemaValidationError on a rating outside the allowed range', () => {
    expect(() =>
      product({
        ...MINIMAL,
        aggregateRating: { ratingValue: 7, ratingCount: 10 },
      }),
    ).toThrow(SchemaValidationError);
  });

  it('throws SchemaValidationError on a non-integer ratingCount', () => {
    expect(() =>
      product({
        ...MINIMAL,
        aggregateRating: { ratingValue: 4, ratingCount: 3.5 },
      }),
    ).toThrow(SchemaValidationError);
  });

  it('batches multiple validation issues from name + offers + rating', () => {
    try {
      product({
        name: '',
        url: 'https://acme.com/x',
        offers: { price: -5, priceCurrency: 'us' },
        aggregateRating: { ratingValue: 10, ratingCount: -1 },
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues.length).toBeGreaterThanOrEqual(4);
      expect(issues.some((i) => i.includes('name'))).toBe(true);
      expect(issues.some((i) => i.includes('offers.price'))).toBe(true);
      expect(issues.some((i) => i.includes('offers.priceCurrency'))).toBe(true);
      expect(issues.some((i) => i.includes('ratingValue'))).toBe(true);
      expect(issues.some((i) => i.includes('ratingCount'))).toBe(true);
    }
  });

  it('throws InvalidUrlError on a bad image URL', () => {
    expect(() => product({ ...MINIMAL, image: 'not a url' })).toThrow(InvalidUrlError);
  });

  it('throws InvalidUrlError on a bad offers.url', () => {
    expect(() =>
      product({
        ...MINIMAL,
        offers: { price: 10, priceCurrency: 'USD', url: 'not a url' },
      }),
    ).toThrow(InvalidUrlError);
  });

  it('rejects an inverted rating range (worst > best)', () => {
    try {
      product({
        ...MINIMAL,
        aggregateRating: {
          ratingValue: 3,
          ratingCount: 1,
          bestRating: 1,
          worstRating: 5,
        },
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      expect((e as SchemaValidationError).issues.some((i) => i.includes('worstRating'))).toBe(true);
    }
  });
});
