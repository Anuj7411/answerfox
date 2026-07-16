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
`/pricing` · `/how-it-works` · `/changelog` · `/marketing-frame` · `/utility-states`.
(Everything else is functional/un-shadowed: Landing `/`, `/sign-in`, `/scan`,
`/dashboard/settings`, `/dashboard/billing`, `/dashboard/integrations`, `/dashboard/onboarding`,
Site-Settings `/dashboard/sites/:id/settings`, X-Ray, Drift Guard, AI Traffic, Fix-PRs.)

## DONE + TESTED THIS SESSION (all committed, pushed to `relaunch`)

- Landing `/` (Porcelain, af26628). Sign-in `/sign-in` — Porcelain redesign done (e97362f): slim
  nav + centered card (Continue-with-GitHub) + reassurance row + footer; GitHub OAuth flow
  (`sign-in-with-github.tsx` → `/auth/callback`) unchanged. `/scan` free scanner un-shadowed (539ec03).
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
- **X-Ray** `/dashboard/sites/:id/x-ray` — functional (482bffe).
  `components/dashboard/xray/xray-view.tsx` (client). Wires `runXrayAction` (single homepage):
  coverage% hero + crawler/browser word tiles + missing-text evidence + unavailable/failed states
  + honest "single page today" note. Design's 25-page master/detail + HTML dual-pane DEFERRED (engine
  returns no raw HTML / no fan-out). Locally hits `unavailable` (no Cloudflare creds — prod has them);
  browser-tested that state (Run executes, names both CF env vars, no console errors).
- **Drift Guard** `/dashboard/sites/:id/drift-guard` — functional (024f187). SERVER component
  (`drift-guard/page.tsx`, no client). Webhook engine (`check-drift`) has NO drift-events table, so
  design's watch-history timeline + open-regression hero DEFERRED. Shows real config-grounded status
  hero (armed/needs-repo/needs-verify from repoFullName+installationId+verified), how-it-fires
  (triggers+debounce+fix-PR binding), read-only score-drop alert → Settings, links to History/Findings,
  honest "no timeline yet" note. Browser-tested (needs-a-repo state).
- **AI Traffic** `/dashboard/sites/:id/ai-traffic` — functional (13da36c). SERVER component
  (`ai-traffic/page.tsx`). Wires `getAgentTrafficSummary`: total agent requests + AI share + per-agent
  breakdown bars (design hues, drill into existing `/traffic/:label`). 7d/30d/90d range toggle via
  `?days=` searchParam (real windowDays). Design's stacked-area time series OMITTED (summary has no
  per-day counts). Integration states (not-integrated → Mint on Settings / integrated-empty / has-data)
  + middleware wire-up snippet. Browser-tested (empty state + range toggle re-queries).
- **Fix-PRs** `/dashboard/sites/:id/fix-prs` — functional (39aa2ea). SERVER component
  (`fix-prs/page.tsx`). No PR-tracking table exists — shows AI-fix generation timeline from
  `listAiFixesForSite` (joins ai_fixes→findings→audits). Monthly quota progress bar (X of 90),
  segmented filter (All/Generated/Pending/Failed) via `?status=` searchParam, fix rows grouped by
  status with checkId + category + severity badges, hero card with repo link when connected, empty
  states for no-repo/no-fixes/filtered-empty, honest scope note about PR tracking landing later.
  Browser-tested (4 real generated fixes shown, filter to empty state works, no console errors).
- **Vercel deploy failure — REAL root cause found + FIXED (2026-07-16, verified GREEN).** The
  repeated "Failed production deployment" emails were NOT the turbo-outputs/routes-manifest thing
  (that theory was wrong; Vercel never ran `turbo`, so `2f75b5a`'s `apps/web/turbo.json` was
  irrelevant — harmless, now useful). **Actual cause (read from the Vercel build log):** the Vercel
  Build Command was `pnpm --filter @answerfox/web build`, which runs only `next build` and never
  compiles the workspace deps `@answerfox/core` + `@answerfox/audit` (they build to `dist/` via
  `tsc`). No `dist/` → `Module not found: Can't resolve '@answerfox/audit'` (from
  `lib/onboarding/onboard-site.ts`, `api/inngest/route.ts`) → build exits 1 in ~20-32s. Passed
  locally only because `dist/` existed on disk; passed on some deploys only via a lucky restored
  build cache — once it rotated, every deploy failed. **Fix:** changed the Vercel Build Command
  (dashboard → Build and Deployment, Root Directory `apps/web`) to
  `npx turbo run build --filter=@answerfox/web` — turbo's `dependsOn: ["^build"]` builds
  core → audit → web first. Proven cold locally (pnpm cmd FAILS with the exact error; turbo cmd
  SUCCEEDS 3/3) AND by a GREEN production redeploy of 6060a66 (2m45s, Ready, live on
  answerfox-web.vercel.app). Optional durability follow-up: commit `apps/web/vercel.json` with the
  same `buildCommand`. Do NOT re-fix via turbo.json/routes-manifest.
- **Impersonation dev bypass** (dc68abb): see below.
- **Account Settings** `/dashboard/settings` — functional (72e4bc0). Porcelain rewrite with 4 cards:
  Profile (editable display name via `updateDisplayName`, read-only email, avatar initial),
  GitHub Account (connected status from `resolveGithubLogin` auth metadata, security footer),
  Billing (plan label + manage link), Danger Zone (delete account with typed-confirm "delete my
  account" modal via `deleteAccountAction` → `deleteProfileForUser` cascade). Cards without backend
  (Appearance, Notifications, GitHub App, API Tokens) omitted per standing rule. Browser-tested
  (200, all cards render, no console errors).
- **Billing** `/dashboard/billing` — functional (6060a66). Porcelain: plan summary (spend + $29/repo),
  per-site plans table (plan badge + free-loop status + Polar checkout upgrade links), honest empty
  receipts. Deployed green.
- **Integrations** `/dashboard/integrations` — functional (1b161a6). Porcelain GitHub App view:
  resolves the user's installations (personal via `getActiveInstallationForLogin`(login) + any their
  sites' `installationId`s), per-install card (account/type/connected/installed-date), repos granted
  (`listActiveRepositoriesForInstallation` cache ∪ linked-site repos) each mapped to its site or a
  "Link a site" link, App permissions, Manage-on-GitHub. Honest no-installation empty state + install
  CTA (slug `answerfox`). New queries: `getInstallationByInstallationId`,
  `listActiveRepositoriesForInstallation`. Browser-tested (200, empty state renders); deployed green.
- **Onboarding** `/dashboard/onboarding` — functional (384061f). Porcelain 4-step wizard
  (`components/dashboard/onboarding/onboarding-flow.tsx`, client): Install (App CTA + permission
  rationale, shown on no-github/no-installation) → Pick repo (filterable list from
  `listConnectableReposAction`, + required site URL/name) → running → Done (real score ring/band +
  links) via `onboardRepoAction` (create+link+audit in one). No faked progress/findings.
  Browser-tested (auto-loads → Install step renders); deployed green.

Functional React page files present: `/dashboard`, `/dashboard/sites`, `/dashboard/sites/[siteId]`,
`.../findings`, `.../history`, `.../settings`, `.../x-ray`, `.../drift-guard`, `.../ai-traffic`,
`.../fix-prs`, `/dashboard/sites/new`, `/dashboard/settings`, `/dashboard/billing`,
`/dashboard/integrations`, `/dashboard/onboarding`.

## PRIORITIZED PLAN (remaining, in order)

7. ~~Billing~~ DONE (6060a66). 8. ~~Integrations~~ DONE (1b161a6). 9. ~~Onboarding~~ DONE (384061f)
   — `/dashboard/onboarding` Porcelain 4-step wizard (`components/dashboard/onboarding/onboarding-flow.tsx`)
   wiring `listConnectableReposAction`/`onboardRepoAction`. (Add-site `/dashboard/sites/new` still
   old-Tailwind — optional Porcelain-ify remains.)
10. ~~Sign-In Porcelain redesign~~ DONE (e97362f). **Marketing pages — NEXT:** Pricing ($29, design
    shows stale $9), How-It-Works, Changelog, Public-Audit (Porcelain `/scan`). These are
    still-shadowed static copies in the DESIGN array — build + un-shadow each.
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
