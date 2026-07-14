# Session Handoff — 2026-07-14

Read this first when resuming. Everything below is ground truth as of 2026-07-14.
Source of truth = git (all work committed + pushed to branch `relaunch`) + the project
memory (`project_answerfox-v1-v2-direction.md`) + this file. Do not trust any summary
over the actual files/commits.

## RESUME HERE (the one active task)

Migrating the whole app to the locked **Porcelain** design system, using a delivered
design set as the source of truth. **Phase 1 done. Phase 2 in progress = wire the page
contents one page at a time.** DONE so far: page 1 Site Detail Overview (`be6d7c7`) and
page 2 dashboard-home Overview (`6e46a52`). Next: Sites list, then Findings, X-Ray,
Fix-PRs, History, Drift-Guard, AI-Traffic, Settings.

**Dashboard home (page 2) — what shipped + a bug it fixed:** `(dashboard)/dashboard/page.tsx`
rebuilt on the `Overview.dc.html` design with real data — animated portfolio-readiness ring
(avg of site scores), needs-attention list (weakest bands first), site-card grid (score,
band, agent-readiness n/8, verification, PR mode), and a bottom row with the real AI-traffic
rollup + recent audits. New client comp `site-overview/portfolio-ring.tsx`; `.afx-hero/
-sites/-bottom/-attn-row` responsive rules appended to `globals.css`. This fixed a Phase 1
regression: the old home rendered `.dvp`-scoped CSS but the new shell dropped the `.dvp`
wrapper, so it fell back to raw unstyled HTML. NOTE: the old `.dvp .*` CSS in globals.css is
now fully dead (only that page used it) and can be pruned later; `home-ai-traffic-tile.tsx`
and `score-trend-chart.tsx` are now unimported orphans.

**Site Detail Overview — what shipped (page 1):** new Porcelain summary at the top of
`sites/[siteId]/page.tsx` — header (status + repo), segmented schedule + Audit now (wired
to real actions), animated score card (real score, band, delta, 7-run sparkline, Agent
Readiness n/8), fix-delivery card (repo/installation state, no fake stack), pass/fail/warn/
skip tiles, X-Ray card (wired to the real action; dual-pane HTML split deferred to the
X-Ray page since the action doesn't return both HTML blobs yet), top-findings preview +
latest-audit rail. New shared code in `components/dashboard/site-overview/` (porcelain.ts
tokens, animated-score, schedule-audit-controls, xray-overview-card). afxUp keyframe +
`.afx-bento`/`.afx-tiles` responsive rules appended to `globals.css`.

**Interim debt to unwind as later pages ship:** the deep panels (full findings + AI fix,
agent-answer, AI-traffic + analytics, alert threshold, billing, site management) are still
rendered BELOW the new summary on the Overview page so the fix loop stays reachable. Lift
each onto its own tab page (Findings / AI Traffic / Settings) when built, then delete it
from `sites/[siteId]/page.tsx`.

**Per-site nav still TODO:** deferred from page 1 (would 404 against tab routes that don't
exist yet). Add it to the sidebar in `(dashboard)/layout.tsx` as those tab pages land — the
parent layout owns the sidebar, so the cleanest path is a client sidebar reading usePathname
(a nested `sites/[siteId]/layout.tsx` renders inside the content column, not the sidebar).

- **Design files:** re-extract the zip at `C:\Users\ojhaa\Downloads\AnswerFox Site Detail Overview.zip`
  (the previous session's scratchpad extraction is gone; the Downloads zip is stable).
  It holds ~21 `.dc.html` files + `support.js`. Format: standalone HTML with an `<x-dc>`
  wrapper, **inline styles**, and a small React-style interaction script per page. Ignore
  `support.js` (design-canvas runtime) — translate the visual HTML/CSS to React.
- **FIDELITY RULE (user feedback 2026-07-14):** COPY each `.dc.html` file exactly — same
  layout, exact hex, icons, sparklines, pills, copy structure. Do NOT reinterpret or drop
  visual elements. Wire real data into the design's exact shell. See memory
  `feedback_design_fidelity.md`. Pages 1-2 were first built too loosely and corrected.
- **Porcelain palette (CORRECTED to the design files' exact hex, in `porcelain.ts` `PC`):**
  bg `#FAFAF8`, sidebar `#FFFFFF` (white, icon nav), card `#FFFFFF`, ink `#1C1C19`,
  muted `#6B6B65`, dim `#9C9C95`, dim2 `#8C8C85`, faint `#DEDDD7`, line `#EAE9E5`,
  hover `#F5F5F2`, blaze `#F34504`, blaze-deep `#B23A08`, green `#15803D`/`#16A34A`
  (wash `#E7F6EC`), amber `#B45309` (wash `#FBEFD6`), red `#DC2626` (wash `#FBE9E9`).
  The earlier `#ECEEEB`/`#14150F` values were wrong (drift from the Site-Detail file);
  the Overview file's white-sidebar palette is canonical. Fonts: Archivo, JetBrains Mono.
- **Shell (`(dashboard)/layout.tsx` + `porcelain-nav.tsx`) now matches Overview.dc.html:**
  white sidebar, switcher, icon `WorkspaceNav` (Overview/Sites/Billing/Integrations/Settings,
  active = inset orange left-bar), foot, top-bar `Breadcrumb` + plan pill. Billing +
  Integrations have Porcelain placeholder pages so the nav resolves (real designs pending).
- **STILL TODO (strict re-check):** Site Detail (page 1) content vs its file — it inherits the
  corrected shell/palette now, but re-verify blocks against `Site Detail Overview.dc.html`.
  Metrics with no real source (per-site "N PRs"/drift, ring "open fix-PRs/drift alert",
  "watching N pages") currently use real proxies; wire real counts if/when tracked.
- **Font gotcha:** "Archivo Expanded" is NOT on next/font, so it's aliased to Archivo in
  globals. In components, reference fonts as `var(--font-archivo)` / `var(--font-jetbrains)`,
  NOT the literal family names the .dc.html uses.
- **Approach that works:** translate each design to a React page/components with **inline
  styles matching the design hex** (fastest faithful path), then wire real data from the
  existing queries/actions. Stress-test each page before committing.
- **Per-site nav:** the new shell only has the workspace nav today. The per-site nav
  (Overview / Findings / X-Ray / Fix-PRs / History / Drift Guard / AI Traffic / Settings)
  should be added via a **site-level layout** at
  `apps/web/src/app/(dashboard)/dashboard/sites/[siteId]/layout.tsx` when wiring site pages.

### Page migration order (design filename -> app route)
1. Site Detail Overview -> `(dashboard)/dashboard/sites/[siteId]/page.tsx` (has the animated
   score, stack card, pass/fail/warn/skip tiles, draggable X-Ray split, top findings, latest-audit rail)
2. Overview (dashboard home), Sites, Findings, X-Ray, Fix-PRs, History, Drift-Guard, AI-Traffic,
   Settings, Site-Settings
3. Billing, Integrations, Onboarding (these routes are new; add them)
4. Marketing: Pricing, Public-Audit, Sign-In, How-It-Works, Changelog, Marketing-Frame
   (LANDING PAGE DONE, commit `af26628`: ported `Downloads/answerfox-landing.html` 1:1 to
   the root `/` route — `(marketing)/landing.css` + `landing-html.ts` + `landing-scripts.tsx`,
   replacing the old Bloom landing. Source is a standalone animated HTML with embedded fonts
   (skipped; app uses next/font). `<html suppressHydrationWarning>` added for the pre-hydration
   `.js` bootstrap. NOTE: source design HTML deliverables now arrive in Downloads, e.g.
   `answerfox-landing.html` — check there when the user says a page is "finished building".)
5. Utility-States

## What's already DONE this session (all on `relaunch`, pushed, deploying)

Features (every commit stress-gated: tsc + vitest + next build; 253 tests pass):
- All 3 orphaned engines WIRED: Agent Answer Simulation (dashboard panel + persisted trend),
  Onboarding repo-picker (install -> audited site), X-Ray (Cloudflare Browser Rendering).
- Free public scanner `/scan` (SSRF-guarded, Gemini-backed), shareable results `/scan/[id]`
  with a dynamic OG social score-card, scanner linked from the landing hero + nav.
- Answerability trend over time (persisted per run).
- Positioning reframed off "AI-SEO toolkit" to the AI-readiness/fix-as-code line.
- Polar payment rail: `/api/checkout` + `/api/webhook/polar` + per-site $9/mo upgrade CTA
  (order.paid -> markSitePaid, cancel/revoke -> markSiteFree, site_id via checkout metadata).
  CODE DONE; needs Polar env to go live (see Deferred).
- Porcelain design **Phase 1** (commit `d9e1af5`): Archivo + JetBrains Mono fonts, Porcelain
  tokens in `globals.css`, new dashboard shell `(dashboard)/layout.tsx` + client
  `components/dashboard/porcelain-nav.tsx`.

Migrations applied by the user in Supabase (project `eicvswhtqinbxcmkgail`):
0009 agent_answer_reports, 0010 public_scans, 0011 xray_cache. (Hand-written idempotent SQL
in `apps/web/drizzle/`, RLS enabled, app writes via service role.)

Deployment + prod-config DONE:
- Vercel project `answerfox-web` (Hobby), root dir `apps/web`, production branch = `relaunch`,
  live at **answerfox-web.vercel.app** (public, verified serving new code). Cron changed to
  daily (`5 0 * * *`) to fit Hobby.
- Vercel env set: all Supabase (5), `GEMINI_API_KEY`, GitHub App (`GITHUB_APP_ID`,
  `GITHUB_APP_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`), `NEXT_PUBLIC_GITHUB_APP_SLUG=answerfox`,
  `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`.
  (`INNGEST_DEV` deleted — its presence had forced dev mode and 500'd `/api/inngest`.)
- Supabase Auth: Site URL + Redirect URLs set to the Vercel domain (sign-in works in prod).
- GitHub App (slug `answerfox`, App ID 4216145): webhook -> `/api/github/webhook`.
- Cloudflare Browser Rendering token added (X-Ray live).
- Inngest Cloud connected + app synced (3 functions: open-fix-pr, post-proof, check-drift).

## Deferred / TODO (not done)
- Design Phase 2: the ~20 remaining page contents (the active task above).
- Polar payment GO-LIVE: create a Polar account + product ($9/mo), add `POLAR_ACCESS_TOKEN`,
  `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_ID` (+ optional `POLAR_SERVER`, `POLAR_SUCCESS_URL`)
  to Vercel, and point a Polar webhook at `/api/webhook/polar`. Code is done.
- Unify the two fix generators (dashboard artifact vs pipeline validated-edit) — a UX decision.
- X-Ray sitemap money-page fan-out (currently homepage-only).
- Custom domain; eventually merge `relaunch` -> `main` (branch protection: PR + green CI).
- Verify sign-in end-to-end + install the GitHub App on a repo to exercise the fix-PR loop
  (assistant can't do interactive OAuth / installs).

## Conventions (keep these)
- Stress gate after each unit, must stay green:
  `cd apps/web && npx tsc --noEmit && npx vitest run && npx next build`.
- Conventional commits; trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
  Push to `relaunch` auto-deploys to Vercel production.
- Paths with `[siteId]` / `(dashboard)` need `GIT_LITERAL_PATHSPECS=1 git add ...`.
- Voice: zero em-dashes, no AI-tells (delve/leverage/seamless/robust/comprehensive), real numbers.
- Supabase migrations: hand-written idempotent SQL committed to `apps/web/drizzle/`, delivered
  INLINE to the user to run (the connected Supabase MCP is a different org and cannot apply to
  `eicvswhtqinbxcmkgail`). SQL Editor: https://supabase.com/dashboard/project/eicvswhtqinbxcmkgail/sql/new
- The claude-mem Read hook dedups files to line 1; when it blocks a needed read, use Bash `cat`.

## Key files / docs
- Strategy + roadmap: `docs/internal/ANSWERFOX_V1_GODLEVEL_AND_V2_2026-07-13.md`,
  `docs/internal/ANSWERFOX_FEATURE_ROADMAP_2026-07-13.md`.
- Project memory (auto-loaded): `project_answerfox-v1-v2-direction.md` (locked v1/v2 direction,
  what's built, prod-config).
- New shell: `apps/web/src/app/(dashboard)/layout.tsx`, `components/dashboard/porcelain-nav.tsx`.
- Fonts/tokens: `apps/web/src/app/layout.tsx`, `apps/web/src/app/globals.css`.
