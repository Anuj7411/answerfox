import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import type { Brand, Product } from 'schema-dts';
import type { Schema } from './_internal.js';
import {
  type AggregateRatingInput,
  type OffersInput,
  buildAggregateRating,
  buildOffer,
  validateAggregateRating,
  validateOffers,
} from './_offers.js';

export interface ProductInput {
  readonly name: string;
  /** Canonical product page URL. */
  readonly url: string;
  readonly description?: string | undefined;
  /** Absolute URL to the primary product image. */
  readonly image?: string | undefined;
  /** Brand name. Emitted as `{ "@type": "Brand", "name": ... }`. */
  readonly brand?: string | undefined;
  /** Stock-keeping unit / unique product identifier. */
  readonly sku?: string | undefined;
  readonly offers?: OffersInput | undefined;
  readonly aggregateRating?: AggregateRatingInput | undefined;
}

/**
 * Generate a fully-typed JSON-LD `Product` object. Drives audit
 * check **C6**.
 *
 * @throws SchemaValidationError batching every issue across the
 *   top-level fields, `offers`, and `aggregateRating`.
 * @throws InvalidUrlError for the first malformed URL encountered
 *   (`url`, `image`, `offers.url`).
 */
export function product(input: ProductInput): Schema<Product> {
  const issues: string[] = [];
  if (input.name.trim() === '') {
    issues.push('name is empty');
  }
  if (input.offers !== undefined) {
    issues.push(...validateOffers(input.offers, 'offers'));
  }
  if (input.aggregateRating !== undefined) {
    issues.push(...validateAggregateRating(input.aggregateRating, 'aggregateRating'));
  }
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }

  const out: Schema<Product> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    url: parseAbsoluteUrl(input.url),
  };

  if (input.description !== undefined) {
    out.description = input.description;
  }
  if (input.image !== undefined) {
    out.image = parseAbsoluteUrl(input.image);
  }
  if (input.brand !== undefined) {
    const brand: Exclude<Brand, string> = {
      '@type': 'Brand',
      name: input.brand,
    };
    out.brand = brand;
  }
  if (input.sku !== undefined) {
    out.sku = input.sku;
  }
  if (input.offers !== undefined) {
    out.offers = buildOffer(input.offers);
  }
  if (input.aggregateRating !== undefined) {
    out.aggregateRating = buildAggregateRating(input.aggregateRating);
  }

  return out;
}
