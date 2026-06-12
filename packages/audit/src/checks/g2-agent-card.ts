import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * G2 — A2A `agent-card.json` present at `/.well-known/agent-card.json`.
 *
 * Part of the Agent-to-Agent (A2A) protocol. Lets one agent discover
 * another agent's identity, capabilities, and trust signals before
 * initiating a request or transaction.
 *
 * Spec: https://agent2agent.info/ (AgentCard)
 *
 * Weighted at 6 points starting v0.5.0 (part of the 30-point G budget).
 */
export const g2AgentCard = defineCheck<AuditDom>({
  id: 'G2',
  category: 'agent-readiness',
  severity: 'medium',
  points: 6,
  description: 'A2A agent-card.json present at /.well-known/agent-card.json',
  rationale:
    "The A2A AgentCard is how an agent advertises its identity, capabilities, and trust signals to other agents. Sites and agent endpoints without it can't be discovered or trusted by agent-to-agent traffic. Stripe, Vercel, Supabase, and Linear were all missing this as of mid 2026.",
  docsUrl: 'https://answerfox.dev/docs/checks/G2',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'agent-card.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish an agent-card.json at /.well-known/agent-card.json with name, description, capabilities, and trust signals per the A2A spec.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No agent-card.json found at ${result.url}`,
        fixRecommendation:
          'Publish agent-card.json at /.well-known/agent-card.json. See agent2agent.info for the schema.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `agent-card.json endpoint returned HTTP ${result.status}`,
        fixRecommendation:
          'Serve agent-card.json with a 200 response and Content-Type: application/json.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `agent-card.json found at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure agent-card.json is valid JSON.',
      };
    }
    return {
      status: 'pass',
      evidence: `agent-card.json present at ${result.url}`,
    };
  },
});
