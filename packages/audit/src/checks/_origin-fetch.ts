import type { AbsoluteUrl } from '@answerfox/core';

/**
 * Shared helper for checks that fetch artifacts directly under the
 * origin root (not `.well-known/`). Examples: `/sitemap.xml`,
 * `/llms.txt`, `/robots.txt`.
 *
 * The path is fetched at the ORIGIN, not at the audited path. So
 * auditing `https://example.com/blog/post` for the sitemap fetches
 * `https://example.com/sitemap.xml`.
 *
 * Returns a structured result so each check can decide pass/fail/warn
 * uniformly without re-implementing fetch error handling.
 */

export interface OriginFetchOptions {
  /** Test-injection seam. Defaults to global `fetch`. */
  readonly fetchImpl?: typeof fetch;
  /** Per-fetch timeout, defaults to 5s. */
  readonly timeoutMs?: number;
  /** Override Accept header. Defaults to a permissive set. */
  readonly accept?: string;
}

export interface OriginFetchResult {
  /** Resolved URL we attempted (origin + path). */
  readonly url: string;
  /** HTTP status code, or null on network error / timeout. */
  readonly status: number | null;
  /** Response Content-Type header, lowercased, or null. */
  readonly contentType: string | null;
  /** Raw response body if 2xx, else null. */
  readonly body: string | null;
  /** Human-readable error if fetch failed, else null. */
  readonly error: string | null;
}

const DEFAULT_TIMEOUT_MS = 5_000;
const DEFAULT_ACCEPT = 'text/plain, text/markdown, application/xml, text/xml, */*';

/**
 * Fetch a root-relative path from the page's origin.
 *
 * @param pageUrl   the audited page URL, origin is extracted
 * @param path      root-relative path (e.g. `sitemap.xml`, `llms.txt`)
 * @param options   optional fetch override, timeout, accept header
 */
export async function fetchOriginPath(
  pageUrl: AbsoluteUrl,
  path: string,
  options: OriginFetchOptions = {},
): Promise<OriginFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const accept = options.accept ?? DEFAULT_ACCEPT;

  const origin = new URL(pageUrl).origin;
  const trimmedPath = path.replace(/^\/+/, '');
  const url = `${origin}/${trimmedPath}`;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: accept },
      signal: controller.signal,
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type')?.toLowerCase() ?? null;
    const status = response.status;
    if (status < 200 || status >= 300) {
      return { url, status, contentType, body: null, error: null };
    }

    const body = await response.text();
    return { url, status, contentType, body, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, status: null, contentType: null, body: null, error: message };
  } finally {
    clearTimeout(timeoutHandle);
  }
}
