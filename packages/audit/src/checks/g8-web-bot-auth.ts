import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/**
 * G8 — Web Bot Auth (HTTP Message Signatures, RFC 9421).
 *
 * RFC 9421 standardizes HTTP Message Signatures so a server can prove
 * it sent the response (and a client can prove it sent the request)
 * via cryptographic signatures over selected message fields. In the
 * agent era, this lets a site authenticate itself to AI agents
 * cryptographically — so an agent can be sure "claude was talking to
 * the real stripe.com, not a phishing proxy."
 *
 * We pass if the response carries both `Signature-Input` and
 * `Signature` headers per the spec. We don't validate the signature
 * itself — that requires the public key out of band. Presence of the
 * mechanism is what we score.
 *
 * 4 points, low severity, agent-readiness category. Brings G total
 * from 35 to 39 (still room for more in v0.7+).
 */
export const g8WebBotAuth = defineCheck<AuditDom>({
  id: 'G8',
  category: 'agent-readiness',
  severity: 'low',
  points: 4,
  description: 'HTTP Message Signatures (RFC 9421) on the origin response',
  rationale:
    "RFC 9421 lets a site cryptographically prove it's the origin an agent thinks it's talking to. Without it, agents can be phished by lookalike domains and proxies. As of mid-2026 this is an emerging standard; sites that ship it now establish the security baseline for the agent era.",
  docsUrl: 'https://answerfox.dev/docs/checks/G8',
  run: ({ headers }) => {
    if (headers === undefined) {
      return {
        status: 'skip',
        evidence: 'Response headers not available (test path with fixture HTML).',
      };
    }
    const signatureInput = headers.get('signature-input');
    const signature = headers.get('signature');

    if (signatureInput === null && signature === null) {
      return {
        status: 'fail',
        evidence: 'Neither Signature-Input nor Signature header present in the response',
        fixRecommendation:
          'Implement HTTP Message Signatures per RFC 9421. Cloudflare Workers: use the Web Bot Auth helper. Express: `http-message-signatures` package. Sign at minimum the @authority and @path fields with an Ed25519 key, publish the public key at /.well-known/http-message-signatures-directory.',
      };
    }
    if (signatureInput === null || signature === null) {
      return {
        status: 'warn',
        evidence: `Partial signature: ${signatureInput !== null ? 'Signature-Input' : 'Signature'} present but not both`,
        fixRecommendation:
          'RFC 9421 requires both Signature-Input (defines what was signed) and Signature (the cryptographic value) headers. Add the missing one.',
      };
    }

    return {
      status: 'pass',
      evidence: `Web Bot Auth signature present (Signature-Input: ${signatureInput.slice(0, 80)}${signatureInput.length > 80 ? '...' : ''})`,
    };
  },
});
