import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * H4 — Machine Payment Protocol (MPP) manifest present.
 *
 * MPP is Cloudflare's addition to the agentic commerce stack — they
 * added it to the Agent Readiness Score in May 2026, after the
 * initial April 2026 launch. Where x402 settles a single API call,
 * MPP coordinates streaming payment over a longer-lived agent
 * session (e.g. a multi-step research task running across an hour).
 *
 * Detected at `/.well-known/mpp.json`. Accepts a manifest with at
 * least a `version` and `session_endpoint` field.
 *
 * 2 points, low severity (newest spec, still consolidating),
 * agentic-commerce category.
 */
export const h4Mpp = defineCheck<AuditDom>({
  id: 'H4',
  category: 'agentic-commerce',
  severity: 'low',
  points: 2,
  description: 'MPP manifest present at /.well-known/mpp.json',
  rationale:
    'MPP (Machine Payment Protocol) handles streaming or session-scoped payments where a single x402 transaction is the wrong granularity. Useful for long-running agent tasks that consume metered API time. Added to Cloudflare AR Score May 2026.',
  docsUrl: 'https://answerfox.dev/docs/checks/H4',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'mpp.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish an MPP manifest at /.well-known/mpp.json declaring your session payment endpoint.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No MPP manifest at ${result.url}`,
        fixRecommendation:
          'Publish at /.well-known/mpp.json. Minimal shape: { "version": "1", "session_endpoint": "https://api.example.com/mpp/session", "billing": "per-second" }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `MPP endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve mpp.json with a 200 response.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `MPP manifest present at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure mpp.json is valid JSON.',
      };
    }
    return {
      status: 'pass',
      evidence: `MPP manifest present at ${result.url}`,
    };
  },
});
