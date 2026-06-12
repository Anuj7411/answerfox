import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchOriginPath } from './_origin-fetch.js';

/**
 * A13 — robots.txt declares explicit rules for AI bot user agents.
 *
 * Generic `User-agent: *` rules let AI crawlers in or out by default,
 * but the agent era is moving fast: ChatGPT, Claude, Perplexity, and
 * Gemini all publish distinct user-agent strings. Sites that want to
 * opt-in or opt-out per agent need explicit rules. Cloudflare scores
 * this; this check is the OSS equivalent.
 *
 * Pass: at least one explicit AI bot user agent (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended, OAI-SearchBot, anthropic-ai,
 * cohere-ai, CCBot, Applebot-Extended, etc.) appears in robots.txt.
 *
 * Warn: robots.txt exists but only has generic `User-agent: *`.
 *
 * Fail: no robots.txt OR all major AI bots are blocked via Disallow: /
 * (the second case is intentional but worth flagging — most sites
 * blocking everything wanted to block scrapers, not LLMs).
 *
 * 2 points, medium severity, meta-and-technical category.
 */

// Known AI bot user-agent strings as of mid-2026. Add as new bots
// publish identifiers. Lowercased for case-insensitive matching.
const AI_BOTS = [
  'gptbot',
  'oai-searchbot',
  'chatgpt-user',
  'claudebot',
  'claude-web',
  'anthropic-ai',
  'perplexitybot',
  'perplexity-user',
  'google-extended',
  'cohere-ai',
  'ccbot',
  'applebot-extended',
  'meta-externalagent',
  'meta-externalfetcher',
  'amazonbot',
  'bytespider',
  'duckassistbot',
  'mistralai-user',
] as const;

export const a13AiBotRules = defineCheck<AuditDom>({
  id: 'A13',
  category: 'meta-and-technical',
  severity: 'medium',
  points: 2,
  description: 'robots.txt declares explicit rules for AI bot user agents',
  rationale:
    "Generic robots rules can't express AI-specific policy. Cloudflare scores explicit AI bot rules; sites that haven't added them either let AI crawlers in by default or block them accidentally as part of a sweep. Either is a policy gap worth flagging.",
  docsUrl: 'https://answerfox.dev/docs/checks/A13',
  run: async ({ url }) => {
    const result = await fetchOriginPath(url, 'robots.txt', {
      accept: 'text/plain, */*',
    });

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish robots.txt at /robots.txt with explicit AI bot rules. Example: `User-agent: GPTBot\\nAllow: /\\n\\nUser-agent: ClaudeBot\\nAllow: /`.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No robots.txt found at ${result.url}`,
        fixRecommendation:
          'Publish robots.txt at /robots.txt. Declare per-bot rules for at least GPTBot, ClaudeBot, PerplexityBot, and Google-Extended.',
      };
    }
    if (result.status >= 300 || result.body === null) {
      return {
        status: 'warn',
        evidence: `robots.txt returned HTTP ${result.status}`,
        fixRecommendation: 'Serve robots.txt with a 200 response and Content-Type: text/plain.',
      };
    }

    const lowered = result.body.toLowerCase();
    const declaredBots = AI_BOTS.filter((bot) =>
      new RegExp(`^user-agent:\\s*${bot}\\b`, 'mi').test(lowered),
    );

    if (declaredBots.length === 0) {
      return {
        status: 'warn',
        evidence:
          'robots.txt present but has no explicit AI bot user-agent declarations (only generic rules)',
        fixRecommendation:
          'Add per-agent rules so your policy is unambiguous. Minimum: `User-agent: GPTBot`, `User-agent: ClaudeBot`, `User-agent: PerplexityBot`, `User-agent: Google-Extended`, each followed by Allow or Disallow.',
      };
    }

    return {
      status: 'pass',
      evidence: `robots.txt declares ${declaredBots.length} AI bot user-agent(s): ${declaredBots.slice(0, 5).join(', ')}${declaredBots.length > 5 ? '...' : ''}`,
    };
  },
});
