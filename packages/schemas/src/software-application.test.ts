import { SchemaValidationError } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { softwareApplication } from './software-application.js';

const MINIMAL = {
  name: 'Sotto',
  url: 'https://sottogames.com',
  applicationCategory: 'GameApplication',
} as const;

describe('softwareApplication', () => {
  it('emits a well-formed SoftwareApplication with the required fields', () => {
    const out = softwareApplication(MINIMAL);
    expect(out).toEqual({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Sotto',
      url: 'https://sottogames.com',
      applicationCategory: 'GameApplication',
    });
  });

  it('includes operatingSystem, description, and image when supplied', () => {
    const out = softwareApplication({
      ...MINIMAL,
      description: 'An anonymous Secret Santa app.',
      operatingSystem: 'Web',
      image: 'https://sottogames.com/og.png',
    });
    expect(out.description).toBe('An anonymous Secret Santa app.');
    expect(out.operatingSystem).toBe('Web');
    expect(out.image).toBe('https://sottogames.com/og.png');
  });

  it('emits a free-app Offer with price 0', () => {
    const out = softwareApplication({
      ...MINIMAL,
      offers: { price: 0, priceCurrency: 'USD' },
    });
    expect(out.offers).toEqual({
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'USD',
    });
  });

  it('emits AggregateRating with explicit best/worst', () => {
    const out = softwareApplication({
      ...MINIMAL,
      aggregateRating: { ratingValue: 4.7, ratingCount: 314, bestRating: 5, worstRating: 1 },
    });
    expect(out.aggregateRating).toEqual({
      '@type': 'AggregateRating',
      ratingValue: 4.7,
      ratingCount: 314,
      bestRating: 5,
      worstRating: 1,
    });
  });

  it('throws SchemaValidationError on empty name', () => {
    expect(() => softwareApplication({ ...MINIMAL, name: '   ' })).toThrow(SchemaValidationError);
  });

  it('throws SchemaValidationError on empty applicationCategory', () => {
    expect(() => softwareApplication({ ...MINIMAL, applicationCategory: '   ' })).toThrow(
      SchemaValidationError,
    );
  });

  it('shares offers validation with product() (bad currency)', () => {
    expect(() =>
      softwareApplication({
        ...MINIMAL,
        offers: { price: 0, priceCurrency: 'us' },
      }),
    ).toThrow(SchemaValidationError);
  });

  it('shares aggregateRating validation with product() (rating out of range)', () => {
    expect(() =>
      softwareApplication({
        ...MINIMAL,
        aggregateRating: { ratingValue: 6, ratingCount: 10 },
      }),
    ).toThrow(SchemaValidationError);
  });

  it('batches top-level + offers + rating issues into one error', () => {
    try {
      softwareApplication({
        name: '',
        url: 'https://sottogames.com',
        applicationCategory: '',
        offers: { price: -1, priceCurrency: 'usd' },
        aggregateRating: { ratingValue: 99, ratingCount: -3 },
      });
      expect.fail('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(SchemaValidationError);
      const issues = (e as SchemaValidationError).issues;
      expect(issues.length).toBeGreaterThanOrEqual(5);
    }
  });
});
