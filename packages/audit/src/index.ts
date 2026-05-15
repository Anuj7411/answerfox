/**
 * @answerable/audit — audit engine for the Answerable SEO toolkit.
 * Fetches a target URL, parses HTML, runs every registered check in
 * parallel, and returns a structured report. Ships with foundations
 * + the first 5 checks (A1, A3, A4, A5, C1); the remaining 45 land
 * in subsequent PRs.
 */

export const VERSION = '0.0.0';

export {
  CrawlError,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_USER_AGENT,
  fetchAndParse,
  type FetchAndParseOptions,
  type FetchAndParseResult,
} from './crawler.js';

export { type AuditDom, loadHtml } from './parser.js';

export { DEFAULT_CHECKS } from './checks/registry.js';

export {
  audit,
  bandFromScore,
  runChecks,
  type AuditConvenienceOptions,
  type RunChecksInput,
} from './runner.js';

export { consoleReport, type ConsoleReportOptions } from './reporters/console.js';

export type { AuditOptions, AuditReport, CheckRunResult, ScoreBand } from './types.js';

export { a1Title } from './checks/a1-title.js';
export { a3Description } from './checks/a3-description.js';
export { a4Canonical } from './checks/a4-canonical.js';
export { a5HtmlLang } from './checks/a5-html-lang.js';
export { c1JsonLd } from './checks/c1-json-ld.js';
