import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import { validateAndCoerceLastModified } from './build-sitemap.js';

export interface SitemapIndexEntry {
  /** Absolute http(s) URL to a child sitemap file. */
  readonly url: string;
  readonly lastModified?: Date | string | undefined;
}

/**
 * Build a sitemap-index structure for sites that exceed Google's 50,000-URL
 * per-file limit. Each entry points at a child sitemap; the caller serializes
 * the returned array to whatever format their host expects (Next.js's XML
 * generator, custom route handler, etc.).
 *
 * @throws InvalidUrlError if any `url` is not a valid absolute http(s) URL.
 * @throws SchemaValidationError batching every bad `lastModified` value.
 */
export function sitemapIndex(entries: readonly SitemapIndexEntry[]): SitemapIndexEntry[] {
  // First pass: batch lastModified issues so callers see every problem at once.
  const issues: string[] = [];
  entries.forEach((e, i) => {
    if (e.lastModified !== undefined) {
      validateAndCoerceLastModified(e.lastModified, `entries[${i}]`, issues);
    }
  });
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }

  // Second pass: URL validation throws InvalidUrlError on the first bad URL.
  return entries.map((e) => {
    const url = parseAbsoluteUrl(e.url);
    return e.lastModified !== undefined ? { url, lastModified: e.lastModified } : { url };
  });
}
