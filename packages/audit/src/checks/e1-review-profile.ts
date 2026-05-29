import { defineCheck } from '@answerfox/core';
import type { AuditDom } from '../parser.js';

const REVIEW_HOSTS = [
  'g2.com',
  'producthunt.com',
  'capterra.com',
  'trustpilot.com',
  'glassdoor.com',
  'softwareadvice.com',
  'getapp.com',
] as const;

export const e1ReviewProfile = defineCheck<AuditDom>({
  id: 'E1',
  category: 'offsite-citations',
  severity: 'medium',
  points: 2,
  description: 'Link to a review / marketplace profile (G2, Product Hunt, Capterra, ...)',
  rationale:
    "Third-party reviews are an off-site authority signal AI engines weight heavily — they're the SaaS equivalent of academic citations. One link to a review profile beats five sameAs entries on Twitter clones.",
  docsUrl: 'https://answerfox.dev/docs/checks/E1',
  run: ({ dom }) => {
    const matches = new Set<string>();
    dom('a[href]').each((_, el) => {
      const href = dom(el).attr('href') ?? '';
      for (const host of REVIEW_HOSTS) {
        if (href.toLowerCase().includes(host)) {
          matches.add(host);
        }
      }
    });
    if (matches.size === 0) {
      return {
        status: 'warn',
        fixRecommendation: `Link to a review profile (e.g. ${REVIEW_HOSTS.slice(0, 4).join(', ')}). Off-site reviews are an authority signal AI engines lean on.`,
      };
    }
    return { status: 'pass', evidence: `Found profile link(s): ${[...matches].join(', ')}` };
  },
});
