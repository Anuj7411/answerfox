import type { AbsoluteUrl } from '@answerfox/core';

/**
 * Shared helper for G-category checks (Agent Readiness) that fetch
 * artifacts under the origin's `/.well-known/` namespace.
 *
 * The well-known well is at the ORIGIN, not at the audited path. So
 * auditing `https://example.com/blog/post` for the MCP Server Card
 * fetches `https://example.com/.well-known/mcp/server-card.json`.
 *
 * Returns a structured result so each check can decide pass/fail/warn
 * uniformly without re-implementing fetch error handling.
 */

export interface WellKnownFetchOptions {
  /** Test-injection seam. Defaults to global `fetch`. */
  readonly fetchImpl?: typeof fetch;
  /** Per-fetch timeout, defaults to 5s (well-known fetches are small). */
  readonly timeoutMs?: number;
}

export interface WellKnownFetchResult {
  /** Resolved URL we attempted (origin + /.well-known/ + path). */
  readonly url: string;
  /** HTTP status code, or null on network error / timeout. */
  readonly status: number | null;
  /** Raw response body if 2xx, else null. */
  readonly body: string | null;
  /** Parsed JSON if body parsed cleanly, else null. */
  readonly parsed: unknown | null;
  /** Human-readable error if fetch / parse failed, else null. */
  readonly error: string | null;
}

const DEFAULT_TIMEOUT_MS = 5_000;

/**
 * Fetch a `.well-known/<path>` artifact from the page's origin.
 *
 * @param pageUrl   the audited page URL, origin is extracted
 * @param path      sub-path under /.well-known/ (e.g. `mcp/server-card.json`)
 * @param options   optional fetch override + timeout
 */
export async function fetchWellKnown(
  pageUrl: AbsoluteUrl,
  path: string,
  options: WellKnownFetchOptions = {},
): Promise<WellKnownFetchResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const origin = new URL(pageUrl).origin;
  const trimmedPath = path.replace(/^\/+/, '');
  const url = `${origin}/.well-known/${trimmedPath}`;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json, application/*+json, text/plain, */*',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    const status = response.status;
    if (status < 200 || status >= 300) {
      return { url, status, body: null, parsed: null, error: null };
    }

    const body = await response.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(body);
    } catch {
      // Body isn't JSON, leave parsed null. Some manifests are plain text (rare).
    }
    return { url, status, body, parsed, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { url, status: null, body: null, parsed: null, error: message };
  } finally {
    clearTimeout(timeoutHandle);
  }
}
