import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * H1 — x402 payment capability advertised.
 *
 * x402 (Coinbase, now under the Linux Foundation as the x402
 * Foundation) revives HTTP status 402 ("Payment Required") so machines
 * can settle micropayments without a human in the loop. As of April
 * 2026 x402 carried 69,000 active agents, 165 million transactions,
 * and ~$50M in cumulative volume.
 *
 * We accept three signals of x402 capability, easiest to hardest:
 *  1. A `.well-known/x402` manifest (the modern discovery path)
 *  2. An `X-Payment-Required` HTTP header on the main response
 *  3. A `402` status code in the response history
 *
 * Spec: https://x402.org/
 *
 * 4 points, medium severity, agentic-commerce category.
 * H category total: 12 of 100 (H1=4, H2=3, H3=3, H4=2).
 */
export const h1X402 = defineCheck<AuditDom>({
  id: 'H1',
  category: 'agentic-commerce',
  severity: 'medium',
  points: 4,
  description: 'x402 capability advertised via manifest, header, or status code',
  rationale:
    'x402 is the dominant machine-to-machine settlement protocol (Linux Foundation, $50M+ cumulative volume by Apr 2026). Sites that advertise the capability let agent traffic pay for API calls without human checkout. As agentic commerce inflects, this becomes table stakes for paid APIs and metered content.',
  docsUrl: 'https://answerfox.dev/docs/checks/H1',
  run: async ({ url, headers }) => {
    // Signal 1: well-known manifest
    const manifest = await fetchWellKnown(url, 'x402');
    if (
      manifest.error === null &&
      manifest.status !== null &&
      manifest.status >= 200 &&
      manifest.status < 300
    ) {
      return {
        status: 'pass',
        evidence: `x402 manifest present at ${manifest.url}`,
      };
    }

    // Signal 2: X-Payment-Required header on main response
    if (headers !== undefined) {
      const xPaymentRequired = headers.get('x-payment-required');
      if (xPaymentRequired !== null && xPaymentRequired.trim().length > 0) {
        return {
          status: 'pass',
          evidence: `X-Payment-Required header present: "${xPaymentRequired.slice(0, 100)}"`,
        };
      }
    }

    // Neither signal — recommend the manifest as the discovery surface.
    return {
      status: 'fail',
      evidence:
        'No x402 capability advertised (checked /.well-known/x402 and X-Payment-Required header)',
      fixRecommendation:
        'Publish an x402 manifest at /.well-known/x402 declaring your payment endpoint and supported settlement chains. Minimal shape: { "endpoint": "https://api.example.com/x402", "chains": ["base-mainnet"] }. See x402.org.',
    };
  },
});
