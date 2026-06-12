---
'@answerfox/audit': minor
'@answerfox/cli': patch
---

v0.5.0 phase 1 — Cloudflare Agent Readiness Score coverage parity push.

Adds 2 new checks (sitemap.xml at A11, llms.txt at G7), bringing the active
audit framework from 39 to 41 checks (of 58 planned by v0.6.0).

New checks
- **A11 sitemap.xml**: detects sitemap.xml at the origin root, accepts both
  urlset and sitemapindex shapes. 2 points, medium severity. Matches the
  Cloudflare "Discoverability" category.
- **G7 llms.txt**: detects llms.txt at the origin root, requires markdown
  shape with an H1 and at least one link. 5 points, medium severity. Adopted
  by ~10% of all sites, ~40% of developer-facing SaaS (Anthropic, Stripe,
  Vercel, Cloudflare).

Framework reweight
- G category total moves from 30 to 35 of 100 points (G7 added at 5 pts;
  G1-G6 unchanged).
- A classic-perfect fixture without AR manifests now scores 65 (was 70 in
  v0.4.x reweight, was 100 in v0.3.x). The wedge gets sharper with every
  AR check added.

New helper
- `fetchOriginPath(url, path)` for root-relative artifact fetches, mirroring
  the existing `fetchWellKnown` helper. Used by A11 and G7.

Tests
- 13 new test cases (7 for A11, 6 for G7) covering pass/fail/warn/network
  error/empty body/wrong shape branches per check. All 204 tests pass.
