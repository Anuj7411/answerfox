import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * G5 — OAuth Authorization Server Metadata (RFC 8414) present.
 *
 * RFC 8414 standardizes the OAuth discovery document at
 * `/.well-known/oauth-authorization-server`. When agents need to
 * authenticate with your APIs (for write actions, paid actions, or
 * user-scoped reads), they discover the token endpoint and supported
 * flows from this document. Without it, OAuth is effectively dark for
 * agents that don't have hardcoded knowledge of your auth setup.
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc8414
 *
 * Weighted at 4 points starting v0.5.0 (part of the 30-point G budget).
 */
export const g5OauthDiscovery = defineCheck<AuditDom>({
  id: 'G5',
  category: 'agent-readiness',
  severity: 'low',
  points: 4,
  description: 'OAuth Authorization Server Metadata (RFC 8414) present',
  rationale:
    "RFC 8414 metadata lets agents discover your OAuth token endpoint, supported flows, and scopes without prior knowledge. Required for agent-to-agent auth at scale. If your site doesn't authenticate users at all, this check is skippable, but most production sites should publish it.",
  docsUrl: 'https://answerfox.dev/docs/checks/G5',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'oauth-authorization-server');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish OAuth discovery at /.well-known/oauth-authorization-server per RFC 8414. Required fields include `issuer`, `authorization_endpoint`, `token_endpoint`.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No OAuth discovery document found at ${result.url}`,
        fixRecommendation:
          'Publish per RFC 8414 at /.well-known/oauth-authorization-server with at minimum: issuer, authorization_endpoint, token_endpoint, jwks_uri.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `OAuth discovery endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve the OAuth discovery document with a 200 response.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `OAuth discovery found at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure the OAuth discovery document is valid JSON per RFC 8414.',
      };
    }
    // Verify minimal RFC 8414 required field
    const parsed = result.parsed as Record<string, unknown>;
    if (typeof parsed.issuer !== 'string') {
      return {
        status: 'warn',
        evidence: `OAuth discovery present but missing required "issuer" field`,
        fixRecommendation:
          'RFC 8414 requires an "issuer" field. Add the issuer URL identifying your OAuth server.',
      };
    }
    return {
      status: 'pass',
      evidence: `OAuth discovery present at ${result.url} (issuer: ${parsed.issuer})`,
    };
  },
});
