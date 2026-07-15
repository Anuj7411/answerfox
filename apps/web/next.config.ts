import type { NextConfig } from 'next';

/**
 * Porcelain design copies are served verbatim from `public/design/*.html`
 * (the delivered design files + their own runtime), with app routes mapped
 * onto them via `beforeFiles` rewrites so they override the React routes and
 * render standalone (their own shell), exactly like the design. The only edit
 * to each file is the white-with-lines background swap (see the injected
 * `#afx-bg-swap` style). The landing (`/`) stays the React port.
 */
const DESIGN: ReadonlyArray<{ source: string; file: string }> = [
  // per-site tabs (most specific first)
  { source: '/dashboard/sites/:id/findings', file: 'Findings' },
  { source: '/dashboard/sites/:id/x-ray', file: 'X-Ray' },
  { source: '/dashboard/sites/:id/fix-prs', file: 'Fix-PRs' },
  { source: '/dashboard/sites/:id/history', file: 'History' },
  { source: '/dashboard/sites/:id/drift-guard', file: 'Drift-Guard' },
  { source: '/dashboard/sites/:id/ai-traffic', file: 'AI-Traffic' },
  { source: '/dashboard/sites/:id/settings', file: 'Site-Settings' },
  { source: '/dashboard/sites/new', file: 'Onboarding' },
  { source: '/dashboard/sites/:id', file: 'Site-Detail-Overview' },
  // /dashboard/sites is now the functional React page (removed from static copies).
  { source: '/dashboard/settings', file: 'Settings' },
  { source: '/dashboard/billing', file: 'Billing' },
  { source: '/dashboard/integrations', file: 'Integrations' },
  { source: '/dashboard/onboarding', file: 'Onboarding' },
  { source: '/dashboard', file: 'Overview' },
  // marketing
  { source: '/pricing', file: 'Pricing' },
  // /sign-in stays the functional React page — the static copy has a dead
  // GitHub button, which would break real login. Porcelain sign-in is wired
  // as its own scheduled task.
  { source: '/how-it-works', file: 'How-It-Works' },
  { source: '/changelog', file: 'Changelog' },
  { source: '/scan', file: 'Public-Audit' },
  { source: '/marketing-frame', file: 'Marketing-Frame' },
  { source: '/utility-states', file: 'Utility-States' },
];

const config: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: DESIGN.map(({ source, file }) => ({
        source,
        destination: `/design/${file}.html`,
      })),
      afterFiles: [],
      fallback: [],
    };
  },
};

export default config;
