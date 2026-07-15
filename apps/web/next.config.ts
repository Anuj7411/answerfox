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
  // /findings is now the functional React page (Phase 1).
  // /x-ray is now the functional React page (Phase 2).
  // /fix-prs is now the functional React page (Phase 2).
  // /history is now the functional React page (Phase 1).
  // /drift-guard is now the functional React page (Phase 2).
  // /ai-traffic is now the functional React page (Phase 2).
  // /dashboard/sites/:id/settings is now the functional React page.
  // Functional React pages (un-shadowed in Phase 0): /dashboard (Overview home),
  // /dashboard/sites/:id (Site Detail), /dashboard/sites/new (Add-site).
  // /dashboard/settings is now the functional React page.
  // /dashboard/billing is now the functional React page.
  { source: '/dashboard/integrations', file: 'Integrations' },
  { source: '/dashboard/onboarding', file: 'Onboarding' },
  // marketing
  { source: '/pricing', file: 'Pricing' },
  // /sign-in stays the functional React page — the static copy has a dead
  // GitHub button, which would break real login. Porcelain sign-in is wired
  // as its own scheduled task.
  { source: '/how-it-works', file: 'How-It-Works' },
  { source: '/changelog', file: 'Changelog' },
  // /scan stays the functional free public scanner (the landing's audit funnel).
  // The Public-Audit design becomes the Porcelain /scan as a scheduled task.
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
