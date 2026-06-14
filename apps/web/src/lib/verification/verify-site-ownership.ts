import 'server-only';

import { randomBytes } from 'node:crypto';
import { resolveTxt } from 'node:dns/promises';

/**
 * Site ownership verification — F14 per PRICING-LOCKED.md.
 *
 * Three methods, all server-side, any one succeeds:
 *   1. `meta` — `<meta name="answerfox-verify" content="<token>">` in <head>
 *   2. `file` — `/.well-known/answerfox-verify` returns plain text token
 *   3. `dns`  — TXT record on origin contains `answerfox-verify=<token>`
 *               (or the bare token; we accept both)
 *
 * The check is fail-soft: a network error or 5xx for one method does NOT
 * fail the overall verification — the next method gets a fair try. The
 * caller decides what to do when all three return `not found` vs all
 * three return `error`.
 */

export type VerificationMethod = 'meta' | 'file' | 'dns';

export interface VerificationOk {
  readonly ok: true;
  readonly method: VerificationMethod;
  readonly evidence: string;
}

export interface VerificationNotFound {
  readonly ok: false;
  readonly reason: 'not-found';
  readonly attempts: ReadonlyArray<{
    readonly method: VerificationMethod;
    readonly outcome: 'not-found' | 'error';
    readonly detail: string;
  }>;
}

export type VerificationResult = VerificationOk | VerificationNotFound;

export const VERIFICATION_TTL_DAYS = 7;
export const VERIFICATION_TIMEOUT_MS = 10_000;
const META_NAME = 'answerfox-verify';
const FILE_PATH = '.well-known/answerfox-verify';
const DNS_PREFIX = 'answerfox-verify=';

/**
 * Generate a fresh verification token. 32 url-safe chars from
 * crypto-grade randomness. Stable enough for users to copy/paste,
 * narrow enough not to wrap awkwardly in DNS records.
 */
export function generateVerificationToken(): string {
  // 24 raw bytes → 32 base64url chars. Strip padding so the token
  // doesn't end in '=', which confuses DNS TXT parsers.
  return randomBytes(24).toString('base64url');
}

/**
 * Attempt all three verification methods against the site URL.
 * Returns as soon as any one matches. Aggregates outcomes for the
 * caller's UI when none match.
 */
export async function verifySiteOwnership(
  url: string,
  token: string,
  options: { readonly fetchImpl?: typeof fetch } = {},
): Promise<VerificationResult> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const attempts: Array<{
    method: VerificationMethod;
    outcome: 'not-found' | 'error';
    detail: string;
  }> = [];

  // Method 1: meta tag
  const meta = await checkMetaTag(url, token, fetchImpl);
  if (meta.ok) return meta;
  attempts.push({ method: 'meta', outcome: meta.outcome, detail: meta.detail });

  // Method 2: file
  const file = await checkWellKnownFile(url, token, fetchImpl);
  if (file.ok) return file;
  attempts.push({ method: 'file', outcome: file.outcome, detail: file.detail });

  // Method 3: DNS TXT
  const dns = await checkDnsTxt(url, token);
  if (dns.ok) return dns;
  attempts.push({ method: 'dns', outcome: dns.outcome, detail: dns.detail });

  return { ok: false, reason: 'not-found', attempts };
}

type OneMethodResult =
  | {
      readonly ok: true;
      readonly method: VerificationMethod;
      readonly evidence: string;
    }
  | {
      readonly ok: false;
      readonly method: VerificationMethod;
      readonly outcome: 'not-found' | 'error';
      readonly detail: string;
    };

async function checkMetaTag(
  url: string,
  token: string,
  fetchImpl: typeof fetch,
): Promise<OneMethodResult> {
  const controller = new AbortController();
  const handle = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);
  try {
    const r = await fetchImpl(url, {
      headers: { Accept: 'text/html' },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (!r.ok) {
      return {
        ok: false,
        outcome: 'error',
        detail: `HTTP ${r.status} fetching the page`,
        method: 'meta',
      };
    }
    const html = await r.text();
    // Look for <meta name="answerfox-verify" content="..."> in any
    // attribute order, single or double quotes.
    const pattern = new RegExp(
      `<meta\\s+[^>]*name=["']?${META_NAME}["']?\\s+[^>]*content=["']?([^"'>]+)["']?[^>]*/?>`,
      'i',
    );
    const altPattern = new RegExp(
      `<meta\\s+[^>]*content=["']?([^"'>]+)["']?\\s+[^>]*name=["']?${META_NAME}["']?[^>]*/?>`,
      'i',
    );
    const match = html.match(pattern) ?? html.match(altPattern);
    if (match === null) {
      return {
        ok: false,
        outcome: 'not-found',
        detail: `No <meta name="${META_NAME}"> tag found in the page`,
        method: 'meta',
      };
    }
    const found = match[1]?.trim();
    if (found !== token) {
      return {
        ok: false,
        outcome: 'not-found',
        detail: `<meta name="${META_NAME}"> present but content does not match the issued token`,
        method: 'meta',
      };
    }
    return {
      ok: true,
      method: 'meta',
      evidence: `<meta name="${META_NAME}" content="${token.slice(0, 6)}..."> matched`,
    };
  } catch (err) {
    return {
      ok: false,
      outcome: 'error',
      detail: err instanceof Error ? err.message : String(err),
      method: 'meta',
    };
  } finally {
    clearTimeout(handle);
  }
}

async function checkWellKnownFile(
  url: string,
  token: string,
  fetchImpl: typeof fetch,
): Promise<OneMethodResult> {
  const origin = new URL(url).origin;
  const target = `${origin}/${FILE_PATH}`;
  const controller = new AbortController();
  const handle = setTimeout(() => controller.abort(), VERIFICATION_TIMEOUT_MS);
  try {
    const r = await fetchImpl(target, {
      headers: { Accept: 'text/plain' },
      redirect: 'follow',
      signal: controller.signal,
    });
    if (r.status === 404) {
      return {
        ok: false,
        outcome: 'not-found',
        detail: `No file at ${target}`,
        method: 'file',
      };
    }
    if (!r.ok) {
      return {
        ok: false,
        outcome: 'error',
        detail: `HTTP ${r.status} fetching ${target}`,
        method: 'file',
      };
    }
    const body = (await r.text()).trim();
    if (body !== token) {
      return {
        ok: false,
        outcome: 'not-found',
        detail: `File at ${target} returned ${body.length} bytes that don't match the token`,
        method: 'file',
      };
    }
    return { ok: true, method: 'file', evidence: `${target} matched` };
  } catch (err) {
    return {
      ok: false,
      outcome: 'error',
      detail: err instanceof Error ? err.message : String(err),
      method: 'file',
    };
  } finally {
    clearTimeout(handle);
  }
}

async function checkDnsTxt(url: string, token: string): Promise<OneMethodResult> {
  const hostname = new URL(url).hostname;
  try {
    const records = await resolveTxt(hostname);
    // Each record is an array of string chunks (DNS spec); join chunks
    // per record then compare. Accept both `answerfox-verify=<token>`
    // and the bare token, since DNS providers vary in how they quote.
    for (const chunks of records) {
      const value = chunks.join('').trim();
      if (value === token || value === `${DNS_PREFIX}${token}`) {
        return { ok: true, method: 'dns', evidence: `TXT record on ${hostname} matched` };
      }
    }
    return {
      ok: false,
      outcome: 'not-found',
      detail: `${records.length} TXT record(s) on ${hostname}, none matched the token`,
      method: 'dns',
    };
  } catch (err) {
    return {
      ok: false,
      outcome: 'error',
      detail: err instanceof Error ? err.message : String(err),
      method: 'dns',
    };
  }
}
