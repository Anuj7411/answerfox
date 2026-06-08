import type { Template } from '../types.js';

/**
 * OAuth Authorization Server Metadata template (RFC 8414) for
 * audit check G5. Detected at `/.well-known/oauth-authorization-server`
 * by AI agents discovering OAuth flows for authenticated actions on
 * this site.
 *
 * Spec: https://www.rfc-editor.org/rfc/rfc8414
 *
 * Filename has no extension per RFC 8414. Required field is `issuer`;
 * the rest are recommended-not-required but expected by most clients.
 */
export const oauthDiscoveryTemplate: Template = {
  name: 'oauth-discovery',
  filename: 'public/.well-known/oauth-authorization-server',
  content: `{
  "issuer": "https://TODO.example.com",
  "authorization_endpoint": "https://TODO.example.com/oauth/authorize",
  "token_endpoint": "https://TODO.example.com/oauth/token",
  "jwks_uri": "https://TODO.example.com/.well-known/jwks.json",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "scopes_supported": ["openid", "profile", "email"],
  "token_endpoint_auth_methods_supported": ["client_secret_basic", "client_secret_post"]
}
`,
  requiredTokens: [],
};
