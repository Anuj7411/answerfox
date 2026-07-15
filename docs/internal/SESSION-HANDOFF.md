# Session Handoff — 2026-07-15 (FUNCTIONAL BUILD)

Read this first when resuming. Ground truth = git (branch `relaunch`, all work committed +
pushed), the auto-loaded project memory, and this file. Do not trust any auto-summary over the
actual files/commits.

## THE ONE ACTIVE TASK

Convert the app from **static design copies → fully-functional Porcelain React pages**, one page
at a time, per the prioritized plan below. Every page: match its `.dc.html` design faithfully,
wire the real backend, **stress-gate AND browser-test**, remove that page's static rewrite, commit.
The backend is ~90% done — this is almost entirely frontend (surfacing existing engines/actions).

Standing user instructions (memory: `feedback_autonomous-build-and-test`):
- **Build autonomously — do NOT ask for go-ahead each page/phase.** Keep going.
- **ALWAYS browser-test after each build**, not just the stress gate.

## HOW THE STATIC-COPY SYSTEM WORKS (critical)

- Every design page is served verbatim from `apps/web/public/design/*.html` (+ `support.js`
  runtime), mapped onto app routes via `beforeFiles` rewrites in `apps/web/next.config.ts`.
- To make a page functional: build the React page, then **delete its entry from the `DESIGN`
  array in `next.config.ts`** (un-shadow). The functional page then renders through the shell.
- Only `.dc.html` edit was a white-with-lines background swap (`#afx-bg-swap` style) + absolute
  `/design/support.js` src. Design pages have STATIC nav (`href="#"`), demo content.

### STILL-SHADOWED routes (static copies — build these) — from `next.config.ts` DESIGN array:
`/dashboard/sites/:id/x-ray` · `/fix-prs` · `/drift-guard` · `/ai-traffic` ·
`/dashboard/settings` · `/dashboard/billing` · `/dashboard/integrations` ·
`/dashboard/onboarding` · `/pricing` · `/how-it-works` · `/changelog` · `/marketing-frame` ·
`/utility-states`. (Landing `/`, `/sign-in`, `/scan`, Site-Settings `/dashboard/sites/:id/settings`
are NOT rewritten = functional.)

## DONE + TESTED THIS SESSION (all committed, pushed to `relaunch`)

- Landing `/` (Porcelain, af26628). Sign-in `/sign-in` FUNCTIONAL but OLD Bloom design (Porcelain
  redesign pending). `/scan` free scanner un-shadowed (539ec03).
- **Sites list** `/dashboard/sites` — functional (707b9b1). `components/dashboard/sites-table.tsx`.
- **Phase 0** (6333769): per-site nav + functional site switcher in
  `components/dashboard/site-sidebar.tsx` (`SiteNav`, `SiteSwitcher`), wired into
  `(dashboard)/layout.tsx`. Un-shadowed Overview home (`/dashboard`), Site Detail
  (`/dashboard/sites/:id`), Add-site (`/dashboard/sites/new`, functional but old-styled).
- **Findings** `/findings` — functional (c8135f4). `components/dashboard/findings-view.tsx`
  (category groups, filter chips + search, per-finding Generate-fix via `generateAIFixAction`,
  Re-run via `runAuditAction`).
- **History** `/history` — functional (88c9099). Server component: readiness line chart +
  all-runs table + Compare links (to existing `/compare/:from/:to`) + Export-latest.
- **Site Settings** `/dashboard/sites/:id/settings` — functional (9833c9c).
  `components/dashboard/site-settings/site-settings-view.tsx` (client). Cards: Site details
  (rename), Audit schedule, Pull requests (read-only linked repo), Score-drop alert
  (updateAlertThreshold), Agent traffic (rotateIngestToken, shown-once), Ownership
  (initiate/check verification, per-method rows + meta snippet), Danger zone (delete via native
  `<dialog>` typed-confirm). Un-shadowed + trimmed AlertThresholdCard/SiteManagementCard off Site
  Detail. Design controls with no backend (env, per-PR config, drift triggers, retention) omitted,
  not faked. Browser-tested (200, no console errors, dirty-Save + delete dialog work).
- **Impersonation dev bypass** (dc68abb): see below.

Functional React page files present: `/dashboard`, `/dashboard/sites`, `/dashboard/sites/[siteId]`,
`.../findings`, `.../history`, `.../settings`, `/dashboard/sites/new`, `/dashboard/settings`
(minimal display-name).

## PRIORITIZED PLAN (remaining, in order)

1. **X-Ray** `/x-ray` — NEXT. `runXrayAction` exists; needs `CLOUDFLARE_ACCOUNT_ID`+`CLOUDFLARE_API_TOKEN`
   or returns "unavailable" (handle that state). `XrayOverviewCard` exists on Site Detail.
2. **Drift Guard** `/drift-guard` — `run-drift`/`check-drift` engines exist; likely a status/empty
   page (no dedicated drift-events table — verify).
3. **AI Traffic** `/ai-traffic` — `getAgentTrafficSummary` (agent-visits) exists; components
   `AiTrafficTile`, `AnalyticsIntegrationCard` orphaned. Wire.
4. **Fix-PRs** `/fix-prs` — THIN BACKEND: no PR-tracking table (only `ai_fixes` = fix attempts).
   Do a live GitHub PR list via the App (needs repo+installation linked; none in test data → mostly
   a "connect a repo" state) + optionally list `ai_fixes` generated fixes.
6. **Account Settings** `/dashboard/settings` — expand the display-name page to Porcelain
   (`updateDisplayName` in settings/actions.ts) + delete-account.
7. **Billing** `/dashboard/billing` — **$29/mo** (design shows stale $9 — reconcile). Polar
   checkout `/api/checkout` + `/api/webhook/polar` exist; add plan/upgrade/portal/cancel UI.
8. **Integrations** `/dashboard/integrations` — GitHub App status + ingest-token minting.
9. **Onboarding** `/dashboard/onboarding` (+ Porcelain-ify Add-site) — `onboardRepoAction`,
   `listConnectableReposAction`.
10. **Sign-In** Porcelain redesign (keep GitHub OAuth wired). Then marketing: Pricing ($29),
    How-It-Works, Changelog, Public-Audit(/scan Porcelain).
11. Net-new (section 3): badge picker modal, evidence inspector, AI-fix quota UI, Pro upsell
    states, weekly email digest, public leaderboard, Google OAuth, CSV export, annotations.
12. **v2 SKIPPED**: team/org+SSO, API keys, citation tracking, accessibility pillar, MCP/commerce
    scaffolding, Slack, Studio $99, outcome-weighted score.

## LOCKED DECISIONS (memory: `project_answerfox-confirmed-build-decisions`)

- **Pricing $29/mo** (design pages show stale **$9** — use $29, flag design). Model conflict
  ($29/account vs $9/repo) unresolved — confirm when building Billing.
- **Positioning: current only** — "Dependabot for agent-readiness / fix-as-code". Old AEO/SEO
  framing retired.
- **Audit = shipped 53-check / 0-100 / bands + Agent Readiness n/8.** (AUDIT-FRAMEWORK.md says 50
  A-F but CODE=53 is authoritative. Latest doc GODLEVEL_AND_V2 proposes an outcome-weighted score
  = v2, SKIPPED.)

## TESTING: impersonation dev bypass (how to browser-test authed pages)

- `DEV_AUTH_BYPASS=true` in `apps/web/.env.local` (already set; local-only, gitignored). Code:
  `lib/auth/dev-bypass.ts` (`devBypassAllowed`, triple-gated: flag AND not Vercel AND not prod);
  `server-client.ts` overrides `auth.getUser` to impersonate the first `profiles` row (real data
  via DATABASE_URL); `middleware-client.ts` returns a stub user so routes don't redirect. NEVER
  runs on a deploy.
- **Test site id (real, owned by impersonated profile): `faf47921-3914-45a9-968a-3e5edcfe50af`**
  (has audit history + findings). Others: 035a0590…, 22058f64…, 32f5704c….
- Auth reality: anon key VALID (GitHub OAuth works in prod); `SUPABASE_SERVICE_ROLE_KEY` STALE
  ("Invalid API key" — nothing in app uses it, app DB = DATABASE_URL); email/password auth
  intentionally DISABLED by user (re-enable when built).

## WORKFLOW GOTCHAS (learned the hard way)

- **Do NOT run `next build` while `next dev` is live** → corrupts `.next` (500
  `Cannot find module './vendor-chunks/...'`). Sequence: **stop dev → `rm -rf apps/web/.next` →
  gate (`npx tsc --noEmit && npx biome check && npx vitest run && npx next build`) → start dev
  clean → browser-test.**
- **Client-module (`'use client'`) functions can't be CALLED from a server component** (only
  rendered/props). Bug this session: `sortFindings` exported from findings-view (client) + called
  in the server page → 500. Keep server helpers in the server file.
- `preview_screenshot` is flaky here (times out) — verify renders via **curl** (grep markers +
  check no "Application error") and lightweight `preview_eval`; both reliable.
- Biome flags bare `aria-hidden` on `<svg>` → use `aria-hidden="true"`. Biome not in the stress
  gate but run `npx biome check --write <files>` per page.
- Paths with `[siteId]`/`(dashboard)` need `GIT_LITERAL_PATHSPECS=1 git add ...`.
- Regressions found+fixed: `/sign-in` and `/scan` had been shadowed by static copies (dead
  buttons). Watch for other functional routes being shadowed.

## DESIGN / CONVENTIONS

- Porcelain tokens: `components/dashboard/site-overview/porcelain.ts` (`PC`: sidebar/card #FFFFFF,
  bg #FAFAF8, ink #1C1C19, muted #6B6B65, dim #9C9C95, line #EAE9E5, hover #F5F5F2, blaze #F34504,
  green #15803D, amber #B45309, red #DC2626 + washes). `DISPLAY`/`BODY`=Archivo, `MONO`=JetBrains.
  Fonts via next/font vars (see globals.css); reference `var(--font-archivo)` not literal names.
- **Fidelity rule** (memory `feedback_design_fidelity`): copy each `.dc.html` faithfully
  (colors/icons/layout), wire real data INTO the exact structure; don't reinterpret.
- Design source files: re-extract `C:\Users\ojhaa\Downloads\AnswerFox Site Detail Overview.zip`
  to the scratchpad if gone (21 `.dc.html`); landing = `C:\Users\ojhaa\Downloads\answerfox-landing.html`.
  Served copies live in `apps/web/public/design/`.
- Reusable patterns: `sites-table.tsx` (per-row `useActionState` for runAuditAction),
  `findings-view.tsx` (`ReRunButton`, per-row fix), `bandTone()`, inline `relativeTime()`.
  `AiFixPanel` exists (old-styled). Voice: zero em-dashes; real numbers.
- Commits: conventional, trailer `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
  Push to `relaunch` auto-deploys to Vercel (answerfox-web.vercel.app). Deferred: merge relaunch→main.

## PROD CONFIG (unchanged, working)
Vercel `answerfox-web` (root apps/web, prod branch `relaunch`). Supabase `eicvswhtqinbxcmkgail`
(migrations 0009/0010/0011 applied). GitHub App slug `answerfox`. Inngest (open-fix-pr/post-proof/
check-drift). Cloudflare token for X-Ray. Polar rail code-done (needs env to go live).
