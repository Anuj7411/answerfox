import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * H2 — Universal Commerce Protocol (UCP) manifest present.
 *
 * UCP launched January 11, 2026 — Google's commerce protocol for
 * agent-to-storefront communication, co-developed with Shopify, Etsy,
 * Wayfair, Target, and Walmart. It standardizes how an agent asks
 * a store about products, availability, and pricing, and how the
 * store responds in a structured form an agent can act on.
 *
 * Detected at `/.well-known/ucp.json`. Must be valid JSON with at
 * least a `version` and `endpoint` field.
 *
 * Spec: https://universalcommerceprotocol.org/
 *
 * 3 points, medium severity, agentic-commerce category.
 */
export const h2Ucp = defineCheck<AuditDom>({
  id: 'H2',
  category: 'agentic-commerce',
  severity: 'medium',
  points: 3,
  description: 'UCP manifest present at /.well-known/ucp.json',
  rationale:
    "UCP is how agents discover and transact with storefronts. Launched by Google with Shopify, Walmart, Target, and Wayfair in Jan 2026. Stores that ship the manifest get agent traffic; stores that don't are invisible to agent-driven shopping.",
  docsUrl: 'https://answerfox.dev/docs/checks/H2',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'ucp.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish a UCP manifest at /.well-known/ucp.json declaring your commerce endpoint and supported actions. See universalcommerceprotocol.org for the schema.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No UCP manifest at ${result.url}`,
        fixRecommendation:
          'Publish at /.well-known/ucp.json. Minimal shape: { "version": "1", "endpoint": "https://api.example.com/ucp", "supports": ["catalog", "checkout"] }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `UCP endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve ucp.json with a 200 response and Content-Type: application/json.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `UCP manifest present at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure ucp.json is valid JSON.',
      };
    }
    const parsed = result.parsed as Record<string, unknown>;
    if (typeof parsed.endpoint !== 'string' && typeof parsed.version !== 'string') {
      return {
        status: 'warn',
        evidence: 'UCP manifest present but missing both "version" and "endpoint" fields',
        fixRecommendation:
          'UCP requires at least a "version" string and an "endpoint" URL. Add both.',
      };
    }
    return {
      status: 'pass',
      evidence: `UCP manifest present at ${result.url}`,
    };
  },
});
