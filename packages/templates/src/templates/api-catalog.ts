import type { Template } from '../types.js';

/**
 * API Catalog template (RFC 9727) for audit check G3.
 * Detected at `/.well-known/api-catalog` by AI agents and API
 * consumers enumerating which APIs this origin offers.
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc9727
 *
 * Filename has no extension per RFC 9727. Content uses the JSON
 * linkset format. RFC 9727 also allows link-format text, but JSON
 * is more agent-friendly.
 */
export const apiCatalogTemplate: Template = {
  name: 'api-catalog',
  filename: 'public/.well-known/api-catalog',
  content: `{
  "linkset": [
    {
      "anchor": "https://TODO.example.com",
      "service-desc": [
        {
          "href": "https://TODO.example.com/openapi.json",
          "type": "application/json"
        }
      ]
    }
  ]
}
`,
  requiredTokens: [],
};
