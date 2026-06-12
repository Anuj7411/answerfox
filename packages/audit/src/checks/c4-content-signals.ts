import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

/**
 * C4 — Content Signals declared via HTTP header or meta tag.
 *
 * Content Signals is Cloudflare's proposal (April 2026) for sites to
 * declare structured policy about how their content may be used by AI
 * systems — citation requirements, training opt-out, paywall hints,
 * and freshness signals. Either an `X-Content-Signals` HTTP header
 * or a `<meta name="content-signals">` tag satisfies the check.
 *
 * Pass: signal present (header or meta) with at least one recognised
 * policy field (`use-policy`, `citation`, `training`, `paywall`, or
 * `freshness`).
 *
 * Warn: signal present but minimal (no recognised policy fields).
 *
 * Fail: neither header nor meta tag present.
 *
 * 2 points, medium severity, structured-data category.
 */

const RECOGNISED_FIELDS = ['use-policy', 'citation', 'training', 'paywall', 'freshness'];

export const c4ContentSignals = defineCheck<AuditDom>({
  id: 'C4',
  category: 'structured-data',
  severity: 'medium',
  points: 2,
  description: 'Content Signals declared via X-Content-Signals header or meta tag',
  rationale:
    'Content Signals lets sites declare how AI may use their content (cite, summarize, train, paywall). Without a signal, agents default to ambiguous treatment — usually a citation-free summary. Sites that ship the signal get the citation, the link, and the audit trail.',
  docsUrl: 'https://answerfox.dev/docs/checks/C4',
  run: ({ dom, headers }) => {
    // Path 1: HTTP header (preferred; harder to lie about)
    const headerValue = headers?.get('x-content-signals')?.trim() ?? null;

    // Path 2: meta tag (acceptable fallback for static sites)
    const metaValue =
      dom('meta[name="content-signals"], meta[name="X-Content-Signals" i]')
        .attr('content')
        ?.trim() ?? null;

    const signal = headerValue ?? metaValue;
    const source = headerValue !== null ? 'header' : metaValue !== null ? 'meta tag' : null;

    if (signal === null || signal.length === 0) {
      return {
        status: 'fail',
        evidence:
          'No X-Content-Signals HTTP header and no <meta name="content-signals"> tag found.',
        fixRecommendation:
          'Declare your content policy. Minimum: `X-Content-Signals: citation=required, training=opt-out`. Or as a meta tag: `<meta name="content-signals" content="citation=required, training=opt-out">`. See Cloudflare Content Signals spec.',
      };
    }

    const lowered = signal.toLowerCase();
    const recognised = RECOGNISED_FIELDS.filter((field) =>
      new RegExp(`\\b${field}\\b`).test(lowered),
    );

    if (recognised.length === 0) {
      return {
        status: 'warn',
        evidence: `Content Signals present via ${source} but no recognised policy field: "${signal.slice(0, 200)}"`,
        fixRecommendation: `Use at least one recognised field: ${RECOGNISED_FIELDS.join(', ')}.`,
      };
    }

    return {
      status: 'pass',
      evidence: `Content Signals via ${source}, ${recognised.length} field(s): ${recognised.join(', ')}`,
    };
  },
});
