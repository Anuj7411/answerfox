# Answerfox TRD v1.0 — Technical Architecture for the MVP Launch

**Version:** 1.0
**Status:** Locked 2026-05-29
**Owner:** Anuj Ojha
**Audience:** Anuj (executor) + future contributors + the LLM agents that will help build this
**Companion documents:**
- `docs/internal/STRATEGIC-POSITIONING.md` (the why)
- `docs/internal/PRD-V1.md` (the what — feature scope, user journeys, pricing)
- `docs/internal/BRAND-SYSTEM-LOCKED.md` (the look — Slate Family, color tokens, motion)
- `prototype/landing/` (the visual proof — v3.4 working prototype)
- `packages/audit/AUDIT-FRAMEWORK.md` (the OSS engine spec)

**Purpose:** Translate every PRD feature into concrete services, databases, endpoints, and code paths. Resolve every open technical question. After this document is locked, engineering work can begin with no ambiguity.

---

## 0. How To Read This Document

- **Looking for a specific feature?** Sections 6 to 16 cover one feature group each. The PRD feature IDs (F1 through F14) are cross-referenced.
- **Looking for cost?** Section 22 has the full bill of materials.
- **Looking for what scales when?** Section 21 has the scale ladder.
- **Looking for a TBD?** There are none. Every PRD open question is resolved here.
- **Found a conflict with the PRD?** This document wins on implementation specifics, the PRD wins on product behavior. If they meaningfully conflict, raise it as a blocker.

---

## 1. Executive Summary

**Architecture in one sentence:** a Next.js App Router web app on Cloudflare Pages, a Neon Postgres database, a Cloudflare R2 object store, a small fleet of Cloudflare Workers for scheduled jobs, the upstream `@answerfox/audit` OSS package running inside the workers, Gemini 3.5 Flash for AI fix generation, Stripe for billing, Resend for transactional and digest email, Auth.js for OAuth via GitHub and Google, Sentry plus PostHog for observability.

**Stack philosophy:**
- Stay on free tiers until forced off (target: $5 to $20/month total operating cost for the first 150 Pro users)
- Cloudflare-first because it composes well (Pages + Workers + R2 + KV + Cron Triggers + Web Analytics all on one bill)
- The OSS audit engine is an upstream npm dependency; the SaaS calls it, does not fork it
- Every scheduled or AI-driven action is queue-backed and retryable
- No service we cannot replace in under one day

**Launch readiness target:** 14.5 weeks from PRD lock (per PRD section 1).

---

## 2. System Architecture Overview

```
                                ┌──────────────────────────────────────┐
                                │            USERS                     │
                                │   Web · CLI · GitHub Action · Badge  │
                                └────┬─────────────────┬──────┬────────┘
                                     │                 │      │
                ┌────────────────────▼──────────┐      │      │
                │  Next.js App Router (Pages)   │      │      │
                │  - Marketing + Pricing        │      │      │
                │  - Web Dashboard              │      │      │
                │  - Auth.js OAuth flows        │      │      │
                │  - REST API routes            │      │      │
                └───────────┬───────────────────┘      │      │
                            │                          │      │
   ┌────────────────────────┼──────────────────────────┼──────┼────────┐
   │                        ▼                          ▼      ▼        │
   │  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
   │  │  AUDIT       │  │  AI WORKER   │  │  BADGE SVG (Worker)    │  │
   │  │  WORKER      │  │              │  │  cached 24h, R2-backed │  │
   │  │  on-demand + │  │  Gemini 3.5  │  └────────────────────────┘  │
   │  │  cron-based  │  │  Flash       │  ┌────────────────────────┐  │
   │  │              │  │  + quota     │  │  GITHUB ACTION         │  │
   │  │  consumes    │  │  + queue     │  │  posts PR comments     │  │
   │  │  @answerable-│  │              │  │  via REST API          │  │
   │  │  kit/audit   │  │  via Resend  │  └────────────────────────┘  │
   │  └──────┬───────┘  └──────┬───────┘                              │
   │         │                 │                                       │
   │  ┌──────▼─────────────────▼────────────────────────────────┐     │
   │  │             NEON POSTGRES (serverless)                  │     │
   │  │  users · sites · audits · findings · fixes ·            │     │
   │  │  ai_quota · ai_queue · sub · stripe_events · alerts     │     │
   │  └──────┬─────────────────────────────────────────────────┘     │
   │         │                                                         │
   │  ┌──────▼──────────────┐  ┌──────────────┐  ┌──────────────┐    │
   │  │  CLOUDFLARE R2      │  │ UPSTASH KV   │  │ RESEND       │    │
   │  │  - audit raw HTML   │  │ (rate limit) │  │ (email)      │    │
   │  │  - audit reports    │  │ (audit cache)│  │              │    │
   │  │  - generated fixes  │  └──────────────┘  └──────────────┘    │
   │  └─────────────────────┘                                          │
   │                                                                   │
   │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
   │  │  STRIPE      │  │  AUTH.JS     │  │  GEMINI 3.5  │            │
   │  │  Checkout +  │  │  GitHub OAuth│  │  Flash API   │            │
   │  │  webhooks    │  │  Google OAuth│  │              │            │
   │  └──────────────┘  └──────────────┘  └──────────────┘            │
   └───────────────────────────────────────────────────────────────────┘
                                     │
                       ┌─────────────▼──────────┐
                       │  SENTRY · POSTHOG ·    │
                       │  CLOUDFLARE ANALYTICS  │
                       └────────────────────────┘
```

Every box is either a Cloudflare service or a free-tier-friendly third party. There is no AWS, no Vercel-Pro, no Heroku, no Kubernetes.

---

## 3. Tech Stack (Every Decision Locked)

### Frontend

| Concern | Locked choice | Why |
|---|---|---|
| Framework | **Next.js 15 App Router** | Already in our DNA (`apps/docs` uses Next 15). RSC + server actions reduce API endpoint count. |
| Styling | **Tailwind CSS 4** with the Slate Family tokens from `BRAND-SYSTEM-LOCKED.md` baked into `tailwind.config.ts` | We already authored the system. CSS variable-driven means per-page ember swaps via `data-page` attribute on `<html>`. |
| Component primitives | **shadcn/ui base + heavy custom Slate overrides** | We get accessible primitives for free, override to the locked aesthetic so no template tell. |
| Bloom engine | **Port `prototype/landing/bloom-engine.js` v3.4 to a React `<Bloom />` component** in `src/components/bloom/Bloom.tsx` | Same engine the prototype validated. Mounted in a `position: absolute` canvas via `ref` + `useEffect`. SSR-safe (no-op on server). |
| Icons | **Lucide React** for system icons, inline SVG for brand-marked custom marks (the ember dot, the score arrows) | Tree-shakeable. Sized in pixels not rem. |
| Forms / validation | **react-hook-form + zod** | The fastest path to typed forms with server-action interop. |
| Data fetching (client) | **TanStack Query 5** | For dashboard polling, AI fix queue status, audit history. Server actions for write paths. |
| Charts | **Recharts** (the trend graphs in dashboard) | Already in the prototype as inline SVG; Recharts gives us proper axes once we have real data. |
| Animation | **Framer Motion** | Sparingly. Card entrance, score count-up, panel slide-in for Fix Studio. |
| Fonts | **Geist (display + mono) + Inter (body)** self-hosted via `next/font` | Per `BRAND-BRIEF.md` and `BRAND-SYSTEM-LOCKED.md`. Self-hosting prevents FOIT and removes a third-party domain from CSP. |

### Backend / runtime

| Concern | Locked choice | Why |
|---|---|---|
| Web app hosting | **Cloudflare Pages** | Free tier covers unlimited bandwidth, no commercial-use restriction (unlike Vercel Hobby). Builds from GitHub on push. |
| Server-side runtime | **Cloudflare Workers** (everywhere — Pages Functions, Cron Triggers, the badge endpoint) | Single runtime. Same code path for HTTP, cron, queue triggers. |
| Database | **Neon Postgres** (serverless) | 0.5 GB free, branched per env, autoscale. We use the Neon HTTP driver inside Workers (`@neondatabase/serverless`). |
| Object store | **Cloudflare R2** | 10 GB free, zero egress fees. Stores raw HTML, AI raw responses, generated fix patches, audit report exports. |
| KV / fast cache | **Cloudflare KV** | Rate limit counters, audit-result cache, the daily AI quota counters per user. |
| Background jobs | **Cloudflare Cron Triggers** + a `jobs` table in Postgres for queue state | No Inngest, no Trigger.dev — we have a small job set and Cloudflare's free cron + a postgres-backed queue is enough. |
| Email | **Resend** | 3,000 emails/month free covers ~750 Pro users at one weekly digest each. Backed by `resend.com` domain we send from `digest@answerfox.dev` and `notify@answerfox.dev`. |

### Identity / billing

| Concern | Locked choice | Why |
|---|---|---|
| Auth | **Auth.js (NextAuth) v5** with GitHub OAuth (primary) and Google OAuth (secondary) | 100% free OSS. Drop-in. Matches the ethos. No magic-link, no password reset complexity in v1. |
| Session | HTTP-only cookie, JWT-based, 30-day rolling expiry | Standard Auth.js behavior. |
| Billing | **Stripe Checkout** for subscription creation, **Stripe Customer Portal** for subscription management | No fixed cost. Pay only on revenue. Stripe Tax handles EU and India VAT. |

### AI

| Concern | Locked choice | Why |
|---|---|---|
| Primary LLM | **Gemini 3.5 Flash** (GA stable, May 2026) via Google AI Studio API | Free tier covers up to ~150 Pro users at our per-user daily quota. Paid tier available if needed. |
| SDK | **`@google/genai`** Node SDK called from inside Workers | Official SDK, Worker-compatible. |
| Prompt caching | Enabled via Gemini context caching API | Repeats the audit framework guidance prompt across fixes to drop input token cost. |
| Quota enforcement | **Postgres `ai_quota` table + Cloudflare KV daily counters** | Postgres is source of truth for monthly billing; KV gives sub-millisecond per-request quota check. |
| Queue | **`ai_queue` Postgres table + Cron worker that drains it on Gemini-quota-reset** | When the global free quota is exhausted (rare with per-user limits) the request queues until midnight UTC. |

### Observability + analytics

| Concern | Locked choice | Why |
|---|---|---|
| Error tracking | **Sentry** (free tier 5K errors/month) | Drop-in for Next.js. Catches both client and Worker errors. |
| Product analytics | **PostHog** (free tier 1M events/month) | Conversion funnels, feature usage, session replay (sampled at 10%). |
| Web analytics | **Cloudflare Web Analytics** | Completely free forever. Privacy-respecting. |
| Logs | **Cloudflare Workers Logs** + optional Axiom for retention beyond 24h | Free Cloudflare tier covers our launch volume. Axiom free tier (500 GB/month) is the upgrade path. |

---

## 4. Repository Layout

The existing monorepo gets two new apps and one new package.

```
answerable/
├── apps/
│   ├── docs/            (existing — Nextra docs site)
│   ├── web/             (NEW — Next.js SaaS, deployed to Cloudflare Pages)
│   ├── workers/         (NEW — Cloudflare Workers: audit, ai, badge, cron)
│   └── basic-nextjs/    (existing example app)
├── packages/
│   ├── audit/           (existing OSS — the 55-check engine)
│   ├── cli/             (existing OSS)
│   ├── core/            (existing OSS)
│   ├── schemas/         (existing OSS)
│   ├── metadata/        (existing OSS)
│   ├── sitemap/         (existing OSS)
│   ├── templates/       (existing OSS)
│   └── saas-shared/     (NEW private — DB schema, types, validators
│                        shared between web and workers)
├── prototype/
│   └── landing/         (existing visual prototype, historical reference)
├── docs/internal/       (all the strategy docs)
└── ...
```

### apps/web — the SaaS Next.js application

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (marketing)/             # public site
│   │   │   ├── page.tsx              # Landing
│   │   │   ├── pricing/page.tsx
│   │   │   └── (legal pages, blog later)
│   │   ├── (dashboard)/             # authed
│   │   │   ├── layout.tsx            # auth gate
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── audits/[id]/page.tsx
│   │   │   ├── findings/[id]/page.tsx
│   │   │   ├── fixes/page.tsx
│   │   │   ├── sites/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── billing/page.tsx
│   │   ├── (auth)/
│   │   │   ├── signin/page.tsx
│   │   │   └── verify/page.tsx       # site verification
│   │   ├── api/                     # REST endpoints
│   │   │   ├── audit/route.ts
│   │   │   ├── ai-fix/route.ts
│   │   │   ├── webhooks/stripe/route.ts
│   │   │   └── ...
│   │   └── badge/[domain]/route.ts   # public SVG badge endpoint
│   ├── components/
│   │   ├── bloom/Bloom.tsx           # the v3.4 bloom engine wrapped
│   │   ├── ui/                       # shadcn primitives + overrides
│   │   ├── dashboard/                # screen-specific
│   │   ├── pricing/
│   │   └── ...
│   ├── lib/
│   │   ├── db.ts                     # Neon driver instance
│   │   ├── auth.ts                   # Auth.js config
│   │   ├── stripe.ts
│   │   ├── gemini.ts
│   │   ├── audit-runner.ts           # wraps @answerfox/audit
│   │   ├── quota.ts
│   │   └── ...
│   └── styles/
│       └── globals.css               # Slate Family tokens
├── public/
├── tailwind.config.ts                # Slate Family tokens as Tailwind theme
├── next.config.mjs                   # @cloudflare/next-on-pages
└── package.json
```

### apps/workers — Cloudflare Workers

```
apps/workers/
├── audit-worker/                     # scheduled + on-demand audits
├── ai-worker/                        # Gemini API caller + queue drain
├── badge-worker/                     # cached SVG renderer
├── digest-worker/                    # weekly Monday digest sender
├── cron/                             # cron entrypoints + scheduling
└── shared/                           # DB, KV, R2 client glue
```

Each worker has its own `wrangler.toml`. They share `packages/saas-shared` for types and DB schema.

---

## 5. Database Schema (Neon Postgres, full DDL)

The full schema follows. Migrations live under `packages/saas-shared/migrations/`. Use `drizzle-orm` for schema-as-code; `drizzle-kit` for migrations.

```sql
-- ============================================================
-- USERS + AUTH
-- ============================================================

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           CITEXT UNIQUE NOT NULL,
  github_id       TEXT UNIQUE,
  google_id       TEXT UNIQUE,
  display_name    TEXT,
  avatar_url      TEXT,
  plan            TEXT NOT NULL DEFAULT 'free'
                   CHECK (plan IN ('free','pro','studio')),
  stripe_customer_id TEXT UNIQUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessions_user ON sessions(user_id);

-- ============================================================
-- SITES + VERIFICATION
-- ============================================================

CREATE TABLE sites (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,                  -- e.g. 'answerfox.dev'
  url             TEXT NOT NULL,                  -- full URL with protocol
  verified_at     TIMESTAMPTZ,
  verification_method TEXT
                   CHECK (verification_method IN ('meta','file','dns')),
  verification_token TEXT NOT NULL,
  schedule_enabled BOOLEAN NOT NULL DEFAULT true,
  schedule_cadence TEXT NOT NULL DEFAULT 'daily'
                   CHECK (schedule_cadence IN ('daily','twice','hourly')),
  next_audit_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sites_user ON sites(user_id);
CREATE INDEX idx_sites_next_audit ON sites(next_audit_at)
  WHERE schedule_enabled = true;
CREATE UNIQUE INDEX idx_sites_user_domain ON sites(user_id, domain);

-- ============================================================
-- AUDITS + FINDINGS
-- ============================================================

CREATE TABLE audits (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score_seo       INTEGER NOT NULL CHECK (score_seo BETWEEN 0 AND 100),
  score_aeo       INTEGER NOT NULL CHECK (score_aeo BETWEEN 0 AND 100),
  score_geo       INTEGER NOT NULL CHECK (score_geo BETWEEN 0 AND 100),
  score_aggregate INTEGER NOT NULL CHECK (score_aggregate BETWEEN 0 AND 100),
  band            TEXT NOT NULL
                   CHECK (band IN ('critical','weak','average','strong','excellent')),
  source          TEXT NOT NULL
                   CHECK (source IN ('web','cli','github-action','cron')),
  ran_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_ms     INTEGER NOT NULL,
  raw_html_r2_key TEXT,                           -- nullable; may purge after 30d on free
  report_r2_key   TEXT,                           -- the full JSON report
  engine_version  TEXT NOT NULL                   -- e.g. '@answerfox/audit@0.2.0'
);
CREATE INDEX idx_audits_site_ran ON audits(site_id, ran_at DESC);
CREATE INDEX idx_audits_user_ran ON audits(user_id, ran_at DESC);

CREATE TABLE findings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  check_id        TEXT NOT NULL,                  -- 'A4', 'G1', 'C3' etc.
  category        TEXT NOT NULL,                  -- 'A','B','C','D','E','F','G'
  severity        TEXT NOT NULL
                   CHECK (severity IN ('critical','high','medium','low')),
  status          TEXT NOT NULL
                   CHECK (status IN ('pass','fail','warn','skip')),
  description     TEXT NOT NULL,
  evidence        JSONB,                          -- raw matched markup, etc.
  fix_recommendation TEXT,
  docs_url        TEXT,
  page_url        TEXT                            -- which page within the site
);
CREATE INDEX idx_findings_audit ON findings(audit_id);
CREATE INDEX idx_findings_check ON findings(audit_id, check_id);

-- ============================================================
-- AI FIXES + QUOTA + QUEUE
-- ============================================================

CREATE TABLE ai_fixes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  finding_id      UUID NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  status          TEXT NOT NULL
                   CHECK (status IN ('queued','generating','ready','failed','cancelled')),
  fix_type        TEXT NOT NULL                   -- 'meta','schema','content','patch'
                   CHECK (fix_type IN ('meta','schema','content','patch')),
  content         TEXT,                           -- the generated code or text
  content_r2_key  TEXT,                           -- if larger than ~32KB
  explanation     TEXT,                           -- why-this-matters text
  impact_estimate JSONB,                          -- { score_deltas: { seo: +3, geo: +1 } }
  tokens_input    INTEGER,
  tokens_output   INTEGER,
  model_id        TEXT NOT NULL DEFAULT 'gemini-3.5-flash',
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL            -- auto-purge after 30 days
                   DEFAULT now() + INTERVAL '30 days'
);
CREATE INDEX idx_ai_fixes_user_status ON ai_fixes(user_id, status);
CREATE INDEX idx_ai_fixes_queued ON ai_fixes(status, requested_at)
  WHERE status = 'queued';

CREATE TABLE ai_quota (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month           DATE NOT NULL,                  -- first day of UTC month
  fixes_used      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month)
);

CREATE TABLE ai_quota_daily (
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day             DATE NOT NULL,                  -- UTC day
  fixes_used      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, day)
);

-- ============================================================
-- SUBSCRIPTIONS + STRIPE EVENTS
-- ============================================================

CREATE TABLE subscriptions (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL,                  -- 'active','past_due','canceled','trialing'
  plan            TEXT NOT NULL,                  -- 'pro','studio'
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotency for Stripe webhooks
CREATE TABLE stripe_events (
  id              TEXT PRIMARY KEY,               -- the Stripe event id
  type            TEXT NOT NULL,
  processed_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload         JSONB NOT NULL
);

-- ============================================================
-- DIGEST + ALERTS
-- ============================================================

CREATE TABLE digest_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start      DATE NOT NULL,
  sent_at         TIMESTAMPTZ,
  resend_id       TEXT,
  skipped         BOOLEAN NOT NULL DEFAULT false, -- when nothing changed
  skipped_reason  TEXT,
  UNIQUE (user_id, week_start)
);

-- ============================================================
-- GENERIC JOB QUEUE (for retryable async work)
-- ============================================================

CREATE TABLE jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind            TEXT NOT NULL,                  -- 'audit','ai-fix','digest'
  payload         JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'queued'
                   CHECK (status IN ('queued','running','done','failed','cancelled')),
  attempts        INTEGER NOT NULL DEFAULT 0,
  max_attempts    INTEGER NOT NULL DEFAULT 3,
  scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  finished_at     TIMESTAMPTZ,
  last_error      TEXT,
  result          JSONB
);
CREATE INDEX idx_jobs_ready ON jobs(kind, scheduled_at)
  WHERE status = 'queued';
```

---

## 6. F1 — Audit Engine with Three Scores

**Owner:** OSS package `@answerfox/audit` (already published, v0.2.0+)
**Consumed by:** the SaaS via direct npm import inside Workers and Next.js server runtime.

**Integration shape:**

```ts
// apps/web/src/lib/audit-runner.ts
import { runChecks } from '@answerfox/audit';
import { fetchPage } from './page-fetcher';
import { parseAbsoluteUrl } from '@answerfox/core';

export async function runAuditForSite(siteId: string, source: AuditSource) {
  const site = await db.sites.byId(siteId);
  const fetched = await fetchPage(site.url, { timeoutMs: 10_000 });
  const url = parseAbsoluteUrl(site.url);

  const report = await runChecks({
    url,
    html: fetched.html,
    dom: fetched.dom,
  });

  const audit = await db.audits.insert({
    site_id: siteId,
    user_id: site.user_id,
    score_seo: report.scores.seo,
    score_aeo: report.scores.aeo,
    score_geo: report.scores.geo,
    score_aggregate: report.score,
    band: report.band,
    source,
    duration_ms: report.duration_ms,
    engine_version: ANSWERABLE_AUDIT_VERSION,
  });

  await Promise.all([
    db.findings.bulkInsert(audit.id, report.results),
    putR2(`audits/${audit.id}/raw.html`, fetched.html),
    putR2(`audits/${audit.id}/report.json`, JSON.stringify(report)),
  ]);

  return audit;
}
```

**Per-request budget:**
- Audit duration: target p50 < 4s, p95 < 8s.
- Network fetch timeout: 10s hard.
- Worker CPU budget: 50ms (audit is mostly I/O + cheerio parse).

**Idempotency:** audit creation is not idempotent on `(site, time)` because the site can genuinely change. We dedup at the API layer: if a user clicks "Re-audit" twice in 5 seconds we return the first audit row.

---

## 7. F2, F3, F4 — CLI, GitHub Action, Public Badge

### F2 CLI (already shipped at v0.2.0)

Optional v1 addition: `pnpm dlx @answerfox/cli login` flow that pairs the CLI to a SaaS account via device code (similar to `gh auth login`). On every subsequent `audit` invocation, if logged in, the CLI POSTs the audit JSON to `/api/cli/audit` so it appears in the user's web history. **Decision:** ship this in v1.1 not v1. v1 CLI stays anonymous.

### F3 GitHub Action

Published at `answerfox/audit-action@v1` (separate public repo). Composite action structure:

```yaml
# action.yml
name: 'Answerfox Audit'
inputs:
  url:        { required: true }
  min-score:  { required: false, default: '' }
  fail-on-decline: { required: false, default: 'false' }
  api-key:    { required: false }
runs:
  using: 'composite'
  steps:
    - run: npx -y @answerfox/cli audit ${{ inputs.url }} --json > result.json
      shell: bash
    - uses: actions/github-script@v7
      with:
        script: |
          const fs = require('fs');
          const r = JSON.parse(fs.readFileSync('result.json'));
          // Diff against last main-branch audit if API key present
          // Post sticky comment on the PR with score delta
```

If `api-key` is provided, the action POSTs the audit to the SaaS to:
1. Persist under the user's account
2. Diff against last main-branch audit for the same URL
3. Optionally fetch AI fix suggestions for new failures (Pro only) and inline them in the PR comment

**API endpoint consumed:** `POST /api/github-action/audit` with header `Authorization: Bearer <api-key>` and JSON body `{ url, audit_json, ref, commit_sha, repository }`.

### F4 Public Badge

Cloudflare Worker route `GET /badge/:domain` returns SVG, cached 24h at the edge.

```ts
// apps/workers/badge-worker/src/index.ts
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const domain = extractDomain(req.url);
    const style = new URL(req.url).searchParams.get('style') ?? 'full';

    const cached = await env.BADGE_KV.get(`${domain}:${style}`);
    if (cached) return svgResponse(cached);

    const latest = await getLatestAuditForDomain(env.DB, domain);
    if (!latest) return svgResponse(notYetAuditedSvg(domain, style));

    const svg = renderBadge(latest, style);
    await env.BADGE_KV.put(`${domain}:${style}`, svg, {
      expirationTtl: 60 * 60 * 24, // 24 hours
    });
    return svgResponse(svg);
  },
};

function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'public, max-age=86400, s-maxage=86400',
      'x-content-type-options': 'nosniff',
    },
  });
}
```

Styles: `full` (default, 3 scores), `compact` (aggregate only), `square` (Twitter-card optimized 600x315).

**Click-through:** the SVG embeds an `<a xlink:href="https://answerfox.dev/site/${domain}">` so clicking the badge anywhere it is embedded lands on a public per-domain page.

---

## 8. F5 — Web Dashboard (Latest Audit Only, Free Tier)

Free users see exactly one site, the most recent audit, no history charts. Re-audit rate limited to 3 per day per site via KV counter.

**Rate limit helper (per-IP and per-user, KV-backed):**

```ts
// lib/rate-limit.ts
export async function checkAndIncrementRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const current = parseInt((await kv.get(key)) ?? '0', 10);
  if (current >= limit) return { allowed: false, remaining: 0 };
  await kv.put(key, String(current + 1), { expirationTtl: windowSeconds });
  return { allowed: true, remaining: limit - current - 1 };
}
```

For Free tier dashboard re-audit: `key = 'rl:reaudit:free:${userId}:${siteId}:${YYYY-MM-DD}'`, `limit = 3`, `windowSeconds = 86400`.

---

## 9. F6 — AI Fix Generation (Gemini 3.5 Flash + 90/month + 3/day + Queue)

This is the most engineering-dense feature in v1. Detailed design follows.

### Per-user quota enforcement (two-layer)

Every AI fix request goes through:

1. **Monthly quota check** (Postgres `ai_quota` row for the current month) — limit 90 for Pro, 0 for Free.
2. **Daily quota check** (Postgres `ai_quota_daily` row for today UTC) — limit 3 for Pro.

Both checks are wrapped in a single `BEGIN; SELECT FOR UPDATE; UPDATE; COMMIT` transaction inside Neon so two concurrent requests cannot both pass at the boundary.

### Global free-tier quota awareness (Gemini RPD limit)

A separate KV counter tracks "fixes generated globally today" (incremented on every successful Gemini call). When this exceeds 80% of Gemini's free-tier RPD limit, new fix requests are routed to the queue instead of the API.

### Queue + email notification fallback

When a fix cannot be served immediately, it lands in the `ai_fixes` table with `status = 'queued'`. A Cron Worker triggered at midnight UTC drains the queue:

```ts
// apps/workers/ai-worker/src/cron.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    // Quota counters reset at UTC midnight on Gemini's side.
    // Drain the queue in FIFO order, oldest first.
    const queued = await env.DB.query(
      `SELECT * FROM ai_fixes WHERE status='queued'
       ORDER BY requested_at ASC LIMIT 500`,
    );
    for (const fix of queued) {
      try {
        await env.DB.query(
          `UPDATE ai_fixes SET status='generating' WHERE id=$1`,
          [fix.id],
        );
        const result = await generateFix(env, fix);
        await env.DB.query(
          `UPDATE ai_fixes
           SET status='ready', content=$1, explanation=$2,
               tokens_input=$3, tokens_output=$4, completed_at=now()
           WHERE id=$5`,
          [result.content, result.explanation, result.tin, result.tout, fix.id],
        );
        // notify the user
        await resend.send({
          from: 'notify@answerfox.dev',
          to: fix.user_email,
          subject: `Your AI fix for ${fix.check_id} is ready`,
          html: renderFixReadyEmail(fix, result),
        });
      } catch (err) {
        await markFailedWithBackoff(env.DB, fix.id, err);
      }
    }
  },
};
```

### Prompt structure (per fix type)

A single shared prompt template lives at `apps/workers/ai-worker/src/prompts/`. Cached via Gemini context-caching API so the input cost drops to near zero on repeat fixes:

```
SYSTEM:
You are Answerfox's AI fix generator. You output ONLY the code or text
that goes directly into the user's site. No prose explanations unless
asked. Adhere strictly to the requested format. Do not include
markdown fences in the output. No em-dashes anywhere.

CONTEXT:
- Check failing: {check_id}
- Description: {check_description}
- Severity: {severity}
- Site URL: {site_url}
- Failing evidence: {evidence}
- Page HTML snippet: {html_excerpt_within_8k_tokens}

TASK:
Generate the fix in the format: {output_format}

OUTPUT_FORMAT_GUIDE for {fix_type}:
{format_guide}
```

Format guide per fix type:
- `meta`: a single line of HTML meta tag
- `schema`: a JSON-LD block with `@context`, no markdown
- `content`: a markdown diff with `--- old` and `+++ new` markers
- `patch`: a unified diff `--- a/file +++ b/file` format

Model: `gemini-3.5-flash`. Temperature: 0.3 (deterministic enough). Max output tokens: 800.

### Cost economics (validated)

- Average input per fix: ~2,500 tokens (audit context + check guidance + HTML)
- Average output: ~400 tokens (the fix itself)
- With Gemini context cache on the static guidance: effective input ~800 tokens billed
- Free tier covers: 1,500 RPD × 30 days = 45,000 fixes/month
- Pro user at 90/month × 150 users = 13,500/month
- **Headroom: 3.3× the launch ceiling**

When we exceed free tier we switch to paid:
- ~$0.075 per 1M input, $0.30 per 1M output = ~$0.00018 per fix
- 1,000 Pro users at 90/mo = 90K fixes/month = $16.20/month
- **AI is < 0.2% of revenue at any scale we will hit pre-Series-A.**

---

## 10. F7 — Audit History 30 Days + Trend Graphs (Pro)

Postgres handles this cleanly. A nightly cron prunes audits older than 30 days for Pro users (or 0 days for Free):

```sql
-- runs nightly at 02:00 UTC
DELETE FROM audits
WHERE ran_at < now() - INTERVAL '30 days'
  AND user_id IN (SELECT id FROM users WHERE plan IN ('free','pro'));

-- studio gets unlimited history (deferred to Phase 2)
```

Trend graph query (the dashboard tile):

```sql
SELECT
  date_trunc('day', ran_at) AS day,
  AVG(score_seo)::int   AS seo,
  AVG(score_aeo)::int   AS aeo,
  AVG(score_geo)::int   AS geo
FROM audits
WHERE site_id = $1 AND ran_at >= now() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1;
```

R2 objects (raw HTML, full reports) get TTL'd via R2 lifecycle rules (30 days).

---

## 11. F8 — Multi-Site (Up To 3, Pro)

Schema already supports this via `sites.user_id`. Enforced at API + UI layer:

```ts
// lib/permissions.ts
export async function canAddSite(userId: string): Promise<boolean> {
  const user = await db.users.byId(userId);
  if (user.plan === 'free') {
    const n = await db.sites.countByUser(userId);
    return n < 1;
  }
  if (user.plan === 'pro') {
    const n = await db.sites.countByUser(userId);
    return n < 3;
  }
  return true; // studio is unlimited (Phase 2)
}
```

---

## 12. F9 — Scheduled Daily Audits (Pro)

Cron Worker triggered every 15 minutes. Each tick scans `sites` for those whose `next_audit_at <= now()` and enqueues an audit job. Audits are spread (jittered) across the day so the worker load is roughly constant.

```ts
// apps/workers/audit-worker/src/cron.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const due = await env.DB.query(
      `SELECT id, user_id, url FROM sites
       WHERE schedule_enabled = true
         AND next_audit_at <= now()
       LIMIT 50`,
    );
    for (const site of due) {
      await enqueueAuditJob(env, site);
      // schedule next run with ±20min jitter so the load spreads
      const next = computeNextRun(site.schedule_cadence);
      await env.DB.query(
        `UPDATE sites SET next_audit_at = $1 WHERE id = $2`,
        [next, site.id],
      );
    }
  },
};
```

If a scheduled audit fails (e.g. target site is down), retry once after 1 hour. After that, skip and log. Do not block tomorrow's run.

---

## 13. F10 — Weekly Email Digest (Pro)

Cron Worker runs every Monday at 09:00 UTC (a single timezone keeps v1 simple; per-user timezone is a Phase 2 polish).

```ts
// apps/workers/digest-worker/src/cron.ts
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const proUsers = await env.DB.query(`
      SELECT id, email, display_name
      FROM users
      WHERE plan = 'pro' AND email_digest_enabled = true
    `);
    for (const user of proUsers) {
      const data = await buildDigestData(env.DB, user.id);
      if (data.skip) {
        await env.DB.query(
          `INSERT INTO digest_runs (user_id, week_start, skipped, skipped_reason)
           VALUES ($1, date_trunc('week', now()), true, $2)
           ON CONFLICT DO NOTHING`,
          [user.id, data.skipReason],
        );
        continue;
      }
      const html = renderDigestEmail(data);
      const res = await resend.send({
        from: 'digest@answerfox.dev',
        to: user.email,
        subject: data.subject,
        html,
        text: renderDigestText(data),
      });
      await env.DB.query(
        `INSERT INTO digest_runs (user_id, week_start, sent_at, resend_id)
         VALUES ($1, date_trunc('week', now()), now(), $2)
         ON CONFLICT (user_id, week_start) DO UPDATE
         SET sent_at = EXCLUDED.sent_at, resend_id = EXCLUDED.resend_id`,
        [user.id, res.id],
      );
    }
  },
};
```

Skip rules:
- If `audits` for any of the user's sites all have unchanged scores week-over-week AND zero new findings AND zero AI fixes used: skip (no value).
- If user has no sites: skip.

Email service: **Resend**. SPF/DKIM/DMARC configured on `digest.answerfox.dev` and `notify.answerfox.dev` subdomains.

---

## 14. F11 — Detailed Evidence Inspector (Pro)

A side panel UI component on the audit details page. Server endpoint returns the finding plus its full evidence JSON (already stored in `findings.evidence`) plus a fix history join.

```ts
// app/api/findings/[id]/route.ts
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await requireAuth(req);
  const finding = await db.findings.byId(params.id);
  if (!userId || finding.audit.user_id !== userId) return forbidden();
  if (await getUserPlan(userId) !== 'pro') return paywall();

  const history = await db.query(`
    SELECT a.ran_at, f.status
    FROM findings f
    JOIN audits a ON a.id = f.audit_id
    WHERE a.site_id = $1 AND f.check_id = $2
    ORDER BY a.ran_at DESC LIMIT 20
  `, [finding.audit.site_id, finding.check_id]);

  return json({ finding, history });
}
```

---

## 15. F12, F13, F14 — Platform Foundations

### F12 Authentication

Auth.js v5 config:

```ts
// apps/web/src/lib/auth.ts
import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db, schema } from './db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, schema),
  providers: [
    GitHub({ clientId: env.GITHUB_ID, clientSecret: env.GITHUB_SECRET }),
    Google({ clientId: env.GOOGLE_ID, clientSecret: env.GOOGLE_SECRET }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.plan = token.plan as Plan;
      return session;
    },
  },
});
```

OAuth scopes: GitHub `read:user user:email`. Google `openid email profile`.

### F13 Billing

Two Stripe endpoints:

```
POST /api/billing/checkout
GET  /api/billing/portal
POST /api/webhooks/stripe
```

Webhook handler is the only complex piece. Idempotency via `stripe_events` table:

```ts
// app/api/webhooks/stripe/route.ts
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return new Response('bad signature', { status: 400 });
  }

  // idempotency
  const already = await db.stripeEvents.byId(event.id);
  if (already) return new Response('ok', { status: 200 });

  await db.transaction(async (tx) => {
    await tx.stripeEvents.insert(event);
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await upsertSubscription(tx, event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await markCancelled(tx, event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await flagPastDue(tx, event.data.object as Stripe.Invoice);
        break;
    }
  });
  return new Response('ok', { status: 200 });
}
```

Stripe Tax is enabled. Inclusive pricing for EU and IN.

### F14 Site Verification

Three methods. Token generated as a 32-byte random string and stored on the `sites` row.

```ts
// app/api/sites/[id]/verify/route.ts
export async function POST(req: NextRequest, { params }) {
  const site = await db.sites.byId(params.id);
  const method = (await req.json()).method;
  let verified = false;

  if (method === 'meta') {
    const html = await fetchSiteHtml(site.url);
    verified = html.includes(
      `<meta name="answerfox-verify" content="${site.verification_token}">`,
    );
  } else if (method === 'file') {
    const res = await fetch(`${site.url}/.well-known/answerfox-verify`);
    const text = await res.text();
    verified = text.trim() === site.verification_token;
  } else if (method === 'dns') {
    const records = await dnsTxt(`_answerable.${site.domain}`);
    verified = records.includes(site.verification_token);
  }

  if (verified) {
    await db.sites.update(site.id, { verified_at: new Date(), verification_method: method });
    return json({ verified: true });
  }
  return json({ verified: false }, { status: 422 });
}
```

Tokens expire 7 days after issue.

---

## 16. Frontend Architecture (Slate Family Implementation)

### Tailwind config

`apps/web/tailwind.config.ts` embeds the Slate Family tokens:

```ts
export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        slate: {
          base: '#D6D2CB',
          elev: '#E0DCD5',
          recess: '#C4C0B9',
        },
        ink: {
          DEFAULT: '#1A1814',
          muted: '#4A453E',
          dim: '#7A736A',
          inverse: '#F2EFE9',
        },
        ember: 'var(--ember)',
        marigold: '#E8AA2A',
        saffron: '#E5B225',
        amber: '#FFA500',
        terracotta: '#C6553C',
        ochre: '#B85C1F',
        violet: '#A855F7',
        lime: '#A3FF12',
        magenta: '#FF006E',
      },
      fontFamily: {
        display: ['var(--font-geist)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      borderRadius: {
        card: '16px',
        button: '12px',
      },
    },
  },
};
```

### Per-page ember switching

Each route layout sets `data-page` on `<html>`. CSS variable cascade selects the ember:

```css
:root { --ember: #F89444; --ember-intensity: 0.8; }
[data-page="pricing"]   { --ember: #E8AA2A; --ember-intensity: 0.6; }
[data-page="signin"]    { --ember: #C6553C; --ember-intensity: 0.6; }
[data-page="docs"]      { --ember: #B85C1F; --ember-intensity: 0.6; }
[data-page="dashboard"] { --ember: #F89444; --ember-intensity: 0.35; }
[data-page="audit"]     { --ember: #E5B225; --ember-intensity: 0.35; }
[data-page="fix"]       { --ember: #FFA500; --ember-intensity: 0.4; }
[data-page="settings"]  { --ember: #B85C1F; --ember-intensity: 0.25; }
```

### Bloom component

`apps/web/src/components/bloom/Bloom.tsx` wraps the v3.4 engine from `prototype/landing/bloom-engine.js`. Mounted in client components only (`'use client'`). SSR-safe via `typeof window !== 'undefined'` guard.

```tsx
'use client';
import { useEffect, useRef } from 'react';
import type { BloomOpts } from './types';

declare global {
  interface Window {
    mountBloom?: (canvas: HTMLCanvasElement, opts: BloomOpts) => void;
  }
}

export function Bloom({ opts }: { opts: BloomOpts }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    import('./engine').then(({ mountBloom }) => mountBloom(ref.current!, opts));
  }, []);
  return <canvas ref={ref} className="absolute inset-0 -z-10" />;
}
```

The engine file is the v3.4 module from `prototype/landing/bloom-engine.js`, converted to ESM and given proper TypeScript types.

---

## 17. API Surface (REST + Server Actions)

### Public REST endpoints

| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/badge/:domain` | Public score SVG | none |
| GET | `/site/:domain` | Public per-domain page | none |
| GET | `/.well-known/answerfox-policy` | Public policy doc | none |

### Authenticated REST endpoints

| Method | Path | Description | Plan gate |
|---|---|---|---|
| POST | `/api/sites` | Create a site | Free + Pro |
| POST | `/api/sites/:id/verify` | Verify ownership | Free + Pro |
| POST | `/api/sites/:id/audit` | Run on-demand audit | Free (3/day rate-limited) + Pro |
| GET | `/api/sites/:id/audits` | Audit history | Pro for >latest |
| GET | `/api/sites/:id/audits/latest` | Most recent audit | Free + Pro |
| GET | `/api/audits/:id/findings` | Findings list | Free + Pro |
| GET | `/api/findings/:id` | Detailed evidence | Pro |
| POST | `/api/findings/:id/ai-fix` | Request AI fix | Pro (90/mo, 3/day) |
| GET | `/api/ai-fixes/:id` | Poll fix status | Pro |
| POST | `/api/billing/checkout` | Start Stripe Checkout | Free |
| GET | `/api/billing/portal` | Stripe Customer Portal redirect | Pro |
| POST | `/api/webhooks/stripe` | Stripe webhook | signature-verified |
| POST | `/api/github-action/audit` | Receive CI audit | API key |

### Rate limits at the API gateway

Cloudflare Workers + KV. Limits set per-route in `wrangler.toml`:

```
POST /api/sites/:id/audit    free: 3/day per site,  pro: 100/day per site
POST /api/findings/:id/ai-fix free: 0,              pro: 3/day per user (also enforced via DB)
POST /api/sites              free: 1/lifetime,      pro: 3/lifetime per user
GET  /badge/:domain          1000/min per IP (Cloudflare default)
```

---

## 18. Deployment Plan

### Branches and environments

| Branch | Environment | Hosting | Database |
|---|---|---|---|
| `main` | production | Cloudflare Pages prod | Neon prod branch |
| `staging` | staging | Cloudflare Pages staging | Neon staging branch |
| `pr-XYZ` | preview | Cloudflare Pages preview | Neon preview branch (auto) |

### CI/CD via GitHub Actions

Existing `.github/workflows/release.yml` (for OSS publish) stays. Add:

```yaml
# .github/workflows/web.yml
on:
  push: { branches: [main, staging] }
  pull_request:
jobs:
  build-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter @answerfox/web run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy apps/web/dist --project-name answerfox-web
```

Workers deploy via `wrangler deploy` per worker, gated on the same workflow.

### Domain setup

- `answerfox.dev` → Cloudflare Pages (web app)
- `api.answerfox.dev` → Workers (REST + badge)
- `digest.answerfox.dev` → DNS only (email sending domain)
- `notify.answerfox.dev` → DNS only (transactional email)

### Secrets

Stored in Cloudflare Pages + Workers env (encrypted at rest). The minimum set:

```
DATABASE_URL              (Neon connection string with pooling)
DATABASE_URL_UNPOOLED     (for migrations)
AUTH_SECRET               (Auth.js JWT secret)
GITHUB_ID, GITHUB_SECRET
GOOGLE_ID, GOOGLE_SECRET
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
STRIPE_PRO_ANNUAL_PRICE_ID
GEMINI_API_KEY
RESEND_API_KEY
SENTRY_DSN
POSTHOG_KEY
R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
```

---

## 19. Observability

| Concern | Tool | What we track |
|---|---|---|
| Errors | Sentry | Both client and Worker. Source maps uploaded on build. |
| Performance | Sentry transactions | API endpoint timings, audit duration, AI fix duration |
| Product analytics | PostHog | Sign-up funnel, paywall hits, AI fix usage, time-to-first-audit |
| Web analytics | Cloudflare Web Analytics | Pageviews, top pages, referrers (free, privacy-respecting) |
| Worker logs | Cloudflare Workers Logs | structured JSON via `console.log`, retained 24h free |
| Worker logs (long-term) | Axiom (free tier) | Pushed via Cloudflare Logpush, retained 30 days |
| Uptime monitoring | UptimeRobot (free) | 5-min ping on `/api/health` and `/badge/example.com` |

### Health check endpoint

```ts
// app/api/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    db.query('SELECT 1'),
    env.AUDIT_KV.get('health-probe'),
    fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY },
    }),
  ]);
  const ok = checks.every(c => c.status === 'fulfilled');
  return new Response(JSON.stringify({
    ok,
    checks: checks.map(c => c.status),
  }), { status: ok ? 200 : 503 });
}
```

### Status page

`status.answerfox.dev` → hosted on Cloudflare Pages, fed by UptimeRobot. Free, public.

---

## 20. Security Model

### Authentication boundaries
- All `/api/*` routes except `/api/webhooks/stripe`, `/api/health`, and `/api/github-action/*` require a valid Auth.js JWT cookie.
- GitHub Action route requires a per-user API key (stored in `users.cli_api_key`, scoped to read+write that user's own sites).

### Authorization
- Row-level: every database query that takes a `siteId`, `auditId`, or `findingId` is wrapped in a helper that joins to `user_id` and matches the session user.

```ts
export async function ensureSiteOwner(userId: string, siteId: string) {
  const site = await db.sites.byId(siteId);
  if (!site || site.user_id !== userId) throw new ForbiddenError();
  return site;
}
```

### Rate limits
- Per-route KV-backed counters (see section 17).
- Cloudflare Bot Fight Mode enabled on `/api/*`.
- Cloudflare WAF custom rule blocks requests with suspicious user-agents on POST endpoints.

### Webhook security
- Stripe: HMAC signature verification using `STRIPE_WEBHOOK_SECRET`.
- All webhook handlers respond 200 on duplicate event IDs (idempotency via `stripe_events` table).

### Data retention
- Free tier: latest audit only. Older audits deleted nightly.
- Pro tier: 30 days of audits. Older deleted nightly.
- R2 objects: TTL'd via lifecycle rules.
- Generated AI fixes: 30-day TTL.
- Stripe events: kept forever (small rows, useful for support).

### Secret rotation
- Auth secrets: rotated quarterly (UI handles re-encryption transparently).
- Gemini API key: rotated when leaked or annually.
- Stripe keys: rotated on team changes.

### CSP
- Strict CSP on the web app: `script-src 'self'`, no inline scripts, no third-party scripts except Stripe.js on the checkout page and PostHog/Sentry on all pages.

### Abuse prevention
- Per-user audit creation rate limit (see section 17).
- Per-IP signup rate limit (5/day per IP).
- Disposable email blocking (basic regex against known disposable domains).

---

## 21. Performance Budgets

| Surface | Target | Hard ceiling |
|---|---|---|
| Landing page LCP | < 1.2s | 2.0s |
| Landing page TTFB | < 200ms (cached) / < 800ms (cold) | 1.5s |
| Dashboard initial paint | < 800ms | 1.5s |
| Audit API (cold) | < 6s | 10s (timeout) |
| Audit API (warm cache hit) | < 1.5s | 3s |
| AI fix generation | < 8s | 15s (timeout) |
| Badge SVG (cached) | < 50ms | 200ms |
| Badge SVG (regenerated) | < 400ms | 1.0s |
| Worker p95 CPU per request | < 30ms | 50ms (Cloudflare limit) |
| Database p95 query | < 100ms | 500ms |

### Caching strategy
- Static pages: Cloudflare edge cache, 24h TTL, purge on deploy.
- Audit results in KV: 5-minute TTL per `(siteId, latest)` so dashboard polls are cheap.
- Badge SVGs: 24h TTL in KV.

---

## 22. Bill Of Materials and Cost At Scale

| Service | Free tier limit | Cost above free | At 100 Pro users | At 1,000 Pro users |
|---|---|---|---|---|
| Cloudflare Pages | unlimited bandwidth | n/a | $0 | $0 |
| Cloudflare Workers | 100K req/day | $5 + $0.50/M requests | $0 | ~$5 |
| Cloudflare KV | 100K reads/day, 1K writes/day | $0.50/M reads | $0 | ~$2 |
| Cloudflare R2 | 10 GB stored, 1M reads/month | $0.015/GB-month | $0 | ~$5 |
| Neon Postgres | 0.5 GB, 191h compute | $19/mo for Launch | $0 | $19 |
| Auth.js | free OSS | n/a | $0 | $0 |
| Resend | 3K emails/month | $20 for 50K | $0 | $20 |
| Stripe | 2.9% + $0.30 | per transaction | ~$84/mo at $2.9K MRR | ~$840/mo at $29K MRR |
| Gemini 3.5 Flash | 1,500 RPD free | $0.075/M in, $0.30/M out | $0 | ~$16 |
| Sentry | 5K errors/mo | $26/mo for 50K | $0 | $26 |
| PostHog | 1M events/mo | $0.00031/event | $0 | $0 |
| Cloudflare Analytics | free forever | n/a | $0 | $0 |
| Axiom (logs) | 500 GB/mo | $25/mo for 1TB | $0 | $25 |
| Domain (Cloudflare Registrar) | ~$15-50/year | per renewal | ~$3/mo amortized | ~$3/mo |
| **TOTAL OPERATING** |  |  | **~$87/mo** | **~$960/mo** |

At 1,000 Pro users:
- Revenue: $29,000 MRR
- Operating cost: ~$960/mo
- **Margin: 96.7%**

Stripe is ~88% of total cost (transaction fees). All other infrastructure is < 0.5% of revenue.

---

## 23. Scale Ladder (When Free Tiers Run Out, What We Do)

| Trigger | What we upgrade | New cost |
|---|---|---|
| Neon compute hours exceeded | Upgrade to Launch tier | +$19/mo |
| Cloudflare Workers exceed 100K/day | Pay per request | +$5 base + variable |
| Resend free 3K emails exceeded | Upgrade to Pro | +$20/mo |
| Gemini RPD exceeded daily | Switch to paid Gemini | variable, ~$16 per 1K users |
| Sentry 5K errors/mo exceeded | Upgrade to Team | +$26/mo |
| Cloudflare R2 storage exceeds 10GB | Pay per GB | +$0.15/10GB/mo |

Total expected cost at $30K MRR: < $1,000/mo. Pure SaaS gross margin > 96%.

---

## 24. Open Technical Questions (All Resolved)

| Question (from PRD) | Resolved answer |
|---|---|
| Auth provider: WorkOS or Clerk? | **Auth.js (NextAuth) v5.** Free OSS. No vendor cost. Matches our ethos. |
| Hosting: Vercel or Cloudflare? | **Cloudflare Pages + Workers.** Free tier covers commercial use. No vendor lock-in beyond standard CDN. |
| Free tier history: 7 days or 0? | **0 days. Latest audit only.** Sharpens the upgrade path. |
| Default theme: dark, light, or both? | **Light slate only at launch** per `BRAND-SYSTEM-LOCKED.md`. Dark mode in v1.2 if requested. |
| Annual billing at launch? | **Yes.** Stripe Checkout configuration, near-zero engineering cost. 15% discount. |
| What is "1 site" — per email or per token? | **Per user account.** A user can be on Free or Pro; Free is 1 site total, Pro is 3 sites total. |
| Public leaderboard opt-in or opt-out? | **Opt-out** for verified sites. Visible by default on public domain pages. Opt-out toggle in site settings. |
| Discord/community at launch? | **No.** GitHub Discussions is enough for v1. Discord in Phase 2 if community demand emerges. |

---

## 25. The Build Order (12-Week Engineering Plan)

Working backward from PRD launch target (14.5 weeks).

**Weeks 1-2 — Foundations**
- Scaffold `apps/web` with Next.js 15 App Router
- Tailwind config with Slate Family tokens
- Port `prototype/landing/bloom-engine.js` to TypeScript ESM module
- Mount `<Bloom />` component
- Auth.js setup with GitHub OAuth (Google after)
- Drizzle schema + Neon migrations for `users`, `sessions`, `sites`, `audits`, `findings`
- Sentry + PostHog wired
- Landing page deployed to staging

**Weeks 3-4 — Audit pipeline**
- `audit-runner.ts` calling `@answerfox/audit` v0.2.0+
- POST `/api/sites/:id/audit` endpoint
- R2 storage of raw HTML and report JSON
- Dashboard home screen rendering real audit data
- Audit details + findings list pages
- Public badge endpoint (`apps/workers/badge-worker`)
- Public per-domain page (`/site/:domain`)

**Weeks 5-6 — AI fixes (the magic moment)**
- Gemini integration via `@google/genai`
- Prompt templates for the 4 fix types (meta, schema, content, patch)
- `ai_fixes` table + quota enforcement
- Fix Studio panel UI matching `prototype/landing/fix-studio.jsx`
- Queue + email fallback worker
- Daily and monthly quota counters

**Weeks 7-8 — Billing + Pro tier features**
- Stripe Checkout + Customer Portal
- Webhook handler with idempotency
- Pro tier upgrade flow
- Audit history pages
- Multi-site support
- Detailed evidence inspector

**Weeks 9-10 — Scheduled audits + digest + verification + GitHub Action**
- Cron Workers for scheduled audits
- Site verification flows (meta, file, DNS)
- Weekly email digest worker
- Resend templates
- GitHub Action repo + composite action
- All cron schedules deployed and tested

**Weeks 11-12 — Beta**
- Soft-launch to 20 hand-picked beta users
- Bug triage
- 5+ user feedback interviews
- Polish + final design QA against the prototype
- Status page live
- Launch video recorded

**Weeks 13-14 — Pre-launch + Launch**
- HN Show post + dev.to writeups
- ProductHunt hunter aligned
- Tweet thread written
- Launch on Tuesday 00:01 PT
- Day-of: triage, respond to PH comments, monitor Sentry
- Week 1: bug fixes from launch traffic

---

## 26. Definition of Done for v1.0

The MVP is ready when:

- All 14 features (F1 through F14) are implemented and tested
- All 8 user journeys from the PRD can be completed end-to-end
- All performance budgets from section 21 are met in staging
- All security checks from section 20 are verified
- 50 beta users have used the product for at least 7 days
- At least 3 of those beta users converted to Pro voluntarily
- Status page is live and green
- Sentry has had zero P0 errors in staging for 48 hours
- The launch checklist from PRD section 11 is fully green

---

## 27. The Single Sentence (One More Time)

> Answerfox is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.

Every architectural decision in this document serves that sentence.

---

**Locked: 2026-05-29**
**Next: scaffold `apps/web` and begin the Week 1 build.**
**Companion: `PRD-V1.md` (the what), `BRAND-SYSTEM-LOCKED.md` (the look), `STRATEGIC-POSITIONING.md` (the why).**
