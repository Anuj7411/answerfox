import type { Template } from '../types.js';

/**
 * Web Bot Auth public-key directory template (audit check G8).
 *
 * Web Bot Auth is the application of RFC 9421 HTTP Message Signatures
 * to identifying which bot is making a request. The site publishes
 * the public key at a well-known directory; the agent fetches that
 * key to verify the `Signature` and `Signature-Input` headers on
 * subsequent traffic.
 *
 * We scaffold the directory file in JWKS shape with a TODO for the
 * actual public key. The user generates a key pair locally
 * (Ed25519 is the recommended algorithm) and pastes the public
 * component into the `keys` array.
 *
 * Spec:
 *   - RFC 9421 (HTTP Message Signatures)
 *   - https://http-message-signatures-example.research.cloudflare.com/
 *     for the Web Bot Auth conventions
 *
 * Lives at `/.well-known/http-message-signatures-directory` so
 * verifiers can discover it from the response's `keyid` parameter.
 */
export const webBotAuthTemplate: Template = {
  name: 'web-bot-auth',
  filename: 'public/.well-known/http-message-signatures-directory',
  content: `{
  "keys": [
    {
      "kty": "OKP",
      "crv": "Ed25519",
      "kid": "TODO-key-id-1",
      "x": "TODO-base64url-public-key-component",
      "use": "sig",
      "alg": "EdDSA"
    }
  ],
  "_comment": "Generate a key pair with: openssl genpkey -algorithm ed25519 -out private.pem. Extract the public component with: openssl pkey -in private.pem -pubout. Base64url-encode the raw 32-byte public key and paste it as 'x' above. Pick a stable 'kid' (any string). Sign responses by setting Signature-Input and Signature headers per RFC 9421 with keyid=\\"<kid>\\". Remove this _comment field before deploying."
}
`,
  requiredTokens: [],
};
