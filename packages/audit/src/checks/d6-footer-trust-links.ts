import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const FOOTER_TRUST_PATHS = [
  { label: '/privacy', pattern: /\/privacy/i },
  { label: '/terms', pattern: /\/(terms|tos)/i },
  { label: '/contact', pattern: /\/contact/i },
] as const;

export const d6FooterTrustLinks = defineCheck<AuditDom>({
  id: 'D6',
  category: 'eeat-and-authority',
  severity: 'high',
  points: 2,
  description: 'Footer links to /privacy, /terms, and /contact',
  rationale:
    'The standard E-E-A-T footer pattern (privacy + terms + contact) is what crawlers expect. Missing the trio signals that the site cuts corners on the legal and trust basics.',
  docsUrl: 'https://answerfox.dev/docs/checks/D6',
  run: ({ dom }) => {
    const footer = dom('footer');
    if (footer.length === 0) {
      return {
        status: 'fail',
        fixRecommendation:
          'Add a <footer> element with links to /privacy, /terms, and /contact. These three together are the standard trust footer.',
      };
    }
    const found: string[] = [];
    for (const { label, pattern } of FOOTER_TRUST_PATHS) {
      const hit = dom('footer a[href]').filter((_, el) => {
        const href = dom(el).attr('href') ?? '';
        return pattern.test(href);
      });
      if (hit.length > 0) found.push(label);
    }
    if (found.length === 3) {
      return { status: 'pass', evidence: 'Footer has /privacy, /terms, /contact' };
    }
    if (found.length === 0) {
      return {
        status: 'fail',
        evidence: 'Footer has none of /privacy, /terms, /contact',
        fixRecommendation: 'Add all three trust links (privacy, terms, contact) to your <footer>.',
      };
    }
    return {
      status: 'warn',
      evidence: `Footer has ${found.length} of 3 trust links: ${found.join(', ')}`,
      fixRecommendation: `Add the missing footer trust link(s). Currently present: ${found.join(', ')}.`,
    };
  },
});
