import { type CheerioAPI, load } from 'cheerio';

/**
 * Parser handle for every check. Re-exporting cheerio's `CheerioAPI`
 * type means consumers of this package can write their own checks
 * without depending on cheerio directly (they pick up the type from
 * `@answerable/audit`).
 */
export type AuditDom = CheerioAPI;

/**
 * Parse raw HTML into the DOM handle every check receives.
 * Thin wrapper around `cheerio.load` so we can swap parsers later
 * without touching every call site.
 */
export function loadHtml(html: string): AuditDom {
  return load(html);
}
