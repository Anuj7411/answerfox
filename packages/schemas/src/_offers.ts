import { parseAbsoluteUrl } from '@answerable/core';
import type { AggregateRating, Offer } from 'schema-dts';

/**
 * Availability values accepted by schema.org's `ItemAvailability`
 * enumeration. We accept the short form here and emit the full
 * `https://schema.org/<value>` URI in JSON-LD output (Google's
 * preferred form).
 */
export type OfferAvailability =
  | 'InStock'
  | 'OutOfStock'
  | 'PreOrder'
  | 'BackOrder'
  | 'Discontinued'
  | 'LimitedAvailability'
  | 'SoldOut';

export interface OffersInput {
  /** Price as a number. `0` is valid (free app, free product). */
  readonly price: number;
  /** ISO 4217 three-letter currency code, e.g. `"USD"`, `"EUR"`. */
  readonly priceCurrency: string;
  readonly availability?: OfferAvailability | undefined;
  /** Optional purchase / pricing-page URL. Must be absolute http(s). */
  readonly url?: string | undefined;
}

export interface AggregateRatingInput {
  /** Average rating. Must be between `worstRating` and `bestRating`. */
  readonly ratingValue: number;
  /** Number of ratings. Must be a non-negative integer. */
  readonly ratingCount: number;
  /** Defaults to 5 when omitted (the schema.org default). */
  readonly bestRating?: number | undefined;
  /** Defaults to 1 when omitted (the schema.org default). */
  readonly worstRating?: number | undefined;
}

/** ISO 4217 currency codes are exactly three uppercase letters. */
const ISO_4217 = /^[A-Z]{3}$/;

/**
 * Collect every validation issue in an offers block. Returns an empty
 * array on valid input; callers concat into one batched
 * `SchemaValidationError`.
 */
export function validateOffers(o: OffersInput, prefix: string): string[] {
  const issues: string[] = [];
  if (!Number.isFinite(o.price)) {
    issues.push(`${prefix}.price must be a finite number (got ${o.price})`);
  } else if (o.price < 0) {
    issues.push(`${prefix}.price must be non-negative (got ${o.price})`);
  }
  if (!ISO_4217.test(o.priceCurrency)) {
    issues.push(
      `${prefix}.priceCurrency must be a 3-letter ISO 4217 code (got "${o.priceCurrency}")`,
    );
  }
  return issues;
}

/**
 * Collect every validation issue in an aggregate-rating block.
 */
export function validateAggregateRating(r: AggregateRatingInput, prefix: string): string[] {
  const issues: string[] = [];
  const best = r.bestRating ?? 5;
  const worst = r.worstRating ?? 1;
  if (worst > best) {
    issues.push(`${prefix}: worstRating (${worst}) cannot exceed bestRating (${best})`);
  }
  if (!Number.isFinite(r.ratingValue)) {
    issues.push(`${prefix}.ratingValue must be a finite number (got ${r.ratingValue})`);
  } else if (r.ratingValue < worst || r.ratingValue > best) {
    issues.push(
      `${prefix}.ratingValue must be between ${worst} and ${best} (got ${r.ratingValue})`,
    );
  }
  if (!Number.isInteger(r.ratingCount) || r.ratingCount < 0) {
    issues.push(`${prefix}.ratingCount must be a non-negative integer (got ${r.ratingCount})`);
  }
  return issues;
}

/**
 * Build the JSON-LD `Offer` nested object. URL validation runs here —
 * call only after `validateOffers` has confirmed the other fields.
 */
export function buildOffer(o: OffersInput): Exclude<Offer, string> {
  const out: Exclude<Offer, string> = {
    '@type': 'Offer',
    price: o.price,
    priceCurrency: o.priceCurrency,
  };
  if (o.availability !== undefined) {
    out.availability = `https://schema.org/${o.availability}`;
  }
  if (o.url !== undefined) {
    out.url = parseAbsoluteUrl(o.url);
  }
  return out;
}

/**
 * Build the JSON-LD `AggregateRating` nested object.
 */
export function buildAggregateRating(r: AggregateRatingInput): Exclude<AggregateRating, string> {
  const out: Exclude<AggregateRating, string> = {
    '@type': 'AggregateRating',
    ratingValue: r.ratingValue,
    ratingCount: r.ratingCount,
  };
  if (r.bestRating !== undefined) {
    out.bestRating = r.bestRating;
  }
  if (r.worstRating !== undefined) {
    out.worstRating = r.worstRating;
  }
  return out;
}
