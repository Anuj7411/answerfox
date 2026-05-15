import { SchemaValidationError, parseAbsoluteUrl } from '@answerable/core';
import type { MetadataRoute } from 'next';

export type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

export interface SitemapRouteInput {
  /**
   * Path-only segment. Must start with `/`. Combined with `baseUrl`
   * to produce the final `url` field. Don't pass a full URL.
   */
  readonly path: string;
  readonly lastModified?: Date | string | undefined;
  readonly changeFrequency?: ChangeFrequency | undefined;
  /** Float between 0.0 and 1.0 inclusive. */
  readonly priority?: number | undefined;
  /**
   * Locale → absolute-URL map for hreflang alternates. Each URL is
   * validated as an absolute http(s) URL.
   *
   * @example { 'en-US': 'https://acme.com/about', 'es-ES': 'https://acme.com/es/about' }
   */
  readonly alternates?: Record<string, string> | undefined;
}

export interface BuildSitemapOptions {
  /** Absolute http(s) base URL. Trailing slash is stripped. */
  readonly baseUrl: string;
}

/**
 * Priority + changeFrequency defaults inferred from the path. Used
 * whenever the corresponding field isn't supplied explicitly.
 */
function inferDefaults(path: string): { priority: number; changeFrequency: ChangeFrequency } {
  if (path === '/') return { priority: 1.0, changeFrequency: 'daily' };
  if (/^\/(blog|news|posts)(\/|$)/.test(path)) {
    return { priority: 0.7, changeFrequency: 'weekly' };
  }
  if (/^\/docs(\/|$)/.test(path)) {
    return { priority: 0.6, changeFrequency: 'weekly' };
  }
  if (/^\/(products|pricing)(\/|$)/.test(path)) {
    return { priority: 0.8, changeFrequency: 'weekly' };
  }
  if (/^\/(about|privacy|terms|contact|faq)(\/|$)/.test(path)) {
    return { priority: 0.3, changeFrequency: 'yearly' };
  }
  return { priority: 0.5, changeFrequency: 'monthly' };
}

function composeUrl(baseUrl: string, path: string): string {
  const trimmed = baseUrl.replace(/\/$/, '');
  return `${trimmed}${path}`;
}

/** Validate a string lastModified as ISO 8601 (date or date-time). */
const ISO_DATE_OR_DATETIME =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,9})?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

function isValidIso8601Date(s: string): boolean {
  if (!ISO_DATE_OR_DATETIME.test(s)) return false;
  if (Number.isNaN(Date.parse(s))) return false;
  // Catch silent rollovers like "2026-02-30" → March 2.
  const parts = s.slice(0, 10).split('-');
  const yearStr = parts[0];
  const monthStr = parts[1];
  const dayStr = parts[2];
  if (yearStr === undefined || monthStr === undefined || dayStr === undefined) return false;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
}

/**
 * Internal helper used by both `buildSitemap()` and `sitemapIndex()`.
 * Returns a validated value to assign, or pushes an issue and returns
 * `undefined`.
 */
export function validateAndCoerceLastModified(
  input: Date | string,
  prefix: string,
  issues: string[],
): Date | string | undefined {
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      issues.push(`${prefix}.lastModified is an Invalid Date`);
      return undefined;
    }
    return input;
  }
  if (!isValidIso8601Date(input)) {
    issues.push(`${prefix}.lastModified is not a valid ISO 8601 date (got "${input}")`);
    return undefined;
  }
  return input;
}

/**
 * Build a Next.js-compatible sitemap from a list of paths + a base URL.
 * Smart defaults for `priority` and `changeFrequency` are inferred from
 * each path's pattern; explicit values on a route always win.
 *
 * @throws InvalidUrlError if `baseUrl` or any `alternates` URL is
 *   not a valid absolute http(s) URL.
 * @throws SchemaValidationError batching every issue across paths,
 *   priorities, duplicates, and `lastModified` values.
 */
export function buildSitemap(
  routes: readonly SitemapRouteInput[],
  options: BuildSitemapOptions,
): MetadataRoute.Sitemap {
  const baseUrl = parseAbsoluteUrl(options.baseUrl);

  const issues: string[] = [];
  const seen = new Set<string>();
  routes.forEach((r, i) => {
    if (!r.path.startsWith('/')) {
      issues.push(`routes[${i}].path must start with "/" (got "${r.path}")`);
    }
    if (r.path.includes('://')) {
      issues.push(
        `routes[${i}].path must be a path, not a full URL (got "${r.path}"). Use the \`baseUrl\` option for the origin.`,
      );
    }
    if (r.priority !== undefined && (r.priority < 0 || r.priority > 1)) {
      issues.push(`routes[${i}].priority must be between 0.0 and 1.0 (got ${r.priority})`);
    }
    if (seen.has(r.path)) {
      issues.push(`routes[${i}].path is a duplicate of an earlier entry: "${r.path}"`);
    }
    seen.add(r.path);
    if (r.lastModified !== undefined) {
      validateAndCoerceLastModified(r.lastModified, `routes[${i}]`, issues);
    }
  });
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }

  return routes.map((r) => {
    const defaults = inferDefaults(r.path);
    const entry: MetadataRoute.Sitemap[number] = {
      url: composeUrl(baseUrl, r.path),
      changeFrequency: r.changeFrequency ?? defaults.changeFrequency,
      priority: r.priority ?? defaults.priority,
    };
    if (r.lastModified !== undefined) {
      entry.lastModified = r.lastModified;
    }
    if (r.alternates !== undefined) {
      const languages: Record<string, string> = {};
      for (const [locale, url] of Object.entries(r.alternates)) {
        languages[locale] = parseAbsoluteUrl(url);
      }
      entry.alternates = { languages };
    }
    return entry;
  });
}
