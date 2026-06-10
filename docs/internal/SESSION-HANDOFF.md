# Session Handoff — 2026-06-08

**This is the latest handoff. Read this first.** Previous handoff (2026-06-06) text retained below as historical context.

---

## 60-Second Recap (2026-06-08, Monday evening IST)

**Where we are in one paragraph:** v0.2.2 of `@answerfox/cli` is shipping on npm with the new `af` alias. Validation sprint distribution is done: 20 cold emails sent Sat night, 3 LinkedIn DMs sent Sun (Gary Meehan/Vishnu Sankar/David Dias), Joost de Valk pending bare-connect, r/SideProject post auto-filtered with modmail pending, Indie Hackers + Show HN both blocked behind new-account gates. **The remaining signal sources are email replies + LinkedIn acceptances + r/SideProject mod decision.** Tuesday morning is the tally + decision day.

**The strategic doc set:** This handoff (60-sec recap) + `ROADMAP.md` (6-week + 2027 bets) + `TECH-STRATEGY.md` (stack decisions + multi-language research) + `SPRINT-STATUS.md` (current sprint snapshot). Read in that order if resuming after a break.

## What's next, locked in writing

- **Today/tomorrow**: ship v0.3.0 Agent Readiness DETECTION (6 new audit checks G1-G6 for MCP Server Card, agent-card.json, RFC 9727, agent-permissions.json, OAuth discovery, WebMCP). Update apps/web landing copy in same PR.
- **Week 2 (Jun 15-21)**: v0.3.1 scaffolding (`af add agent-card` etc) + apps/web Day 4 (Supabase + Drizzle schema)
- **Week 3 (Jun 22-28)**: apps/web Day 5 (Auth) + dashboard MVP shell
- **Week 4-6 (Jun 29 - Jul 19)**: continuous audit + diffs + alerts → Stripe IF paid signal OR Agent-Preference Analytics MVP if not → real Product Hunt launch with `PH-LAUNCH-PACK.md`
- **Q4 2026**: Agent-Preference Analytics depth (Google Analytics for AI agents)
- **2027 bets**: MCP Tool Selection Optimization (Q1-Q2), Agent Trust Layer (Q2-Q3), AI-Aware Content Negotiation (Q2-Q3). All documented in `ROADMAP.md`.

## Stack decisions (locked, see TECH-STRATEGY.md for the why)

- **v0.3.0 to v0.6.0**: TypeScript everywhere. Ship speed wins pre-validation.
- **v0.5.0**: Bun compatibility (`bun add -g @answerfox/cli`)
- **v0.6.0**: tsgo (Go-based tsc) for type checking when production-ready
- **v0.7.0 (Q4 2026)**: First Rust hot path (HTML parsing via `lol-html` or `scraper`, exposed via WASM or N-API). Same shape as esbuild/swc/biome/bun.
- **v1.0 (Q2 2027)**: Native `af` binary built from Rust for users who don't want Node. Distributed via GitHub releases. npm package stays for JS ecosystem.

The principle: **rewrite WHAT'S SLOW, not WHAT EXISTS.** Hot paths get Rust eventually, public API stays TS.

## Files anyone resuming this project should know about

Public:
- `README.md` (repo front page, v0.2.2)
- `docs/internal/AUDIT-FRAMEWORK.md` (the 50-check spec)

Internal (gitignored):
- `docs/internal/SESSION-HANDOFF.md` (this file)
- `docs/internal/ROADMAP.md` (6-week + 2027 bets)
- `docs/internal/TECH-STRATEGY.md` (stack decisions + multi-language research with sources)
- `docs/internal/SPRINT-STATUS.md` (validation sprint state)
- `docs/internal/PRODUCTS-INVENTORY.md` (28 of Anuj's projects with metadata)
- `docs/internal/COLD-OUTREACH-TARGETS.md` (46 verified solo indie devs)
- `docs/internal/COLD-MAIL-DRAFTS.md` (20 emails, all sent)
- `docs/internal/VALIDATION-SPRINT-POSTS.md` (sprint distribution copy)
- `docs/internal/PH-LAUNCH-PACK.md` (Product Hunt playbook for AFTER v0.3.0)
- `docs/internal/IDEA-LEAN-RESEARCH-TOOL.md` (parked idea)

---

## Previous handoff: 2026-06-06

**Purpose:** Read this fully before doing anything. It is the source of truth for resuming Answerfox in a new session. It supersedes the 2026-05-29 handoff (that one predates the rename to Answerfox and the SaaS build).

---

## 60-Second Recap

The project is **Answerfox** (renamed this session from "Answerable"). Open-source AI-SEO toolkit (SEO + AEO + GEO) that lives in your codebase and ships fixes as code. OSS packages are live on npm under **`@answerfox/*` at 0.2.0**. The SaaS app (`apps/web`) has Week 1 Days 1-3 built and merged. We also ran deep research that produced a forward-looking wedge (Agent Readiness), and an office-hours session that set the next priority: validate paid demand before building more.

**The one pending action from last session:** merge **PR #44** (a "Version Packages" PR) to publish **`@answerfox/cli@0.2.1`** (the CLI bug fixes). Then the README's `npx @answerfox/cli` command gives the fixed tool. See "Immediate next steps."

---

## The Rename: Answerable -> Answerfox (DONE)

Every namespace for "Answerable" was taken (.com/.io/.dev/.tech, the clean npm scope, the GitHub org) and a funded company already trades as "Answerable", so we renamed.

- **Name:** Answerfox. **Domain:** `answerfox.dev` (NOT yet purchased — grab via GitHub Student Pack, free year; `.dev` chosen over `.app`).
- **GitHub repo:** renamed to **`Anuj7411/answerfox`** (old URL redirects). Repo lives under the personal account; an `answerfox` GitHub org is available if ever wanted.
- **npm scope:** migrated `@answerable-kit/*` -> `@answerfox/*`, published at 0.2.0 via OIDC Trusted Publishing. Old `@answerable-kit/*` and the `@answerfox` 0.1.x bootstrap versions are **deprecated** with pointers.
- Brand renamed across the 7 foundation docs + prototype (PR #34) and all package code (PR #35). The English adjective "answerable" was deliberately preserved (e.g. "makes any site answerable by AI").

---

## What Is Built / Live

### OSS packages (npm, scope `@answerfox/*`, all 0.2.0)
`audit`, `cli`, `core`, `schemas`, `metadata`, `sitemap`, `templates`. Released via Changesets + **OIDC Trusted Publishing (no token)**, configured on all 7 packages by the user. Release workflow: `.github/workflows/release.yml` (guard is `Anuj7411/answerfox`; runs on push to main; `version-packages` script auto-runs `pnpm format` so changeset output stays Biome-clean).

### CLI status (verified this session)
- `audit <url>` and `explain <id>` are stable and CI-friendly (no TTY needed). `init`/`add` are interactive (need a real terminal + a Next.js project; `add` guards against non-Next.js dirs and prints a TTY error in non-interactive contexts).
- **33 of 50 audit checks active.** Output is a single 0-100 score + band (Critical/Weak/Average/Strong/Excellent), checks grouped A-G. There is **NO** separate SEO/AEO/GEO three-score in the CLI; do not claim one.
- `examples/basic-nextjs` audits to **79/100** out of the box (verified live, NOT the 90+ once claimed).
- **Bugs fixed this session (PR #43):** `--version` now reads package.json (was hardcoded `0.0.0`); `audit` now sets `process.exitCode` and exits naturally instead of `process.exit()`, which was causing a **libuv assertion crash on Windows** (UV_HANDLE_CLOSING) after the report. Exit codes: 0 success, 1 CI threshold not met, 2 audit failed. A changeset for these is in PR #44 (pending publish as 0.2.1).
- **Known minor gaps (not blockers):** check `docsUrl`s point to `answerfox.dev/docs/...` which is not deployed (dead links; `answerfox explain <id>` gives the doc offline). Docs site (Nextra) still does not build (known, decoupled).

### apps/web (the SaaS, Next.js 15) — Week 1 Days 1-3 DONE
- **Day 1 (PR #40):** scaffolded `apps/web` as `@answerfox/web`, plain Next.js 15 App Router for Vercel, Tailwind 4 CSS-first `@theme` with the locked Slate tokens, self-hosted Geist/Geist Mono/Inter via next/font, `data-page` ember switching.
- **Day 2 (PR #41):** ported the v3.4 bloom engine to typed ESM (`src/components/bloom/engine.ts`) + SSR-safe `<Bloom/>` wrapper + 15 unit tests for the pure math.
- **Day 3 (PR #42):** ported the landing into the `(marketing)` route; design-system primitives moved into `globals.css` (aliased to the `@theme` tokens); responsive layout. Dropped the prototype's fake "500+ stars / 50K downloads" counters (real-numbers rule).
- Prototype polish landed earlier (PR #33).

### gstack (our dev methodology) — established
gstack upgraded **1.40 -> 1.55**. `CLAUDE.md` created (PR #38) with voice rules, decision style, working conventions, the gstack dev loop, and skill routing. Proactive suggestions on. **gbrain skipped** (Mac-oriented, we are on Windows). Use the loop: plan-eng-review -> build -> /review -> /qa -> /ship -> /land-and-deploy -> /canary; /investigate for bugs; /context-save + /context-restore for continuity.

---

## STACK DECISION CHANGE (deviates from TRD-V1.md)

The TRD said Cloudflare-only + Neon + Auth.js + R2/KV. We changed it this session:
- **Hosting: Vercel first, migrate to Cloudflare later by traffic.** Day 1 is plain Next.js (no OpenNext adapter yet; that lands at the Cloudflare migration). Eng review (plan-eng-review) confirmed this.
- **Backend: Supabase** (Postgres + Auth + Storage) instead of Neon + Auth.js + R2. Drizzle for schema-as-code. TRD `users` table becomes `public.profiles` keyed to `auth.users`; the rest of the schema carries over.
- **Portability rule:** no Vercel-proprietary data services; scheduled jobs via Supabase, so the later Cloudflare move is a config change.

---

## Strategic verdict (office-hours) — THE PRIORITY

There are **no real users yet** (the OSS is published but unproven; user confirmed this explicitly). Office-hours verdict: **validate paid demand before building the SaaS further.** Do not keep building on conviction.

- **The wedge (from deep research, run `wf_b6b410d4-ce3`):** **Agent Readiness / Agent Experience (AX)**, shipped as fix-as-code — scan and scaffold the agent-capability manifests (MCP Server Card at `.well-known/mcp/server-card.json`, A2A `agent-card.json`, API Catalog RFC 9727 at `.well-known/api-catalog`, `agent-permissions.json`, OAuth discovery RFC 8414/9728, WebMCP declarative form annotations) into the repo. Distinct from incumbents (Cloudflare Agent Readiness Score, Scrunch AXP ~$26M, acquired by Sitecore $225M) who only score at the CDN/edge and never touch the repo. Verified gap: Stripe/Vercel/Supabase/Linear are each missing 4-5 of the 6. Lead with the best-backed pair MCP + WebMCP. **Caveats:** Cloudflare already free-scores readiness (isitagentready.com) so the moat is the in-repo fix-and-commit + packaging, NOT the score; ZERO verified evidence agents yet prefer sites with these manifests (early bet, validate first); standards are immature/drifting; the window is now and short (all signals Apr-Jun 2026). Future bets (late-26/mid-27, medium confidence): agent-preference analytics ("did AX work" / agent-era rank tracking), MCP tool discoverability/selection (177K tools, selection accuracy collapses 43%->2% as tool count grows). Full detail in memory `project_deep-research-wedge.md`.
- **Validation plan (in progress):** a **free-concierge offer** ("drop your URL, I'll open a free PR making your site agent-ready"), posted publicly (Show HN / r/nextjs / r/SaaS / X / MCP Discords) since there is no audience yet; optional personalized 1:1 cold emails from the user's personal Gmail (the Gmail MCP creates DRAFTS only; user sends; personalized 1:1 mail is NOT spam). Target pool: MCP server publishers / indie SaaS with an agent-readiness gap. The Agent Readiness scan is the hook. **Decision rule:** one paid "yes" from real targets = build the feature; crickets after a genuine push = reposition. Posting was blocked only on the README being launch-ready (now done pending the 0.2.1 publish). Do NOT build an outreach/lead-gen agent (mature tools exist; it is a distraction).

---

## Parked idea: lean research tool
The user wants to build a token-optimized personal research tool (a leaner deep-research): cut ~3M-token runs by grouping similar agents into clusters, optimizing token use, defining the problem before researching, with specialized agents (read prior chats, same-domain idea improvement, future-market SaaS builder). Personal use first, productize only after Answerfox ships. Spec at `docs/internal/IDEA-LEAN-RESEARCH-TOOL.md` (uncommitted). Memory: `project_lean-research-tool.md`.

---

## Immediate next steps (in order)

1. **Merge PR #44** ("chore(release): version packages", branch `changeset-release/main`) with `gh pr merge 44 --squash --admin --delete-branch`. It bumps `@answerfox/cli` to **0.2.1**. Merging triggers the release workflow to publish 0.2.1 via OIDC. (Changeset-bot PRs get no CI, so admin-merge is expected.)
2. **Verify the publish:** after the release run completes, `npx @answerfox/cli@latest --version` should print `0.2.1` and `audit https://example.com` should run with no assertion crash.
3. **Then GitHub is launch-ready.** Help the user run the validation: post the free-concierge Agent Readiness offer (Show HN / r/nextjs / r/SaaS / X / MCP Discords) from personal accounts; optionally draft 1:1 emails into Gmail for specific targets the user names. Watch for the one paid "yes."
4. **Week 1 Days 4-5 (gated on the user's accounts):** Day 4 = `packages/saas-shared` Drizzle schema (`profiles`, `sites`, `audits`, `findings` per TRD §5) + Supabase Postgres + first migration. Day 5 = Supabase Auth (GitHub OAuth via `@supabase/ssr`) + sign-in page + Sentry + PostHog. Needs: Supabase project (`DATABASE_URL`, `DIRECT_URL`, anon key, service_role), a GitHub OAuth app (configured inside Supabase), Sentry DSN, PostHog key. Env names + setup steps were given in chat (memory S457).

---

## Open PRs / repo state
- **Open:** PR #44 (version packages -> cli 0.2.1). Merge it (step 1 above).
- **Merged this session/recently:** #33 (prototype polish), #34 (rebrand docs+prototype), #35 (npm scope migration), #36 (release 0.2.0), #37 (CI Node 24 + format fix), #38 (CLAUDE.md gstack), #39 (changeset autoformat), #40-#42 (web Days 1-3), #43 (CLI fixes + README).
- **Untracked files in the working tree to deal with:** `docs/internal/IDEA-LEAN-RESEARCH-TOOL.md` (intentional, commit when convenient), and stray `tp.html`, `tp.txt`, `vbjina.txt`, `vbtmp.html` (unknown origin — review and delete or gitignore). Local `.claude/launch.json` is gitignored (prototype + web dev servers).
- Branch hygiene learning: `gh pr merge --delete-branch` removes the local branch too; **recut a fresh feature branch before each new chunk** or commits land on `main`.

---

## User preferences / working style (carry these over)
- **Recommend, don't ask.** Concrete recommendation + reasoning. AskUserQuestion only for genuine branching. Never a neutral menu.
- **Voice:** zero em-dashes anywhere (chat AND copy); friendly + educational, sharp not warm; no AI-tells (delve, leverage, harness, seamless, robust, comprehensive, etc.); **real numbers only**, no fake counters/testimonials/logos.
- **Honesty:** the user explicitly values blunt, honest partnership over cheerleading. Do not overstate risk or treat OSS publish as proof of demand.
- **Conventions:** small PRs, one concept each; conventional commits (feat/fix/chore/prototype/docs); co-author line `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`; main is protected (PR + green CI + linear history); the user is fine with hands-off GitHub (admin-merge after CI green).

---

## Memory files (auto-loaded each session, under `~/.claude/projects/C--Projects-answerable/memory/`)
- `MEMORY.md` (index), `feedback_decision_style.md`, `project_deep-research-wedge.md` (the Agent Readiness verdict), `project_lean-research-tool.md` (the parked tool idea). The claude-mem timeline (S/numeric IDs) holds finer-grained history; fetch with get_observations.

---

## The opening message for the new session
Paste this to resume seamlessly:

> Read `docs/internal/SESSION-HANDOFF.md` fully before doing anything. We are continuing Answerfox exactly where we left off. The immediate next step is to merge PR #44 to publish `@answerfox/cli@0.2.1` (the CLI fixes), then verify `npx @answerfox/cli@latest`. After that the GitHub is launch-ready and we run the Agent Readiness validation (free-concierge offer). Keep the same working style: recommend don't ask, zero em-dashes, no AI-tells, real numbers only, honest partner. Continue.
