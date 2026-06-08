import type { Template } from '../types.js';

/**
 * agent-permissions.json template for audit check G4.
 * Detected at `/.well-known/agent-permissions.json` by AI agents
 * determining which actions they're authorized to take on this site.
 * Robots.txt for AI agents.
 *
 * Spec: https://arxiv.org/pdf/2601.02371 (early proposal)
 *
 * Default policy: allow read for all agents, deny write/execute,
 * with a sample carve-out for a specific named agent. Edit to fit
 * your actual policy.
 */
export const agentPermissionsTemplate: Template = {
  name: 'agent-permissions',
  filename: 'public/.well-known/agent-permissions.json',
  content: `{
  "version": "1",
  "agents": [
    {
      "agent": "*",
      "actions": {
        "read": "allow",
        "write": "deny",
        "execute": "deny"
      }
    },
    {
      "agent": "ChatGPT-User",
      "actions": {
        "read": "allow",
        "write": "deny"
      }
    },
    {
      "agent": "Claude-User",
      "actions": {
        "read": "allow",
        "write": "deny"
      }
    },
    {
      "agent": "PerplexityBot",
      "actions": {
        "read": "allow"
      }
    }
  ]
}
`,
  requiredTokens: [],
};
