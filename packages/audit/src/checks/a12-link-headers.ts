import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/**
 * A12 — RFC 8288 Link headers present in the HTTP response.
 *
 * Link headers expose machine-discoverable relationships from the
 * server side (rel=canonical, rel=alternate, rel=preload, rel=hub,
 * etc.) without requiring the client to parse HTML. AI agents that
 * crawl in HEAD-only mode rely on them. Cloudflare's Agent Readiness
 * Score categorizes this under Discoverability.
 *
 * We pass on ANY syntactically valid Link header with at least one
 * rel attribute. We're not enforcing a specific rel; presence of the
 * mechanism is what we score. Authoritative spec: RFC 8288.
 *
 * 1 point, low severity, meta-and-technical category.
 */
export const a12LinkHeaders = defineCheck<AuditDom>({
  id: 'A12',
  category: 'meta-and-technical',
  severity: 'low',
  points: 1,
  description: 'RFC 8288 Link header present in the HTTP response with rel= attribute',
  rationale:
    'Link headers let HEAD-only crawlers and agents discover relationships (canonical, alternate, preload, hub) without parsing HTML. Cloudflare scores this; classic SEO has relied on it for years.',
  docsUrl: 'https://answerfox.dev/docs/checks/A12',
  run: ({ headers }) => {
    if (headers === undefined) {
      return {
        status: 'skip',
        evidence: 'Response headers not available (test path with fixture HTML).',
      };
    }
    const linkHeader = headers.get('link');
    if (linkHeader === null || linkHeader.trim().length === 0) {
      return {
        status: 'fail',
        evidence: 'No Link header in the HTTP response',
        fixRecommendation:
          'Emit an RFC 8288 Link header from your server. Minimum useful: `Link: <https://example.com/page>; rel="canonical"`. Add `<...>; rel="alternate"; type="application/ld+json"` for machine-discoverable JSON-LD.',
      };
    }
    // Parse very forgivingly: count entries with a `rel=` attribute.
    // Multiple links can be comma-separated. RFC allows quoted strings
    // containing commas, but the common case is simple <url>; rel=...
    const entries = linkHeader.split(/,(?![^<]*>)/);
    const relCount = entries.filter((e: string) => /;\s*rel\s*=/i.test(e)).length;
    if (relCount === 0) {
      return {
        status: 'warn',
        evidence: `Link header present but no rel= attribute parsed: "${linkHeader.slice(0, 200)}"`,
        fixRecommendation:
          'Add a rel attribute to each Link entry. The rel is what makes the header machine-actionable.',
      };
    }
    return {
      status: 'pass',
      evidence: `Link header with ${relCount} rel-tagged entry${relCount === 1 ? '' : 'ies'}`,
    };
  },
});
