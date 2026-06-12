import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchWellKnown } from './_well-known.js';

/**
 * G4 — agent-permissions.json present at `/.well-known/agent-permissions.json`.
 *
 * The agent-permissions manifest tells AI agents what actions they're
 * allowed to perform on this site (read, write, transact) and under
 * what authentication. It's the agent-era successor to robots.txt.
 *
 * Spec: https://arxiv.org/pdf/2601.02371 (early proposal)
 *
 * Weighted at 5 points starting v0.5.0 (part of the 30-point G budget).
 */
export const g4AgentPermissions = defineCheck<AuditDom>({
  id: 'G4',
  category: 'agent-readiness',
  severity: 'medium',
  points: 5,
  description: 'agent-permissions.json present at /.well-known/agent-permissions.json',
  rationale:
    "agent-permissions.json is robots.txt for AI agents. It declares which agents are allowed, which actions they can take, and any rate limits. Without it, agents either defer to robots.txt (which doesn't cover agent actions) or proceed without policy clarity.",
  docsUrl: 'https://answerfox.dev/docs/checks/G4',
  run: async ({ url }) => {
    const result = await fetchWellKnown(url, 'agent-permissions.json');

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish agent-permissions.json at /.well-known/ declaring which agents are allowed and which actions they can take.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No agent-permissions.json found at ${result.url}`,
        fixRecommendation:
          'Publish at /.well-known/agent-permissions.json. Minimal shape: { "version": "1", "agents": [{ "agent": "*", "actions": { "read": "allow", "write": "deny" } }] }.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `agent-permissions.json endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve agent-permissions.json with a 200 response.',
      };
    }
    if (result.parsed === null) {
      return {
        status: 'warn',
        evidence: `agent-permissions.json found at ${result.url} but body is not valid JSON`,
        fixRecommendation: 'Ensure agent-permissions.json is valid JSON.',
      };
    }
    return {
      status: 'pass',
      evidence: `agent-permissions.json present at ${result.url}`,
    };
  },
});
