import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';
import { fetchOriginPath } from './_origin-fetch.js';

/**
 * G7 — `llms.txt` present at the origin root.
 *
 * llms.txt is the proposed standard (llmstxt.org) for sites to give
 * LLMs a curated, markdown-shaped table of contents to their most
 * important content. By April 2026 about 10% of sites have adopted
 * it; among developer-facing SaaS, adoption is closer to 40%.
 * Anthropic, Stripe, Vercel, Cloudflare all publish one.
 *
 * Spec: https://llmstxt.org/
 *
 * Cloudflare's Agent Readiness Score categorizes llms.txt under
 * Discoverability. We score it under Agent Readiness (G category)
 * because it's a signal aimed at AI agents specifically, not classic
 * search crawlers.
 *
 * Weighted at 5 points (added to the G budget; G now totals 35 of
 * 100 max points).
 */
export const g7LlmsTxt = defineCheck<AuditDom>({
  id: 'G7',
  category: 'agent-readiness',
  severity: 'medium',
  points: 5,
  description: 'llms.txt present at /llms.txt with markdown structure',
  rationale:
    'llms.txt is becoming the standard way to tell AI agents which pages on your site matter most. About 10% of sites overall publish one; ~40% of developer-facing SaaS do, including Anthropic, Stripe, Vercel, Cloudflare. Sites without it leave agents to guess from the link graph.',
  docsUrl: 'https://answerfox.dev/docs/checks/G7',
  run: async ({ url }) => {
    const result = await fetchOriginPath(url, 'llms.txt', {
      accept: 'text/markdown, text/plain, */*',
    });

    if (result.error !== null) {
      return {
        status: 'fail',
        evidence: `Could not reach ${result.url}: ${result.error}`,
        fixRecommendation:
          'Publish llms.txt at /llms.txt per the llmstxt.org spec. Minimal shape: a # H1 with your site name, a > blockquote describing it, then ## sections of markdown links to key pages.',
      };
    }
    if (result.status === null || result.status === 404) {
      return {
        status: 'fail',
        evidence: `No llms.txt found at ${result.url}`,
        fixRecommendation:
          'Publish at /llms.txt. Minimal: `# Site Name\\n\\n> One-sentence description.\\n\\n## Docs\\n\\n- [Quickstart](/docs/quickstart): one-line summary\\n`. See llmstxt.org.',
      };
    }
    if (result.status >= 300) {
      return {
        status: 'warn',
        evidence: `llms.txt endpoint returned HTTP ${result.status}`,
        fixRecommendation: 'Serve llms.txt with a 200 response.',
      };
    }
    if (result.body === null || result.body.length === 0) {
      return {
        status: 'warn',
        evidence: `llms.txt at ${result.url} returned an empty body`,
        fixRecommendation:
          'File is present but empty. Add at least an H1 with the site name and one section of curated links.',
      };
    }
    // llmstxt.org spec calls for: H1 site name, optional blockquote, then
    // H2 sections with markdown links. We accept any well-formed markdown
    // that has at least an H1 (the only strict required field).
    const body = result.body;
    const hasH1 = /^#\s+\S/m.test(body);
    const hasLinks = /\[[^\]]+\]\([^)]+\)/.test(body);
    if (!hasH1) {
      return {
        status: 'warn',
        evidence: `llms.txt present at ${result.url} but missing required H1 heading`,
        fixRecommendation:
          'Start the file with `# Site Name` on the first non-blank line. The H1 is the only required field per the llmstxt.org spec.',
      };
    }
    if (!hasLinks) {
      return {
        status: 'warn',
        evidence: `llms.txt present at ${result.url} with H1 but no markdown links to curated pages`,
        fixRecommendation:
          'Add at least one section of markdown links pointing at the pages you want LLMs to read first. Format: `- [Title](/path): brief description`.',
      };
    }
    return {
      status: 'pass',
      evidence: `llms.txt present at ${result.url} with H1 and ${(body.match(/\[[^\]]+\]\([^)]+\)/g) ?? []).length} link(s)`,
    };
  },
});
