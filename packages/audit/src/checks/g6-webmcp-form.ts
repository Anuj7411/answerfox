import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/**
 * G6 — WebMCP form annotations present on at least one form.
 *
 * WebMCP (Chrome / W3C draft, shipping in Chrome 146 Canary as of
 * mid 2026) lets sites annotate HTML forms with attributes that AI
 * agents can use to fill and submit them on behalf of users. Without
 * these annotations, agents fall back to brittle DOM scraping.
 *
 * Spec: https://webmachinelearning.github.io/webmcp/
 *
 * Detection is conservative: we look for any of the candidate attribute
 * patterns currently in flight. As the spec stabilizes, we'll tighten.
 *
 * Weighted at 4 points starting v0.5.0 (part of the 30-point G budget).
 */
export const g6WebmcpForm = defineCheck<AuditDom>({
  id: 'G6',
  category: 'agent-readiness',
  severity: 'low',
  points: 4,
  description: 'WebMCP form annotations on at least 1 form',
  rationale:
    'WebMCP form annotations let agents fill and submit your forms without scraping the DOM. Sites without them force every agent (ChatGPT, Claude, etc.) to re-implement form understanding for your specific markup. As the spec ships (Chrome 146 Canary, mid 2026), this becomes a real differentiator.',
  docsUrl: 'https://answerfox.dev/docs/checks/G6',
  run: ({ dom }) => {
    const forms = dom('form');
    if (forms.length === 0) {
      return {
        status: 'skip',
        evidence: 'No <form> elements on the page; nothing to annotate',
      };
    }

    // Look for candidate WebMCP attribute patterns. The spec is still
    // converging; we accept any of the in-flight conventions.
    const candidatePatterns = [
      '[mcp-action]',
      '[data-mcp-action]',
      '[data-mcp-tool]',
      '[data-agent-action]',
      'form[mcp]',
    ];
    const annotated = dom(candidatePatterns.join(',')).length;

    if (annotated === 0) {
      return {
        status: 'fail',
        evidence: `${forms.length} form(s) on the page, 0 with WebMCP annotations`,
        fixRecommendation:
          'Add a WebMCP-style attribute to at least one form (e.g. `mcp-action="subscribe"` or `data-mcp-tool="newsletter-signup"`). The Chrome 146+ WebMCP API reads these to expose the form as an agent tool.',
      };
    }
    return {
      status: 'pass',
      evidence: `${annotated} element(s) with WebMCP-style annotations found`,
    };
  },
});
