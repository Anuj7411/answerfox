import { AnswerableError, parseAbsoluteUrl } from '@answerable/core';
import { type AuditDom, loadHtml } from './parser.js';

export const DEFAULT_USER_AGENT = 'Answerable/0.0.0 (+https://github.com/Anuj7411/answerable)';

export const DEFAULT_TIMEOUT_MS = 15_000;

export interface FetchAndParseOptions {
  readonly userAgent?: string;
  readonly timeoutMs?: number;
  /** Test-injection seam. Defaults to the global `fetch`. */
  readonly fetchImpl?: typeof fetch;
}

export interface FetchAndParseResult {
  readonly url: string;
  readonly finalUrl: string;
  readonly status: number;
  readonly html: string;
  readonly dom: AuditDom;
}

/**
 * Thrown when the crawler can't reach the target URL or the response
 * isn't a 2xx with HTML-shaped content.
 */
export class CrawlError extends AnswerableError {
  readonly url: string;
  readonly httpStatus: number | undefined;

  constructor(
    message: string,
    options: { readonly url: string; readonly status?: number; readonly cause?: unknown },
  ) {
    super('ANSWERABLE_CRAWL_FAILED', message, { cause: options.cause });
    this.url = options.url;
    this.httpStatus = options.status;
    this.name = 'CrawlError';
  }
}

/**
 * Fetch a URL and parse the response into a cheerio DOM. Follows
 * redirects (delegated to native fetch). Sets a polite User-Agent.
 * Throws `CrawlError` on network failure or non-2xx response.
 *
 * @throws InvalidUrlError if `url` is not a valid absolute http(s) URL.
 * @throws CrawlError on network failure, timeout, or non-2xx response.
 */
export async function fetchAndParse(
  url: string,
  options: FetchAndParseOptions = {},
): Promise<FetchAndParseResult> {
  const target = parseAbsoluteUrl(url);
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetchImpl(target, {
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: controller.signal,
    });
  } catch (cause) {
    throw new CrawlError(`Failed to fetch ${target}`, { url: target, cause });
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (!response.ok) {
    throw new CrawlError(`Request to ${target} returned HTTP ${response.status}`, {
      url: target,
      status: response.status,
    });
  }

  const html = await response.text();
  return {
    url: target,
    finalUrl: response.url || target,
    status: response.status,
    html,
    dom: loadHtml(html),
  };
}
