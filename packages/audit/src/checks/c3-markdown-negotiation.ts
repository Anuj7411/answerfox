import { type AbsoluteUrl, defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/**
 * C3 — origin negotiates Markdown when the client asks for it.
 *
 * AI agents prefer markdown over HTML for the same content because it
 * uses fewer tokens and parses faster. Sites that serve markdown via
 * HTTP content negotiation (returning text/markdown when the client
 * sends `Accept: text/markdown`) materially reduce token cost for
 * every agent that visits them. Cloudflare's Agent Readiness Score
 * categorizes this under Content.
 *
 * Pass: client requests text/markdown, server returns markdown
 * (response Content-Type begins with `text/markdown`, OR body starts
 * with markdown shape — H1, no <html> tag, no <!DOCTYPE).
 *
 * Fail: server returns HTML regardless of Accept header.
 *
 * 2 points, low severity, structured-data category.
 */

interface FetchOptions {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

async function fetchWithAccept(
  pageUrl: AbsoluteUrl,
  accept: string,
  options: FetchOptions = {},
): Promise<{ contentType: string | null; body: string | null; error: string | null }> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 5_000;
  const controller = new AbortController();
  const handle = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetchImpl(pageUrl, {
      method: 'GET',
      headers: { Accept: accept },
      signal: controller.signal,
      redirect: 'follow',
    });
    if (!r.ok) return { contentType: null, body: null, error: `HTTP ${r.status}` };
    const ct = r.headers.get('content-type')?.toLowerCase() ?? null;
    const body = await r.text();
    return { contentType: ct, body, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { contentType: null, body: null, error: message };
  } finally {
    clearTimeout(handle);
  }
}

export const c3MarkdownNegotiation = defineCheck<AuditDom>({
  id: 'C3',
  category: 'structured-data',
  severity: 'low',
  points: 2,
  description: 'Origin returns Markdown when the client sends Accept: text/markdown',
  rationale:
    'AI agents that fetch this URL with `Accept: text/markdown` get a token-efficient markdown response instead of full HTML. Reduces token cost for every agent visit. Cloudflare scores this; an emerging best practice for AI-first sites.',
  docsUrl: 'https://answerfox.dev/docs/checks/C3',
  run: async ({ url }) => {
    const result = await fetchWithAccept(url, 'text/markdown, text/x-markdown, */*;q=0.1');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not re-fetch ${url} with Accept: text/markdown: ${result.error}`,
        fixRecommendation:
          'Implement content negotiation: when the request `Accept` header includes `text/markdown`, return a markdown representation of the page.',
      };
    }

    const contentTypeIsMarkdown =
      result.contentType !== null &&
      (result.contentType.startsWith('text/markdown') ||
        result.contentType.startsWith('text/x-markdown'));

    if (contentTypeIsMarkdown) {
      return {
        status: 'pass',
        evidence: `Server returned Content-Type: ${result.contentType}`,
      };
    }

    // Fallback heuristic: body shape looks like markdown (starts with H1,
    // no <html> root) even if Content-Type is wrong.
    if (result.body !== null) {
      const sample = result.body.slice(0, 500).trim();
      const looksLikeMarkdown =
        /^#\s+\S/.test(sample) && !/<html[\s>]/i.test(sample) && !/^<!doctype html/i.test(sample);
      if (looksLikeMarkdown) {
        return {
          status: 'warn',
          evidence: `Body shape is markdown but Content-Type is ${result.contentType ?? 'unset'}`,
          fixRecommendation:
            'Return `Content-Type: text/markdown; charset=utf-8` so caches and clients can route the response correctly.',
        };
      }
    }

    return {
      status: 'fail',
      evidence: `Server returned ${result.contentType ?? 'unknown content-type'} despite Accept: text/markdown`,
      fixRecommendation:
        'Add a request handler that returns the page as markdown when `Accept: text/markdown` is present. Most frameworks: `if (req.headers.accept?.includes("text/markdown")) return new Response(toMarkdown(content), { headers: { "Content-Type": "text/markdown" } })`.',
    };
  },
});
