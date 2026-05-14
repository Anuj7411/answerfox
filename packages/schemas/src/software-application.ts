import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import type { SoftwareApplication } from 'schema-dts';
import type { Schema } from './_internal.js';
import {
  type AggregateRatingInput,
  type OffersInput,
  buildAggregateRating,
  buildOffer,
  validateAggregateRating,
  validateOffers,
} from './_offers.js';

export interface SoftwareApplicationInput {
  readonly name: string;
  /** Canonical app page URL. */
  readonly url: string;
  readonly description?: string | undefined;
  /**
   * App category per schema.org's `ApplicationCategory`. Common values:
   * `"GameApplication"`, `"BusinessApplication"`, `"DesignApplication"`,
   * `"DeveloperApplication"`, `"EducationalApplication"`,
   * `"UtilitiesApplication"`.
   */
  readonly applicationCategory: string;
  /**
   * Operating system support. Free-form per schema.org but conventional
   * values are `"Web"`, `"iOS"`, `"Android"`, `"Windows"`, `"macOS"`,
   * `"Linux"` — or a comma-separated list.
   */
  readonly operatingSystem?: string | undefined;
  /** Absolute URL to the app's hero / screenshot image. */
  readonly image?: string | undefined;
  /**
   * For free apps, pass `{ price: 0, priceCurrency: "USD" }` (or any
   * currency). Required by Google's structured-data guidelines to
   * appear as a SoftwareApplication rich result.
   */
  readonly offers?: OffersInput | undefined;
  readonly aggregateRating?: AggregateRatingInput | undefined;
}

/**
 * Generate a fully-typed JSON-LD `SoftwareApplication` object. Drives
 * audit check **C2** for software products.
 *
 * @throws SchemaValidationError batching every issue across the
 *   top-level fields, `offers`, and `aggregateRating`.
 * @throws InvalidUrlError for the first malformed URL encountered.
 */
export function softwareApplication(input: SoftwareApplicationInput): Schema<SoftwareApplication> {
  const issues: string[] = [];
  if (input.name.trim() === '') {
    issues.push('name is empty');
  }
  if (input.applicationCategory.trim() === '') {
    issues.push('applicationCategory is empty');
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

  const out: Schema<SoftwareApplication> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: input.name,
    url: parseAbsoluteUrl(input.url),
    applicationCategory: input.applicationCategory,
  };

  if (input.description !== undefined) {
    out.description = input.description;
  }
  if (input.operatingSystem !== undefined) {
    out.operatingSystem = input.operatingSystem;
  }
  if (input.image !== undefined) {
    out.image = parseAbsoluteUrl(input.image);
  }
  if (input.offers !== undefined) {
    out.offers = buildOffer(input.offers);
  }
  if (input.aggregateRating !== undefined) {
    out.aggregateRating = buildAggregateRating(input.aggregateRating);
  }

  return out;
}
