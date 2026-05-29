# Answerfox PRD v1.0 — MVP Launch Specification

**Version:** 1.0
**Status:** Locked 2026-05-20
**Owner:** Anuj Ojha
**Audience:** Anuj (executor) + future contributors + future hires
**Companion documents:**
- `docs/internal/STRATEGIC-POSITIONING.md` (the why and the differentiator)
- `docs/internal/BRAND-BRIEF.md` (the visual and voice system)
- `docs/internal/TRD-V1.md` (to be written next — the how)
- `packages/audit/AUDIT-FRAMEWORK.md` (the 55-check spec, OSS-scoped)

**Purpose:** Define exactly what ships in the v1.0 launch of Answerfox SaaS. Every feature, every user journey, every success metric, every risk. Anything not in this document is out of scope for v1.0 by default.

---

## 0. How To Read This Document

- **You disagree with something?** Push back before we start building. After we start, scope changes carry friction.
- **Looking for visual specs?** See `BRAND-BRIEF.md`. PRD does not own pixels.
- **Looking for technical architecture?** See `TRD-V1.md` (to be written). PRD does not own database schemas.
- **Looking for OSS engine internals?** See `packages/audit/AUDIT-FRAMEWORK.md`. PRD treats OSS engine as upstream dependency.
- **Section "Out of scope" matters as much as section "In scope".** Discipline through subtraction is how we win.

---

## 1. Executive Summary

**What we are shipping:** A hosted SaaS web application that wraps the open-source `@answerfox/*` packages, sells AI fix generation to indie developers, and serves as the marketing surface for the open-source toolkit.

**For whom:** Solo indie developers and bootstrapped founders building SaaS products on Next.js, Astro, or Remix.

**Why now:** AI search is displacing traditional Google traffic. Funded competitors (Profound $155M, Peec $29M, Otterly) target enterprise and mid-market. The indie developer tier under $30 per month is empty. We have a 12 to 18 month window to claim it before someone funded notices.

**Success criteria for v1.0 launch:**
- 500 GitHub stars on `@answerfox/*` repos within 30 days of launch
- 200 free SaaS signups in launch week
- 25 paying Pro subscribers ($725 MRR) in launch month
- 75 paying subscribers ($2,175 MRR) by end of month 3
- 4.5+ average rating on ProductHunt
- Zero P0 bugs reported in first 7 days

**Launch date target:** 14.5 weeks from PRD lock. Allows 3 weeks polish + 7.5 weeks build + 4 weeks beta and refinement. Two weeks added vs initial 12-week estimate to ship 3 additional Pro features (F9 scheduled audits, F10 weekly digest, F11 detailed evidence inspector) that materially strengthen the Pro tier value proposition. Half a week added for the AI fix queue + email notification system, which protects launch UX when global Gemini quota is exhausted.

---

## 2. Product Vision (from Strategic Positioning)

**The single sentence (memorize this):**
> Answerfox is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.

**The three pillars (every feature reinforces at least one):**
1. **Open source first.** Audit engine is MIT-licensed. Every claim verifiable. Free distribution + community trust.
2. **Lives in your codebase.** CLI, GitHub Action, npm package. SEO treated like a build step, not a tab in your browser.
3. **Ships fixes as code.** AI does not give advice. It generates the actual patches you can git apply or merge as PRs.

**The differentiator no one has:**
Three scores per audit (SEO, AEO, GEO) side by side. One tool. Unified scoring is shipping in v0.2.0 of the OSS engine as Phase 1 week 1 work.

---

## 3. Target User (Detailed Persona)

### Primary persona: "Solo Sam"

| Attribute | Detail |
|---|---|
| **Role** | Solo founder, full-stack developer, or technical co-founder |
| **Company stage** | Pre-revenue to $50K MRR |
| **Tech stack** | Next.js 14/15 (90%), occasional Astro, Remix, SvelteKit |
| **Hosting** | Vercel (60%), Netlify (15%), Cloudflare Pages (15%), self-hosted (10%) |
| **Daily tools** | VS Code or Cursor, terminal, GitHub, Vercel dashboard, Twitter, Linear or Notion |
| **Spend tolerance** | $0 to $50 per month happily on individual tools. $200+ for bundles. |
| **SEO sophistication** | Knows there is something called SEO. Has read 2 articles. Has not done much. |
| **AI-SEO awareness** | Has read tweets about ChatGPT citing sites. Worried but does not know what to do. |
| **Pain frequency** | Thinks about SEO once per launch. Hates dealing with it. Wishes it was solved. |
| **Information sources** | Twitter and X dev community, Hacker News, dev.to, Hashnode, Reddit r/SaaS and r/SideProject |
| **Buying triggers** | Tweet from someone they respect + a clear "this saves me a day" pitch |
| **Hates** | Sales calls, demos that require booking, enterprise pricing pages, marketing-speak |

### Secondary persona: "Maker Maya"

| Attribute | Detail |
|---|---|
| **Role** | Indie hacker shipping multiple small projects |
| **Project count** | 3 to 8 active sites |
| **Tech stack** | Mix of Next.js, Astro, sometimes WordPress for content sites |
| **Spend tolerance** | $20 max per individual tool, but loves multi-site value |
| **Behavior** | Builds in public. Tweets weekly about projects. Will tweet a positive review unprompted. |

### Non-targets (explicit)

We are NOT building for:
- Marketing agencies managing client sites (different price, different features, different sales cycle)
- In-house SEO specialists at enterprises (need SAML, audit logs, RBAC, all out of scope)
- Non-technical content marketers (require GUI-only product, hand-holding, training)
- WordPress site owners (different ecosystem, different needs, different sales channels)
- E-commerce stores (Shopify SEO is its own category, deserves its own tool)

---

## 4. The Problem We Solve

### Current state for Solo Sam

- Sam ships a SaaS landing page. Maybe a blog. Maybe a docs site.
- Google sends some traffic but it is shrinking month over month.
- Sam reads that ChatGPT and Perplexity are now cited in 30%+ of searches.
- Sam Googles "how to rank in ChatGPT" and finds 10 different answers, none specific.
- Sam tries Profound, sees $499/mo pricing, bounces immediately.
- Sam tries free tools, gets a basic score and a list of generic suggestions.
- Sam does nothing because the path from "score" to "fixed site" is unclear.
- Sam ships another feature and ignores SEO for another 3 months.

### What is broken

1. **No tool combines audit + fix + AI search visibility in one workflow.** Each tool does one slice. Sam has to use 3-4 to get a complete picture.
2. **Existing tools are either too expensive ($499/mo Profound) or too shallow (free Lighthouse with no AI-SEO awareness).** Nothing serves the $29/mo developer tier.
3. **Audits give advice, not action.** "Improve your meta description" is not useful without the new meta description text.
4. **No tool treats AI search as a first-class concern.** SEO tools added "AI Tracker" as a feature. Nothing was built AI-first.
5. **No tool lives in the developer workflow.** Everything is a separate dashboard tab. Nothing in CI. Nothing in the IDE.

### Why now

Five forward bets from the strategic positioning doc inform this timing:
1. AI search displaces 30-50% of traditional Google search by 2027
2. Citation-based metrics replace click-based metrics within 24 months
3. `llms.txt` standard is emerging like robots.txt
4. Schema markup importance compounds as LLMs prefer structured data
5. E-E-A-T expands beyond Google to all AI engines

Tools built for this shift have a 12-18 month head start before SEO suites pivot. We claim that head start.

---

## 5. MVP Scope (What Ships in v1.0)

Fourteen features ship in v1.0. Every feature listed is mandatory. Every feature not listed is Phase 2 or rejected.

### Free tier (OSS + Free SaaS account)

| ID | Feature | Surface | Description |
|---|---|---|---|
| F1 | **Audit engine with three scores** | OSS package + Web | The 55-check framework. Returns SEO score, AEO score, GEO score, and Aggregate. Already shipped in OSS as v0.2.0. Web surface shows the same data visually. |
| F2 | **CLI commands** | OSS | `pnpm dlx @answerfox/cli audit <url>` and `explain <check_id>` and `init` and `add`. Already shipped. |
| F3 | **GitHub Action** | OSS | A reusable workflow at `answerfox/audit-action@v1` that runs on PR and comments score delta. Free for OSS use. |
| F4 | **Public score badge** | OSS + Web | Markdown-embeddable badge: `![Answerfox Score](https://answerfox.dev/badge/<domain>)`. Generates an SVG with the three scores. Caches 24 hours. Free distribution amplifier. |
| F5 | **Web dashboard (latest audit only)** | Web | Sign-in with GitHub or Google. View only the most recent audit for one site. No historical view. Re-audit rate limited to 3 per day. Sharpens the upgrade path: if you want to see how your site improves over time, you need Pro. |

### Pro tier ($29/month)

| ID | Feature | Surface | Description |
|---|---|---|---|
| F6 | **AI fix generation** | Web | For each failing check, click "Generate fix with AI". Returns a code patch, schema JSON-LD, meta tag, or content rewrite as appropriate. Downloadable as a `.patch` file or copyable as raw code. Quota: 90 fixes per month (delivered as 3 per day to prevent any single user from draining the shared AI quota). Includes queue + email notification system for rare cases when the global AI quota is exhausted. |
| F7 | **Audit history (30 days) + trends** | Web | Full audit history retained for 30 days. Trend graphs showing SEO, AEO, GEO score evolution. Findings diffs between audits ("you fixed A4 between Tuesday and Friday"). |
| F8 | **Multi-site (up to 3)** | Web | Track up to 3 sites under one Pro account. Each site has independent history, badge, and audit cadence. |
| F9 | **Scheduled daily audits** | Web + Worker | Pro sites are automatically audited every 24 hours by a background worker. Free users must manually trigger every audit. This is the single feature that turns Answerfox from a manual tool into passive monitoring. |
| F10 | **Weekly email digest** | Email | Every Monday morning, Pro users receive an email summarizing the past week: score changes per site, new findings, suggested fixes, AI fix usage remaining. Powered by Resend. |
| F11 | **Detailed evidence inspector** | Web | For each finding, Pro users see the full HTML evidence (raw matched markup), severity score breakdown, and fix history (which previous audits had this check passing or failing). Free users see summary description only. Power feature for users who want to understand the why. |

### Platform foundations (both tiers, infrastructure not sold as features)

These three features serve both tiers. They are not differentiators and do not appear on the pricing page. They exist because the product cannot function without them.

| ID | Feature | Surface | Description |
|---|---|---|---|
| F12 | **Authentication** | Web | OAuth via GitHub (primary) and Google (secondary). No email/password in v1. WorkOS AuthKit or Clerk for implementation. |
| F13 | **Billing** | Web | Stripe Checkout for Pro subscription. Webhook-handled subscription lifecycle. Cancel anytime. Annual option (15% discount). |
| F14 | **Site verification** | Web | Verify ownership of a site before adding to dashboard. Three methods: DNS TXT record, file upload at `/.well-known/answerfox-verify`, or HTML meta tag. |

**Total feature count: 14 (5 free + 6 paid + 3 platform foundations). That is all.**

---

## 6. Out of Scope for v1.0 (Explicit Rejection List)

Each of these is a future Phase 2 or Phase 3 feature. Including any of them in v1.0 delays launch. Do not let scope creep them in.

### Phase 2 (months 2 to 4)

| Feature | Why deferred | When ships |
|---|---|---|
| **AI citation tracking** (ChatGPT, Perplexity, Gemini queries) | High API cost per user. Hardest to engineer. Best as separate launch event. | Month 2 to 3, with Pro price bump to $39 (citation tracking included) |
| **Email and Slack alerts** | Needs queue, retry, template system. Better polished post-launch. | Month 2 |
| **Competitor monitoring** | Not a differentiator. Power feature for retention, not acquisition. | Month 3 |
| **Auto-PR generation in GitHub** | Studio tier feature. Needs deeper GitHub OAuth integration. | Month 3 to 4 (Studio launch) |
| **Studio tier ($99/month)** entirely | Spreads launches. Second monetization event. | Month 3 to 4 |
| **API access** (Studio tier) | Studio scope. Needs rate limiting, key management. | Month 3 to 4 |
| **Team accounts** (Studio tier) | Solo indies do not need teams. | Month 4+ |

### Phase 3+ (months 5+) or never

| Feature | Why deferred or rejected |
|---|---|
| White-label agency reports | Wrong customer |
| Enterprise SSO and SAML | Wrong customer (Profound's job) |
| Multi-language SEO | Add when at $300K ARR |
| Local SEO (Google My Business) | Different category, different tool |
| Backlink monitoring | Ahrefs' job, do not compete |
| Keyword research | Different tool category, partner do not build |
| Built-in CRM or marketing automation | Not our category |
| AI chat interface ("ask Answerfox anything") | Gimmicky, hurts focus |
| Browser extension | Not our customer's workflow |
| Mobile app | Audits are not a mobile use case |

---

## 7. Pricing Architecture

### Tier comparison (v1.0 launch state)

| Feature | Free (OSS + signup) | Pro ($29/month) |
|---|:-:|:-:|
| Audit engine + three scores (SEO + AEO + GEO) | ✅ | ✅ |
| CLI commands | ✅ | ✅ |
| GitHub Action | ✅ | ✅ |
| Public score badge | ✅ | ✅ |
| Web dashboard | ✅ Latest audit only, 1 site | ✅ Up to 3 sites |
| Re-audit on demand | ✅ 3 per day max | ✅ Unlimited |
| AI fix generation | ❌ | ✅ 90 per month (3 per day) |
| Audit history + trend graphs | ❌ | ✅ 30 days |
| Scheduled daily audits | ❌ | ✅ Auto, every 24 hours |
| Weekly email digest | ❌ | ✅ Every Monday |
| Detailed evidence inspector | ❌ | ✅ Full HTML evidence + fix history |
| Public leaderboard listing | ✅ Standard | ✅ Featured |

**The pricing page narrative is two completely different value propositions, not "Free with a few more things on Pro":**

- **Free is for verification.** You audit once, you see what is broken, you see the badge, you ship the fix yourself.
- **Pro is for monitoring + fixing.** Your sites are watched every day. You get a weekly digest. You see how scores trend. AI generates the fix code for you. You get full evidence per finding.

Sam looks at this and understands instantly: Free answers "is my site broken?". Pro answers "keep my site good without me thinking about it, and write the fixes for me when it is not".

### Pricing display strategy

| Element | Decision |
|---|---|
| Price anchoring | Show free first, Pro second. Do not show competitor prices on the pricing page. |
| Annual discount | 15% off ($29.40 monthly equivalent, billed at $295/year). Show savings as "save $54.60 per year" not as a strikethrough on monthly. |
| Trial | No free trial. Free tier is the trial. |
| Money-back | 14-day refund, no questions. |
| Currency | USD only at launch. EUR, GBP, INR added in Phase 2. |
| Tax handling | Use Stripe Tax. Inclusive pricing in EU and India. |

### Studio tier ($99/month) preview

Studio launches month 3 to 4 as Phase 2. Pricing page in v1.0 shows it as "Coming soon" with email capture for waitlist. Studio scope includes:
- Auto-PR generation (commits to user's GitHub repo)
- Team accounts (5 seats)
- API access (programmatic auditing)
- Unlimited fixes per month
- 10 tracked sites
- Citation tracking (when Phase 2 ships, Studio gets it first)
- Priority support

---

## 8. User Journeys (The 8 That Matter)

Each journey below is a fully-specified flow with success criteria. UX details (specific copy, screen layout) go in BRAND-BRIEF.md derived designs.

### Journey 1: Anonymous user runs CLI for first time

**Trigger:** Saw a tweet about Answerfox. Curious.
1. Runs `pnpm dlx @answerfox/cli audit https://mysite.com` in terminal
2. CLI fetches site, runs 55 checks, outputs three scores + findings + footer with `answerfox.dev` link
3. Terminal output mentions: "Sign up free at answerfox.dev to get AI-generated fixes for your failing checks"
4. User clicks link, lands on web dashboard

**Success criteria:**
- CLI runs in under 8 seconds end to end
- Three scores displayed prominently with severity color coding
- Top 3 failing checks shown with fix recommendation text from the OSS
- Footer link is the only marketing in the CLI output (no upsell during audit)

### Journey 2: First-time sign-up (free)

**Trigger:** Came from CLI footer link or direct from marketing site.
1. Lands on `answerfox.dev` homepage
2. Clicks "Sign in with GitHub" in top right or "Audit your site" in hero
3. OAuth flow completes in 2 clicks
4. Lands on onboarding: "Add your first site"
5. Enters URL → site verification options shown (DNS, file, meta tag)
6. Picks meta tag (fastest), pastes tag into their HTML, clicks Verify
7. Verification check runs, succeeds, audit triggers automatically
8. Sees three scores fill in (with motion) over 4 to 6 seconds
9. Sees findings list with severity grouping
10. Top of page has a "Generate fixes with AI" button (locked behind Pro)

**Success criteria:**
- Sign-up to first audit displayed in under 90 seconds end to end
- Zero confusing UI states (no "what do I do now?" moments)
- Pro upsell visible but not aggressive (single button, not modal)

### Journey 3: Free user converts to Pro

**Trigger:** User wants to generate AI fixes after seeing failing checks.
1. On audit details view, clicks "Generate fixes with AI"
2. Modal explains: "AI fixes are a Pro feature. $29 per month. 50 fixes included. Cancel anytime."
3. Click "Start Pro" → Stripe Checkout opens
4. Payment completes → redirected back to audit view
5. "Generate fixes" button now unlocked, click it
6. AI generates fixes for top 3 failing checks (or selected set)
7. Patches appear inline with diff syntax highlighting
8. Each patch has "Copy code" and "Download .patch" buttons

**Success criteria:**
- Total time from "click Generate fixes" to "fixes visible" under 60 seconds
- Stripe Checkout completes in under 45 seconds for credit card users
- Zero post-payment confusion (clear "you're in" state)
- Generated fixes are obviously useful (formatted, contextual, ready to apply)

### Journey 4: Pro user runs AI fix and re-audits

**Trigger:** User has fix in hand and applies it locally.
1. Copies the AI-generated meta tag
2. Pastes into their HTML, commits, deploys
3. Returns to dashboard, clicks "Re-audit"
4. New audit runs, shows score went from 64 to 78
5. History view shows diff: "A4 (canonical) and A3 (meta description) now passing"
6. Confetti or subtle celebration animation on score improvement (not over-the-top)
7. Email digest at end of week summarizes weekly improvements

**Success criteria:**
- Re-audit completes in under 8 seconds
- Score diff is clearly visualized (animated number change, color-coded)
- User feels rewarded without it being childish

### Journey 5: Score badge embedded on user site

**Trigger:** User wants to showcase good score publicly.
1. On dashboard, clicks "Get badge for this site"
2. Modal shows: Markdown snippet, HTML snippet, direct image URL
3. Three style options: Default (three scores in aurora gradient), Compact (single aggregate), Square (Twitter-card optimized)
4. User copies markdown
5. Pastes in their site footer or README
6. Badge renders on their site, shows current scores
7. Anyone clicking badge lands on Answerfox's public page for that domain
8. Public page shows current scores + "Audit your own site" CTA

**Success criteria:**
- Badge SVG generates in under 200ms (cached aggressively)
- Public landing page for each domain is shareable and indexable
- Conversion from badge click to signup is tracked (target: 2% to 5%)

### Journey 6: GitHub Action flagged a PR

**Trigger:** User added Answerfox GitHub Action to their CI.
1. Opens a PR that changes site HTML
2. Action runs, audits the preview deployment URL
3. Comments on the PR with: "Answerfox: SEO 91 (+0) | AEO 84 (-3) | GEO 71 (+5)"
4. If any score drops more than 5 points, leaves a warning comment with details
5. Optional: blocks merge until reviewed (configurable in workflow YAML)

**Success criteria:**
- Action runs in under 30 seconds total
- Comment is friendly, useful, not noisy
- Score changes are color-coded in the comment markdown
- Pro users get AI fix suggestions in the comment for new failures

### Journey 7: User cancels subscription

**Trigger:** User wants to stop paying.
1. Dashboard → Settings → Billing → "Cancel subscription"
2. Modal asks (single optional question): "Why are you cancelling?" (5 options + Other)
3. Confirms cancellation
4. Account immediately downgrades to Free at end of current billing period
5. Email confirmation sent
6. AI fix generation locked, audit history beyond 7 days hidden, multi-site reduced to first site

**Success criteria:**
- Cancellation flow is 3 clicks max, no friction games
- Users can cancel at any time of month, no proration drama
- Data is preserved (not deleted) so they can re-subscribe and pick up where they left off

### Journey 8: Returning user opens dashboard after one week

**Trigger:** User comes back after a week.
1. Lands on dashboard home
2. Sees: "Welcome back. Your site scored 87 (+3) since last week. 2 new findings."
3. Bento grid shows: Three current scores, trend chart, recent findings, AI fix count remaining this month
4. One prominent CTA: "Run a fresh audit" (or "Re-audit your site")
5. Side nav shows: Audits, Findings, AI Fixes, Settings

**Success criteria:**
- Dashboard load under 1.5 seconds
- Most recent and most actionable info above the fold
- Returning user immediately knows what changed since last visit

---

## 9. Feature Specifications (Detail)

### F1: Audit engine with three scores

**Owner:** OSS engine team (Anuj for v1)
**Status:** Shipping in v0.2.0 (Phase 1 week 1 work)
**Dependency:** Section 7.5 of STRATEGIC-POSITIONING.md

**Specification:**
- Each `Check<T>` in the registry has `engines: ('seo' | 'aeo' | 'geo')[]` field
- `computeScoresByEngine()` returns `{ seo, aeo, geo, aggregate }` where each is 0-100 integer
- `aggregate` is weighted average of the three (default equal weight, future: user-configurable)
- 5 new GEO-specific checks added (G1-G5 from strategic positioning section 7.5):
  - G1: `llms.txt` file present
  - G2: Content chunkability score
  - G3: Author byline visible on content
  - G4: Date markers (`datePublished`, `dateModified`) present and visible
  - G5: Citation-ready paragraphs (one factual claim per paragraph)
- Console reporter shows 3 score cards + aggregate
- JSON output includes `scores: { seo, aeo, geo, aggregate }`
- HTML report (via `--html`) shows three score bars with aurora gradient fills

**SaaS-specific surfacing:**
- Web dashboard shows the three scores as primary visual element (see BRAND-BRIEF.md Section 8)
- Score badge SVG renders all three scores
- Trend graphs (Pro feature) plot all three over time

### F2: CLI commands

**Owner:** OSS engine team
**Status:** Already shipping (v0.1.2). v0.2.0 adds three-score output.

**No additional v1.0 work** beyond what is already shipped in OSS, except:
- Update `audit` command output to include the new aurora-gradient ASCII score bars
- Add `audit --json` flag for CI integration (probably already exists, verify)
- Add `audit --signed` flag for signed-in CLI users (writes audit to their account if they have signed in via `pnpm dlx @answerfox/cli login`)

### F3: GitHub Action

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Published at `answerfox/audit-action@v1` in a public GitHub repo
- Inputs: `url` (required), `min-score` (optional, default none), `fail-on-decline` (optional, default false)
- Runs on `pull_request` and `push` events
- Authenticates via optional `ANSWERABLE_API_KEY` secret (links audit to user's SaaS account)
- Writes a PR comment with score delta from main branch
- Free version posts plain comment. Pro version posts comment with AI fix suggestions for new failures.
- Fails the action if `fail-on-decline: true` and any score dropped more than 5 points

**Out of scope:** GitHub App (deeper integration). Auto-fixing on commit (Studio tier, Phase 2).

### F4: Public score badge

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- URL: `https://answerfox.dev/badge/<domain>` returns SVG
- Three style variants via query param: `?style=full` (default, three scores), `?style=compact` (single aggregate), `?style=square` (Twitter card optimized)
- Cache: 24 hours via CDN headers
- Click-through behavior: SVG `xlink:href` wraps the badge so click goes to `https://answerfox.dev/site/<domain>`
- Public landing page at `/site/<domain>` shows: current three scores, last 30 days trend (if any), "Audit your own" CTA, "Run by [user] via Answerfox" footer if applicable
- Domain must be audited at least once before badge resolves (otherwise returns "Not yet audited" badge)

### F5: Web dashboard (latest audit only, free)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Free users see: their 1 site, their MOST RECENT audit only, three current scores, findings list (read-only)
- No history view at free tier. If a user wants to see how scores changed over time, the dashboard shows a teaser: "Upgrade to Pro to see 30-day trends"
- Pro users see: their up to 3 sites, last 30 days, trend graphs, AI fix interface, detailed evidence per finding (see F11)
- Layout: bento grid (per BRAND-BRIEF.md), three-score cards as primary tile
- Empty state for new accounts: prominent "Add your first site" with site verification flow
- Free tier re-audit: rate limited to 3 per day per site. Each re-audit overwrites the previous "latest" record (no history kept at free tier)
- Pro tier re-audit: unlimited (plus F9 scheduled daily audits run automatically)

### F6: AI fix generation

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Trigger: button on each failing check ("Generate fix with AI") or bulk action ("Generate fixes for all failing checks")
- Cost-gated at Pro tier: 90 fixes per month included (delivered as 3 per day, per user)
- AI backend: Gemini 3.5 Flash via Google AI Studio API (free tier at launch). Fallback to paid Gemini 3.5 Flash if we exhaust free quota at scale.
- Prompt structure: includes the check ID, the evidence from the audit, the page HTML context, and the desired output format (patch, JSON-LD, meta tag, or content)
- Output formats supported per check type:
  - Meta tags (title, description): plain text + HTML wrapper
  - Schema markup (Organization, FAQ, Product, etc.): JSON-LD code block
  - Content rewrites (B-series checks): markdown diff with old/new
  - Code patches (file-level): unified diff format
- Each generation shows: accept/discard, copy/download buttons
- Generated fixes stored for 30 days in user's account

### Quota strategy: 3 per day, 90 per month

The headline copy on the pricing page is **"90 AI fixes per month"**. The technical implementation is **3 fixes per day per user**. Both are true and feel generous.

**Why 3 per day, not 50 per month:**

The Gemini free tier has a global daily cap (around 500 requests per day across our whole product). If a single Pro user used 50 fixes in one day, they would consume 10 percent of the global daily quota by themselves. This would block other users.

By capping each user at 3 fixes per day:
- 100 Pro users × 3 max daily fixes = 300 fixes per day maximum across the product
- Well within 500 RPD free tier limit
- No new user is ever blocked because another user used too many
- Per-user counter is simple to display and understand

**Per-user quota UX:**

Pro users see a counter on the dashboard:
```
Daily AI fixes: 2 of 3 used today  (resets at midnight UTC)
```

After their 3rd fix that day, the "Generate fix" button is disabled with this message:
```
You have used your 3 daily AI fixes.
Resets in 4 hours, 23 minutes.
(Studio tier coming soon will offer unlimited fixes.)
```

### Global quota fallback: queue with email notification

In rare cases where the global Gemini free quota is exhausted (despite per-user limits, this could happen at higher scale), the system shows a queue instead of failing:

1. User clicks "Generate fix"
2. Application checks remaining global quota (tracked in our Redis/KV)
3. If sufficient quota: process immediately (5 second normal response)
4. If global quota exhausted: queue the request, save to database with status `queued`
5. User sees: "Our AI is at peak capacity. Your fix is queued and will be ready by [time]. We will email you the moment it is ready."
6. At midnight UTC when the Gemini quota resets, our background worker processes the queue in FIFO order
7. Each completed fix sends an email to the user with a link back to view it

**Queue UX during the wait:**

The user can navigate away from the page. The fix shows up in their dashboard with status `queued` until processed. They can cancel the queued request at any time (does not consume their daily quota).

**Cost economics:**
- Gemini 3.5 Flash free tier: $0 per fix
- Average fix: 2K input tokens + 500 output tokens
- At 3 daily fixes × 100 Pro users × 30 days = 9,000 fixes per month maximum
- Free tier covers approximately 15,000 fixes per month (500 RPD × 30 days)
- Comfortable headroom for first 150 Pro users
- Above 150 Pro users: switch to paid Gemini (~$10-25 per month total) or implement smarter queueing

### F7: Audit history (30 days)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Pro tier feature
- Database stores audits up to 30 days old, then auto-deletes (compliant with cost containment)
- Trend graphs: three lines (SEO, AEO, GEO) over 30 days, scrollable timeline
- Diff view: pick any two audits, see which checks changed status
- Annotations: user can add notes ("Deployed canonical fix on Friday")
- Export: CSV download of all audits in the 30-day window (Pro perk)

### F8: Multi-site (up to 3)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Pro users can add up to 3 sites
- Site switcher in top nav (dropdown)
- Each site has independent history, AI fix count, badge URL
- Adding 4th site shows upgrade prompt to Studio (when Studio launches)
- Sites can be deleted (with confirmation), data immediately purged

### F9: Scheduled daily audits (Pro)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Every Pro site is automatically re-audited every 24 hours
- Audit schedule jitters across the user base (not all run at midnight UTC) to spread infrastructure load
- User can pause auto-audits per site in settings
- User can change cadence per site: Daily (default), Twice Daily, or Hourly (the last requires Studio when launched)
- If a scheduled audit detects a score change of more than 5 points in any of the three engines, dashboard shows a banner: "Your AEO score dropped 8 points overnight. View what changed."
- Background worker infrastructure: scheduled jobs via Inngest, Trigger.dev, or self-hosted BullMQ (decide in TRD)
- Idempotency: if a scheduled audit fails (e.g., target site is down), retry once after 1 hour. If still failing, skip and log. Do not block tomorrow's run.
- Cost containment: each audit costs ~$0.0005 of compute. At 75 Pro users x 3 sites x 30 days = 6,750 audits/month = ~$3.40 in costs. Negligible.

### F10: Weekly email digest (Pro)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Every Monday at 09:00 in the user's local timezone (fallback UTC)
- Email contains: summary of each Pro site (current 3 scores + delta vs last week), top 3 new findings, AI fix usage (X of 50 used), one call-to-action (e.g., "Generate fixes for your 2 newest findings")
- Template: minimal HTML, designed in Aurora color system. Plain text fallback always shipped alongside.
- Sender domain: `digest@answerfox.dev` (with proper SPF/DKIM/DMARC)
- Email service: Resend (primary). Postmark as fallback if Resend fails twice.
- Unsubscribe: prominent one-click link at the bottom. Unsubscribing only affects this email, not transactional ones.
- Skip rule: if all sites are unchanged (no audits ran, no findings, no fixes), skip the email that week (no value)
- Out of scope for v1: HTML email A/B testing, multiple digest cadences, daily digest option

### F11: Detailed evidence inspector (Pro)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- On any audit findings list, Pro users see an "Inspect" button per finding
- Clicking opens a side panel from the right with:
  1. Full raw HTML evidence (the markup our checker matched against)
  2. Severity breakdown explaining why this is critical/high/medium/low (severity weight, point impact)
  3. Fix history: if this check failed in past audits, when did it pass last? When did it start failing? Mini timeline.
  4. Links to related checks (e.g., A4 canonical might link to D1 about, F5 og:url)
- Free users see "Inspect" button but clicking shows: "Detailed evidence is a Pro feature. Upgrade to see exactly what is broken."
- Layout: glass panel over animated mesh gradient (per BRAND-BRIEF.md)
- No write actions in the panel except "Generate fix with AI" button (which is F6 Pro feature)

### F12: Authentication (Platform Foundation)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- OAuth via GitHub (primary, matches developer audience)
- OAuth via Google (secondary)
- No email/password in v1 (avoid magic link complexity, password reset flows)
- Session: HTTP-only cookie, JWT-based, 30 day rolling expiry
- Implementation: WorkOS AuthKit or Clerk (decide in TRD)

### F13: Billing (Platform Foundation)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Stripe Checkout for subscription creation
- Stripe Customer Portal for subscription management (cancel, update card, view invoices)
- Webhook handlers: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Annual billing toggle on pricing page (15% discount)
- Failed payment recovery: 3 retry attempts over 7 days, then auto-downgrade with email
- Stripe Tax for inclusive pricing in EU/India

### F14: Site verification (Platform Foundation)

**Owner:** SaaS team
**Status:** To be built

**Specification:**
- Three verification methods (user picks one):
  1. **HTML meta tag**: `<meta name="answerfox-verify" content="<token>">` in `<head>`
  2. **File upload**: `/.well-known/answerfox-verify` returns plain text `<token>`
  3. **DNS TXT record**: `TXT @answerfox-verify=<token>` (longest, but for users who cannot edit HTML)
- Verification check: HTTP fetch + content match. Times out at 10 seconds.
- Token expires after 7 days if not verified
- Once verified, badge of trust shown on dashboard ("Verified site")

---

## 10. Success Metrics

### North Star metric
**Active Pro subscribers count.** Single number that captures product-market fit. Tracked weekly.

### Acquisition funnel

| Stage | Target Month 1 | Target Month 3 |
|---|---|---|
| GitHub stars on OSS repo | 500 | 1500 |
| Weekly npm downloads | 2K | 8K |
| Marketing site weekly visitors | 800 | 3K |
| Free SaaS signups (weekly) | 50 | 150 |
| Free to Pro conversion | 8% | 12% |
| Active Pro subscribers | 25 | 75 |
| MRR | $725 | $2,175 |

### Engagement metrics

- **DAU/MAU ratio:** target 25% (good for B2B SaaS)
- **Audits per Pro user per week:** target 3+ (means they care)
- **AI fixes generated per Pro user per month:** target 8 to 15
- **Re-audits after fix:** target 70%+ (proves the fix is useful)

### Retention metrics

- **30-day Pro retention:** target 85%
- **90-day Pro retention:** target 70%
- **Annual Pro retention:** target 60%
- **Churn rate (monthly):** target under 5%

### Quality metrics

- **NPS at 30 days:** target +40 or higher (good for early product)
- **Support ticket rate:** target under 5% of MAU/month
- **P0 bug count:** target 0 in first 7 days, under 3 in first 30 days

---

## 11. Launch Plan

### Pre-launch checklist (from STRATEGIC-POSITIONING.md Section 8)

Do not launch until ALL of these are green:

- [ ] OSS repo has 200+ GitHub stars
- [ ] CLI has 5,000+ weekly npm downloads
- [ ] Docs site is live and beautiful (Nextra build fixed)
- [ ] Web dashboard MVP works end to end
- [ ] Stripe billing works (test mode validated)
- [ ] AI fix generation (via Gemini 3.5 Flash) works for at least 10 check types
- [ ] AI fix queue + email fallback tested under load
- [ ] Per-user daily quota (3 fixes/day) enforcement tested
- [ ] Global quota monitoring + alerts configured (alert at 80% of daily limit)
- [ ] 50 beta users have used the SaaS and given feedback
- [ ] At least 3 testimonial tweets exist from real users
- [ ] Launch video is recorded and edited (60 to 90 seconds)
- [ ] Launch tweet thread is written
- [ ] PH hunter is identified and aligned
- [ ] First-day FAQ responses are pre-drafted
- [ ] Status page is live (`status.answerfox.dev`)
- [ ] Support email or Discord is staffed for launch day

### Soft pre-launch activities (4 weeks before official launch)

| Week | Activity |
|---|---|
| -4 | Tweet `pnpm dlx @answerfox/cli audit twitter.com` and post the result |
| -3 | Audit 10 famous sites (Vercel, Stripe, Linear, Notion) and tweet results with screenshots |
| -2 | Write 3 dev.to or Hashnode posts: technical deep dives on the audit framework |
| -1 | Submit to Hacker News with a Show HN post |
| 0 | Official ProductHunt launch + Twitter blast |

### Launch day (day 0)

**Timing:** Launch on a Tuesday at 00:01 PT (best PH timing).

**6 AM:** Final smoke test of all flows. Status page green.
**00:01:** PH post goes live. Hunter is aligned.
**00:05:** Tweet thread fires from main account, replies from supporting accounts.
**00:10:** Announce on relevant Discords (Indie Hackers, dev community).
**06:00:** First wave of responses to PH comments (have pre-drafted FAQs).
**12:00:** Update PH with traction milestone.
**18:00:** Final wave of social pushing.
**24:00:** Day-end recap tweet, thanks supporters.

**Day 0 success criteria:**
- 200+ upvotes on PH (target top 5 of day)
- 500+ Twitter impressions on launch thread
- 100+ new SaaS signups
- 5+ Pro conversions in first 24 hours

### Post-launch (first 30 days)

| Week | Focus |
|---|---|
| Week 1 | Bug fixes from launch traffic. Personal replies to every PH comment. Daily Twitter updates with new audits. |
| Week 2 | Write "What we learned" blog post. Reach out to first paying users for interviews. |
| Week 3 | First retention email campaign. Announce roadmap (citation tracking coming next). |
| Week 4 | Month 1 metrics review. Decide Phase 2 priorities based on user feedback. |

---

## 12. Risk Mitigation

### Top 11 risks ranked by impact x likelihood

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | AI fix generation costs spiral with usage | Medium | High | Cap fixes per Pro user at 50/month. Use Haiku for simple, Sonnet for complex. Aggressive prompt caching. Monitor weekly. |
| 2 | Launch traffic crashes the SaaS infrastructure | Medium | High | Pre-launch load test (target 10x expected). Use Vercel + Neon (auto-scaling). Have a static fallback. |
| 3 | Competitor (Profound) launches indie tier in response | Low | High | Move fast. They will not pivot to OSS. Stay differentiated. |
| 4 | ProductHunt launch flops (under 100 upvotes) | Medium | Medium | Soft launch HN first to validate. Build hunter relationships in advance. Have backup launch plan for ShowHN-only. |
| 5 | OSS engine has critical bug found at launch | Medium | High | Beta test for 4 weeks with 50 users. Have rollback ready. Monitor Sentry on day 1. |
| 6 | Stripe billing webhook fails to update subscriptions | Low | High | Stripe webhooks are well-tested. Use Stripe CLI for local testing. Have manual reconciliation script ready. |
| 7 | A spam abuser hammers the audit endpoint | High | Medium | Rate limit by IP + user. Cloudflare in front. Use Upstash Redis for rate limit state. |
| 8 | User confuses Free vs Pro features and complains | High | Low | Clear pricing page, clear in-app tier badges, friendly upgrade prompts. Refund any confused user no questions. |
| 9 | Scheduled audit worker infrastructure fails or scales poorly | Medium | Medium | Use Cloudflare Workers Cron Triggers (free tier sufficient). Jitter audit times across users to spread load. Monitor worker health. Have manual re-trigger fallback. Limit scope to 3 sites per Pro user at v1. |
| 11 | Gemini free tier quota exhausted globally during peak usage | Medium | Medium | Per-user daily quota (3 fixes per day per Pro user) prevents single-user drainage. Queue + email notification handles rare global exhaustion. Upgrade to paid Gemini (~\\$15/mo) once free tier no longer comfortable. Cost tracking dashboard alerts at 80% of free tier usage. |
| 10 | Weekly email digest hits spam folders or has poor deliverability | Medium | Medium | Use Resend with proper SPF, DKIM, DMARC setup. Send from a custom domain. Monitor bounce rate. Provide plain-text fallback. Test across multiple email clients during beta. |

### What we accept as known risks

- **Citation tracking absence at launch** is a known weakness. We accept this because adding it would delay launch by 4-6 weeks and the launch story is strong without it. Phase 2 launch will close this.
- **Limited free tier (1 site, 7 days history)** may frustrate some users. Acceptable because Pro tier is cheap and the conversion is the goal.
- **OAuth-only sign-in** may exclude some users without GitHub or Google accounts. Acceptable because the target persona has both.

---

## 13. Phase 2 Roadmap Preview

Phase 2 begins after v1.0 launch success criteria are met (75 paying users, $2K+ MRR).

### Phase 2.1: Citation Tracking (month 2 to 3)

- Track 20 user-defined queries weekly across ChatGPT, Perplexity, Google AI Overviews
- Show citation feed with raw AI responses (clickable evidence)
- Charge a small Pro price bump to $39/month (citation tracking included)
- Major marketing event (re-launch on HN, dev.to writeup, "Update v1.1" tweet)

### Phase 2.2: Alerts + Competitor Monitoring (month 3)

- Weekly email digest (default Pro feature)
- Slack webhook integration (Pro feature)
- Score drop alerts (configurable threshold)
- Add up to 3 competitor sites to track alongside your own

### Phase 2.3: Studio Tier Launch (month 3 to 4)

- New $99/month tier
- Auto-PR generation in GitHub (commits AI fixes directly)
- Team accounts (5 seats)
- API access for programmatic auditing
- Unlimited AI fixes
- 10 tracked sites
- Priority email support

### Phase 3 indicators (after $10K MRR)

- Hire first contractor or part-time team member
- Add EUR/GBP/INR currency support
- Consider acquisition or fundraising conversations
- Add deeper framework support (Astro, Remix specifics)
- Translation: multi-language SEO support

---

## 14. Open Questions for Resolution

These are decisions deferred to the TRD or beta testing phase.

| # | Question | Owner | Deadline |
|---|---|---|---|
| 1 | Auth provider: WorkOS AuthKit or Clerk? | Anuj | TRD |
| 2 | Hosting: Vercel + Neon + R2 or alternative? | Anuj | TRD |
| 3 | Should Free tier allow audit history of 7 days OR no history (only latest)? | Anuj | After 20 beta users tested |
| 4 | Default theme: dark only at launch, or both with toggle? | Anuj | After design system review |
| 5 | Should we offer annual billing at launch or post-launch? | Anuj | 2 weeks before launch (depends on revenue need) |
| 6 | What does "1 site" mean for Free tier - per email or per token? | Anuj | After site verification flow built |
| 7 | Should public leaderboard be opt-in or opt-out for verified sites? | Anuj | Before badge feature ships |
| 8 | Do we need a Discord/community at launch? | Anuj | 1 week before launch |

---

## 15. Anti-Goals (What This Product Does NOT Try To Be)

Important reminders for when scope creep tries to slip in:

- **Answerfox is not a generalist SEO tool.** It does not do keyword research, backlink analysis, or competitor backlink mining.
- **Answerfox is not an AI assistant.** It does not have a chat interface or ask-anything functionality.
- **Answerfox is not a writing tool.** It generates fixes for SEO findings, not blog posts or marketing copy.
- **Answerfox is not a CRM.** It does not manage leads, contacts, or customer relationships.
- **Answerfox is not an analytics tool.** It does not track page views, conversions, or user behavior.
- **Answerfox is not a hosting platform.** It does not deploy or host sites.
- **Answerfox is not a code editor.** It does not let you edit code in the dashboard.

If a feature request would push the product toward any of these, the answer is no.

---

## 16. The Definition of Done for v1.0

The MVP is "done" when:

- All 14 features (F1-F14) are implemented and tested
- All 8 user journeys can be completed end to end without bugs
- 50 beta users have used the product for at least 7 days
- At least 3 of those beta users converted to Pro voluntarily
- All success metrics from Section 11 pre-launch checklist are met
- Both STRATEGIC-POSITIONING.md and BRAND-BRIEF.md guidelines are followed in product copy and design
- The PRD self-review (next section) has been completed and signed off

---

## 17. The Single Sentence (One More Time)

> Answerfox is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.

Every feature in this PRD reinforces at least one of the three pillars. Every metric measures progress against this sentence. If you find yourself building something that does not, stop and ask why.

---

**Locked: 2026-05-20**
**Next document: `docs/internal/TRD-V1.md`** (technical architecture, to be written after PRD approval)
**Companion: `docs/internal/STRATEGIC-POSITIONING.md`** (the why)
**Companion: `docs/internal/BRAND-BRIEF.md`** (the look and voice)
