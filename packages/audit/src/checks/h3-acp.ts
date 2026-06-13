import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * H3 — Agentic Commerce Protocol (ACP) manifest present.
 *
 * ACP is OpenAI and Stripe's joint protocol for agent checkout flows.
 * Where UCP is the "browse/shop" layer, ACP is the "authorize and pay"
 * layer. An agent uses ACP to complete a transaction on a UCP-enabled
 * storefront with proper authorization, tax, and receipts.
 *
 * Detected at `/.well-known/acp.json`. Accepts a manifest with at
 * least a `version` and `checkout_endpoint` field.
 *
 * Spec context: OpenAI/Stripe announcement late 2025, formal docs
 * still consolidating in mid-2026.
 *
 * 3 points, medium severity, agentic-commerce category.
 */
export const h3Acp = defineCheck<AuditDom>({
  id: 'H3',
  category: 'agentic-commerce',
  severity: 'medium',
  points: 3,
  description: 'ACP manifest present at /.well-known/acp.json',
  rationale:
    'ACP is the agent checkout protocol from OpenAI and Stripe. UCP handles browse and shop; ACP handles authorize and pay. Sites with both let agents transact end-to-end; sites with only one expose half the funnel.',
  docsUrl: 'https://answerfox.dev/docs/checks/H3',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'acp.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish an ACP manifest at /.well-known/acp.json declaring your checkout endpoint and supported payment methods.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No ACP manifest at ${result.url}`,
        fixRecommendation:
          'Publish at /.well-known/acp.json. Minimal shape: { "version": "1", "checkout_endpoint": "https://api.example.com/acp/checkout", "payment_methods": ["card", "stripe_link"] }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `ACP endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve acp.json with a 200 response.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `ACP manifest present at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure acp.json is valid JSON.',
      };
    }
    const parsed = result.parsed as Record<string, unknown>;
    if (typeof parsed.checkout_endpoint !== 'string' && typeof parsed.version !== 'string') {
      return {
        status: 'warn',
        evidence: 'ACP manifest present but missing both "version" and "checkout_endpoint" fields',
        fixRecommendation:
          'ACP requires at least a "version" and a "checkout_endpoint" URL. Add both.',
      };
    }
    return {
      status: 'pass',
      evidence: `ACP manifest present at ${result.url}`,
    };
  },
});
