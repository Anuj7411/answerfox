import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * G3 — API Catalog (RFC 9727) present at `/.well-known/api-catalog`.
 *
 * RFC 9727 standardizes how a publisher advertises their APIs in a
 * machine-discoverable way. When present, AI agents can enumerate
 * which APIs the site offers and where their OpenAPI specs live.
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc9727
 *
 * Currently informational (points: 0) per v0.3.0 design.
 */
export const g3ApiCatalog = defineCheck<AuditDom>({
  id: 'G3',
  category: 'agent-readiness',
  severity: 'medium',
  points: 0,
  description: 'API Catalog (RFC 9727) present at /.well-known/api-catalog',
  rationale:
    "RFC 9727 is the IETF standard for advertising your APIs to machine consumers. AI agents that want to interact with your services discover them through this catalog. Without it, agents can't even know your APIs exist unless they're already documented in agent-specific manifests.",
  docsUrl: 'https://answerfox.dev/docs/checks/G3',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'api-catalog');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish an API catalog at /.well-known/api-catalog per RFC 9727. Use the JSON linkset format with rel="service-desc" pointing at each OpenAPI spec.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No API catalog found at ${result.url}`,
        fixRecommendation:
          'Publish at /.well-known/api-catalog per RFC 9727. Minimal JSON linkset: { "linkset": [ { "anchor": "https://api.example.com/v1", "service-desc": [ { "href": "https://api.example.com/openapi.json", "type": "application/json" } ] } ] }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `API catalog endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve the API catalog with a 200 response.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `API catalog found at ${result.url} but body is not valid JSON`,
        fixRecommendation:
          'RFC 9727 allows JSON or link-format. Either is fine, but ensure the response is parseable.',
      };
    }
    return {
      status: 'pass',
      evidence: `API catalog present at ${result.url}`,
    };
  },
});
