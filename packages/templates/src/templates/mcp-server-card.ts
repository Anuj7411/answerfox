import type { Template } from '../types.js';

/**
 * MCP Server Card template (audit check G1).
 * Detected at `/.well-known/mcp/server-card.json` by AI agents
 * discovering Model Context Protocol servers exposed by this site.
 *
 * Spec: https://modelcontextprotocol.io/
 */
export const mcpServerCardTemplate: Template = {
  name: 'mcp-server-card',
  filename: 'public/.well-known/mcp/server-card.json',
  content: `{
  "name": "TODO Your MCP server name",
  "description": "TODO One sentence describing what your MCP server exposes",
  "endpoint": "https://TODO.example.com/mcp",
  "version": "1",
  "protocol": "mcp/1.0"
}
`,
  requiredTokens: [],
};
