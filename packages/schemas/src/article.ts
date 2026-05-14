import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import type { Article, BlogPosting, Organization, Person } from 'schema-dts';
import type { Schema } from './_internal.js';

/**
 * The author of an article. A discriminated union so the type system
 * knows whether `url` is required (Organization) or optional (Person)
 * and whether `logo` is meaningful at all (Organization only).
 */
export type AuthorInput =
  | { readonly type: 'Person'; readonly name: string; readonly url?: string | undefined }
  | {
      readonly type: 'Organization';
      readonly name: string;
      readonly url: string;
      readonly logo?: string | undefined;
    };

/**
 * The publisher of an article — always an Organization per Google's
 * structured-data guidelines for Article / BlogPosting.
 */
export interface PublisherInput {
  readonly name: string;
  readonly url: string;
  readonly logo?: string | undefined;
}

export interface ArticleInput {
  readonly headline: string;
  /** Canonical URL of the article. */
  readonly url: string;
  readonly description?: string | undefined;
  /** Hero/cover image absolute URL. */
  readonly image?: string | undefined;
  /**
   * ISO 8601 date string. Accepts date-only (`"2026-05-14"`) or
   * date-time (`"2026-05-14T12:00:00Z"`, `"2026-05-14T12:00:00+05:30"`).
   */
  readonly datePublished: string;
  /** Same format as `datePublished`. */
  readonly dateModified?: string | undefined;
  readonly author: AuthorInput;
  readonly publisher: PublisherInput;
}

/**
 * ISO 8601 date (`YYYY-MM-DD`) or date-time with optional fractional
 * seconds and timezone. Tighter than `Date.parse`, which (a) accepts
 * loose formats like `"5/14/2026"` and (b) silently rolls over
 * impossible dates like `"2026-02-30"` to March 2. We catch both.
 */
const ISO_DATE_OR_DATETIME =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function isValidIso8601(s: string): boolean {
  if (!ISO_DATE_OR_DATETIME.test(s)) return false;
  if (Number.isNaN(Date.parse(s))) return false;

  // Date.parse rolls impossible calendar dates over silently
  // ("2026-02-30" → March 2). Validate the date portion by
  // round-tripping the year/month/day through a UTC Date.
  const [yearStr, monthStr, dayStr] = s.slice(0, 10).split('-');
  if (yearStr === undefined || monthStr === undefined || dayStr === undefined) return false;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

function validateArticleInput(input: ArticleInput): void {
  const issues: string[] = [];
  if (input.headline.trim() === '') {
    issues.push('headline is empty');
  }
  if (input.author.name.trim() === '') {
    issues.push('author.name is empty');
  }
  if (input.publisher.name.trim() === '') {
    issues.push('publisher.name is empty');
  }
  if (!isValidIso8601(input.datePublished)) {
    issues.push(`datePublished is not a valid ISO 8601 date (got "${input.datePublished}")`);
  }
  if (input.dateModified !== undefined && !isValidIso8601(input.dateModified)) {
    issues.push(`dateModified is not a valid ISO 8601 date (got "${input.dateModified}")`);
  }
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }
}

function buildAuthor(a: AuthorInput): Exclude<Person | Organization, string> {
  if (a.type === 'Person') {
    const out: Exclude<Person, string> = {
      '@type': 'Person',
      name: a.name,
    };
    if (a.url !== undefined) {
      out.url = parseAbsoluteUrl(a.url);
    }
    return out;
  }
  const out: Exclude<Organization, string> = {
    '@type': 'Organization',
    name: a.name,
    url: parseAbsoluteUrl(a.url),
  };
  if (a.logo !== undefined) {
    out.logo = parseAbsoluteUrl(a.logo);
  }
  return out;
}

function buildPublisher(p: PublisherInput): Exclude<Organization, string> {
  const out: Exclude<Organization, string> = {
    '@type': 'Organization',
    name: p.name,
    url: parseAbsoluteUrl(p.url),
  };
  if (p.logo !== undefined) {
    out.logo = parseAbsoluteUrl(p.logo);
  }
  return out;
}

/**
 * Common body shared by `article()` and `blogPosting()`. Returns
 * everything except `@context` and `@type` so each entry point can
 * supply its own discriminator.
 */
function buildArticleBody(input: ArticleInput): Omit<Schema<Article>, '@context' | '@type'> {
  const url = parseAbsoluteUrl(input.url);
  const body: Omit<Schema<Article>, '@context' | '@type'> = {
    headline: input.headline,
    url,
    mainEntityOfPage: url,
    datePublished: input.datePublished,
    author: buildAuthor(input.author),
    publisher: buildPublisher(input.publisher),
  };
  if (input.description !== undefined) {
    body.description = input.description;
  }
  if (input.image !== undefined) {
    body.image = parseAbsoluteUrl(input.image);
  }
  if (input.dateModified !== undefined) {
    body.dateModified = input.dateModified;
  }
  return body;
}

/**
 * Generate a fully-typed JSON-LD `Article` object. Drives audit
 * check **C5** and supplies the date/author signals that the
 * E-E-A-T checks **D7** and **D8** look for.
 *
 * @throws SchemaValidationError batching every empty-string and
 *   bad-date issue found in `input`.
 * @throws InvalidUrlError for the first malformed URL encountered
 *   (`url`, `image`, `author.url`, `author.logo`, `publisher.url`,
 *   `publisher.logo`).
 */
export function article(input: ArticleInput): Schema<Article> {
  validateArticleInput(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    ...buildArticleBody(input),
  };
}

/**
 * Same shape as `article()` but emits `@type: 'BlogPosting'`. In
 * schema.org, `BlogPosting` extends `Article`, so every field that
 * works on `article()` works here too.
 *
 * @throws SchemaValidationError / InvalidUrlError — see `article()`.
 */
export function blogPosting(input: ArticleInput): Schema<BlogPosting> {
  validateArticleInput(input);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    ...buildArticleBody(input),
  };
}
