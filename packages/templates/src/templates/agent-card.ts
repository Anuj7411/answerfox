import type { Template } from '../types.js';

/**
 * A2A `agent-card.json` template (audit check G2).
 * Detected at `/.well-known/agent-card.json` by AI agents and other
 * agent-to-agent (A2A) actors discovering this site's identity,
 * capabilities, and trust signals.
 *
 * Spec: https://agent2agent.info/
 *
 * Content is intentionally static with TODO placeholders. After running
 * `af add agent-card`, the user edits the file to declare their actual
 * name, description, and capabilities. No tokens are prompted for in
 * v0.3.1 because the manifest fields are heterogeneous (URLs, arrays,
 * structured objects) and a static template is easier to hand-edit
 * than to fill via interactive prompts.
 */
export const agentCardTemplate: Template = {
  name: 'agent-card',
  filename: 'public/.well-known/agent-card.json',
  content: `{
  "name": "TODO Your site or product name",
  "description": "TODO One sentence describing what an agent can do with this site",
  "url": "https://TODO.example.com",
  "version": "1",
  "capabilities": [
    "read"
  ],
  "contact": {
    "email": "TODO@example.com"
  }
}
`,
  requiredTokens: [],
};
