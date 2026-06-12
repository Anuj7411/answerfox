import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * G1 — MCP Server Card present at `/.well-known/mcp/server-card.json`.
 *
 * The MCP Server Card is the Model Context Protocol's standard way for
 * a site or API to advertise an MCP server endpoint to AI agents. When
 * present, an agent can discover the server's name, description, and
 * endpoint URL without prior knowledge.
 *
 * Spec: https://modelcontextprotocol.io/ (server card discovery)
 *
 * Weighted at 6 points starting v0.5.0: Agent Readiness is the
 * Answerfox wedge, so the G category contributes 30 of the 100-point
 * total. MCP discovery is the most foundational of the six.
 */
export const g1McpServerCard = defineCheck<AuditDom>({
  id: 'G1',
  category: 'agent-readiness',
  severity: 'medium',
  points: 6,
  description: 'MCP Server Card present at /.well-known/mcp/server-card.json',
  rationale:
    "The MCP Server Card lets AI agents discover that your site exposes an MCP server. Without it, agents can't find your tools even if your MCP server is running. As of mid 2026, fewer than 1 in 100 sites with public APIs publish one.",
  docsUrl: 'https://answerfox.dev/docs/checks/G1',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'mcp/server-card.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish an MCP Server Card at /.well-known/mcp/server-card.json with name, description, and your MCP endpoint URL.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No MCP Server Card found at ${result.url}`,
        fixRecommendation:
          'Publish an MCP Server Card at /.well-known/mcp/server-card.json. Minimal shape: { "name": "...", "description": "...", "endpoint": "https://..." }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `MCP Server Card endpoint returned HTTP ${result.status}`,
        fixRecommendation:
          'Serve the MCP Server Card with a 200 response and Content-Type: application/json.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `MCP Server Card found at ${result.url} but body is not valid JSON`,
        fixRecommendation:
          'Ensure the MCP Server Card is valid JSON. Validate with a JSON linter before deploying.',
      };
    }
    return {
      status: 'pass',
      evidence: `MCP Server Card present at ${result.url}`,
    };
  },
});
