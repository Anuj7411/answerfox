# Answerable — Strategic Positioning & Uniqueness Doctrine

**Status:** Committed direction. Locked 2026-05-20.
**Owner:** Anuj Ojha
**Purpose:** Resolve the OSS-vs-SaaS confusion once and for all. Define what Answerable is, who it is for, how it makes money, and what makes it un-copyable. Every product, marketing, and engineering decision flows from this document.

---

## 1. The One Sentence

> **Answerable is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.**

If this sentence stops being true, we have lost. Every feature, page, tweet, and PR is judged against it.

---

## 2. The Decisions That Are Locked

| Decision | Locked answer | Why |
|---|---|---|
| **Success goal** | Solo lifestyle business — $5-20K MRR in 18-24 months | Optimizes for sustainability + freedom, not VC growth |
| **Primary customer** | Indie developers / solo founders building Next.js/Astro/Remix products | Already in the dev workflow we want to occupy |
| **Business model** | OSS engine (free forever) + Hosted SaaS (the revenue engine) | Resolves the "OSS vs SaaS" false choice |
| **License strategy** | MIT today → AGPL on cloud-critical packages when needed | Protects against AWS-style cloud cloning while keeping community trust |
| **AI-fix-as-code** | MVP must-have | This is the magic moment that wins ProductHunt and conversions |
| **Unified SEO/AEO/GEO scoring** | Ships in v0.2.0 (Phase 1, week 1) | Core differentiator. Not marketing copy — actual three-score engine output. |
| **Pricing tiers** | Free OSS · Pro $29/mo · Studio $99/mo | Lowest viable for indie devs; competitive vs Otterly ($29) |
| **NOT competing with** | Profound (enterprise), Peec (mid-market), HubSpot AEO (CRM lead-gen) | Different customers, different price points |
| **What we don't build** | Agency white-label · Multi-user teams (v1) · Enterprise SSO · Marketing CRM | Focus is the weapon |

---

## 3. The Three Pillars

These are the only three things that make Answerable Answerable. Every feature must reinforce at least one pillar.

### 🔓 Pillar 1 — Open Source First

**What it means:** The audit engine, the 50-check framework, the CLI, the GitHub Action — all MIT-licensed (or AGPL for cloud-protected parts later). Anyone can fork, self-host, contribute checks, and verify our claims.

**Why it wins:** Every funded competitor (Profound $155M, Peec $29M, Otterly) is closed source. Their investors will not let them open up. We are structurally un-copyable on this axis. They cannot follow without disappointing their cap tables.

**What this gives us:**
- **Free distribution.** Every `pnpm dlx @answerable-kit/cli` is a marketing event we paid nothing for.
- **Trust at zero cost.** Developers verify code before they trust products. We pass that test automatically.
- **Community moat.** Once we have 100 contributors, the moat is permanent.
- **The Lighthouse playbook.** Lighthouse is free, OSS, and dominates the conversation — that brand position is more valuable than any single feature.

**Translation:** Open source is not charity. It is the cheapest, most defensible distribution strategy available to a solo founder.

---

### ⚙️ Pillar 2 — Lives In Your Codebase

**What it means:** SEO checks are installed via `npm` / `pnpm`, run in CI, gate PRs, and surface failures inside the editor. They are first-class citizens in the developer workflow — not a separate dashboard you tab into.

**Why it wins:** Profound, Peec, Otterly all live in browser tabs. Marketers love that; developers ignore that. By the time a marketer sees a bad Lighthouse score on Profound, the developer has already committed bad code. We catch it at commit time.

**What this gives us:**
- **Workflow lock-in without friction.** Once `answerable audit` is in someone's CI, removing it is friction. Adding it costs 30 seconds.
- **Marketing channel = GitHub.** Every public GitHub repo using us is a billboard.
- **CI integration tells us when sites change.** This is the cheapest possible "what changed?" signal.
- **Differentiation that's hard to copy.** A GUI tool would need to rewrite as a CLI to follow us. Their UX team won't allow it.

**Translation:** We don't ship "another dashboard." We ship `pnpm install` and `gh action add`.

---

### 🤖 Pillar 3 — Ships Fixes As Code

**What it means:** When the audit finds a problem, the AI doesn't just say "fix your meta description." It writes the actual new meta description, generates the JSON-LD, drafts the FAQ schema — and outputs a downloadable diff, a `git apply` patch, or an auto-opened PR.

**Why it wins:** Every competitor monitors and advises. Nobody fixes. This is the gap. Surfer rewrites content but locks it in their editor. Profound tells you "improve E-E-A-T" with no code. Answerable opens a PR.

**What this gives us:**
- **The ProductHunt magic moment.** "Audit → PR → ranked in 90 seconds" is a 30-second video that goes viral on dev Twitter.
- **Activation > monitoring.** Users see value in turn 1, not turn 5.
- **AI cost as feature.** Customers pay us $29 to spend Claude API tokens on their behalf. We handle the prompt engineering, caching, and provenance.
- **Lock-in.** Once a customer has accepted 50 AI-generated PRs, switching to a tool that just shows charts feels like a downgrade.

**Translation:** Monitoring is a graph. Fixing is a magic show. We ship the magic show.

---

## 4. How OSS and SaaS Integrate (The Question That Was Confusing You)

This is the section you came here for. Read it slowly.

**You are not picking between OSS and SaaS. They are two access modes for one product.**

```
                    ┌──────────────────────────────────────┐
                    │           ANSWERABLE                  │
                    │   (one product, two access modes)     │
                    │                                       │
                    │   ┌─────────────────────────────────┐ │
                    │   │ FREE TIER (Open Source)         │ │
                    │   │                                  │ │
                    │   │ • `pnpm dlx @answerable-kit/...` │ │
                    │   │ • Audit engine (50 checks)       │ │
                    │   │ • CLI (audit, explain, init)     │ │
                    │   │ • GitHub Action                  │ │
                    │   │ • Public check framework         │ │
                    │   │ • Self-host everything           │ │
                    │   │                                   │ │
                    │   │ Cost to us: ~$0 per user         │ │
                    │   │ Job: Distribution + trust         │ │
                    │   └─────────────────────────────────┘ │
                    │                  ▲                    │
                    │                  │                    │
                    │                  │  same engine        │
                    │                  │  same brand          │
                    │                  │  same values          │
                    │                  ▼                    │
                    │   ┌─────────────────────────────────┐ │
                    │   │ PAID TIERS (Hosted SaaS)         │ │
                    │   │                                  │ │
                    │   │ Pro $29/mo:                      │ │
                    │   │ • All free features              │ │
                    │   │ • AI fix generation (we pay      │ │
                    │   │   Claude API)                    │ │
                    │   │ • Hosted scheduling + history    │ │
                    │   │ • AI citation tracking           │ │
                    │   │ • Email/Slack alerts             │ │
                    │   │ • 3 competitor sites monitored   │ │
                    │   │                                  │ │
                    │   │ Studio $99/mo:                   │ │
                    │   │ • Auto-PR generation in GitHub   │ │
                    │   │ • API access                     │ │
                    │   │ • 100 tracked queries            │ │
                    │   │ • Team accounts (5 seats)         │ │
                    │   │                                   │ │
                    │   │ Job: Pay the bills                │ │
                    │   └─────────────────────────────────┘ │
                    └──────────────────────────────────────┘
```

### The flywheel

```
                        more npm downloads
                                ▲
                                │
                                │
   more SaaS revenue ──▶ more time to improve OSS
        ▲                       │
        │                       ▼
        │              more contributors
        │                       │
        │                       ▼
        │              more public GitHub repos using us
        │                       │
        │                       ▼
        │              more dev Twitter mentions
        │                       │
        │                       ▼
        │              more website visits
        │                       │
        │                       ▼
   more SaaS conversions ◀──── more free signups
```

**OSS without SaaS = unsustainable.** You burn out giving away value with nothing coming back.

**SaaS without OSS = uncredible.** Indie devs don't trust closed black boxes; you compete with $155M-funded incumbents.

**OSS + SaaS = lifestyle business that compounds for a decade.**

### The "but won't they just self-host?" answer

Some will. About 20%. Those people are:
- Your QA testers (they find bugs and file PRs)
- Your evangelists (they recommend you on Twitter and in Discord servers)
- Your future team leads (they bring Answerable into their company budget next year)
- Your contributors (they write the next 17 audit checks for free)

The 80% who pay $29/month do so because they:
- Don't want to manage their own Anthropic API key
- Don't want to set up Postgres + cron + email + queue infrastructure
- Don't want to keep their audit history in scattered JSON files
- Don't want to query ChatGPT/Perplexity APIs themselves (too expensive at solo scale)
- Want a dashboard with history, trends, and shareable links

**You are not competing with self-hosters. You are competing with their time.** Time always wins.

---

## 5. The Integration Story — How Features Connect

This is what makes Answerable feel like ONE product instead of a feature checklist.

### The user journey (the magic 90 seconds)

```
1. Developer reads a tweet about Answerable.
   ↓
2. Runs `pnpm dlx @answerable-kit/cli audit mysite.com` in terminal.
   ↓
3. Sees terminal output: score 64/100, 8 failing checks, fix recommendations.
   ↓
4. Curious about AI-fix feature → clicks link → signs up (free).
   ↓
5. Web dashboard shows the same audit, but visually.
   ↓
6. Clicks "Generate fixes with AI" → asks for $29 to unlock.
   ↓
7. Pays $29 → AI generates 8 code patches in 30 seconds.
   ↓
8. Downloads the patches → applies → re-runs audit → score 91/100.
   ↓
9. Tweets the before/after with Answerable badge → marketing happens.
   ↓
10. Citation tracker (background, weekly) detects ChatGPT now cites the site.
    ↓
11. User sees this notification → recommends Answerable to other founders.
```

Every step reinforces the three pillars. Every step is something competitors don't do end-to-end.

### How the parts integrate

| Feature | Free / Paid | Reinforces pillar |
|---|---|---|
| Audit engine (50 checks) | Free | OSS + Lives in codebase |
| `pnpm dlx` CLI | Free | Lives in codebase |
| GitHub Action | Free | Lives in codebase |
| Public check spec on website | Free | OSS |
| Hosted audit history | Paid | (convenience layer) |
| AI fix generation | Paid | **Ships fixes as code** |
| Auto-PR creation | Paid (Studio) | **Ships fixes as code** + Lives in codebase |
| Citation tracking | Paid | (data we provide because users can't easily DIY) |
| Public leaderboard | Free (badge) + Paid (featured) | OSS (community building) |
| Score history charts | Paid | (convenience layer) |
| Competitor monitoring | Paid | (data convenience) |
| Email/Slack alerts | Paid | (convenience layer) |
| Self-hosting docs | Free | OSS |

**Nothing is here that doesn't tie to a pillar.** That is what discipline looks like.

---

## 6. What Makes Us Unique (vs Every Competitor)

| | Profound | Peec AI | Otterly | Surfer | HubSpot AEO | vanshh_ai demo | **Answerable** |
|---|---|---|---|---|---|---|---|
| Open source | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| CLI / npm install | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| GitHub Action | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Audit framework spec public | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Reproducible audit | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| AI-fix-as-code | ❌ | ❌ | ❌ | partial | ❌ | vapor | **✅** |
| Auto-PR to GitHub | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| Indie pricing (<$30) | ❌ | ❌ | ✅ | ❌ | ✅ free | ? | **✅** |
| Citation tracking | ✅ | ✅ | ✅ | ✅ | ✅ | vapor | **✅** |
| **Unified SEO + AEO + GEO scoring** (3 scores, 1 tool) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Total unique check ✅** | 1 | 1 | 2 | 1 | 2 | 0 | **10** |

**Answerable has 10 differentiators. The next closest competitor has 2.**

That is what "stand unique in market" actually looks like when you write it down.

---

## 7. Future-Proof Bets (Where The Puck Is Going)

We're not just building for today's market. These are the 5 bets that will compound through 2027-2028.

### Bet 1: Citation-based ranking > click-based ranking (high confidence)
By 2027, "how often you're cited in AI responses" will be a more important metric than "how often you're clicked from Google." OpenAI and Anthropic will never expose click data, but citation frequency is reverse-engineerable. We bet our citation tracker on this.

### Bet 2: `llms.txt` becomes standard (medium-high confidence)
Like `robots.txt` for LLMs. Sites will publish a `/llms.txt` declaring their intent for AI crawlers. We will be the first audit tool to check for it, score it, and generate it. **This is a free win — add a check for it now.**

### Bet 3: Schema markup importance increases (high confidence)
LLMs prefer structured data over scraped HTML. Sites with rich schema win citations. Our 8 JSON-LD generators are already a strategic asset. Triple down.

### Bet 4: E-E-A-T expands beyond Google to all AI engines (high confidence)
Personal bios, expert pages, author bylines, and verifiable credentials become first-class ranking factors across ChatGPT, Perplexity, Claude. We will score them across the board.

### Bet 5: SEO becomes a programming concern, not a marketing concern (medium-high confidence)
The line between "developer" and "SEO specialist" blurs as schema, performance, and AI-readiness become code-level concerns. We are the first tool built for this shift. We will be a category creator if we move fast enough.

---

## 7.5. SEO + AEO + GEO Coverage (The Unified Scoring Doctrine)

This is the differentiator no competitor has. Read this section twice.

### The three optimization games

| Term | Stands for | What it optimizes for | Example |
|---|---|---|---|
| **SEO** | Search Engine Optimization | Rankings on Google/Bing — the 30-year game | "How do I rank #1 for 'best React framework'?" |
| **AEO** | Answer Engine Optimization | Featured Snippets, "People Also Ask," voice assistants, AI chatbot answers | "Siri, what's the best React framework?" → Siri reads YOUR answer aloud |
| **GEO** | Generative Engine Optimization | Citations *as a source* in generative AI responses — ChatGPT, Perplexity, Gemini, Claude, Copilot | ChatGPT writes "Next.js is recommended by [yoursite.com] for…" |

### How they relate

```
                   ┌─────────────────────────────────────┐
                   │           SEO (broadest)            │
                   │   Google rankings, page speed,      │
                   │   keywords, backlinks, meta tags    │
                   │                                     │
                   │   ┌─────────────────────────────┐   │
                   │   │   AEO (answer-shaped SEO)   │   │
                   │   │  Featured Snippets, voice,  │   │
                   │   │  Q&A formatting, schema     │   │
                   │   │                             │   │
                   │   │  ┌────────────────────────┐ │   │
                   │   │  │  GEO (AI-source SEO)   │ │   │
                   │   │  │  ChatGPT/Perplexity    │ │   │
                   │   │  │  citations, llms.txt,  │ │   │
                   │   │  │  chunkability, E-E-A-T │ │   │
                   │   │  └────────────────────────┘ │   │
                   │   └─────────────────────────────┘   │
                   └─────────────────────────────────────┘
```

GEO is a subset of AEO. AEO is a subset of SEO. But each has unique tactics. A site can have great SEO and terrible GEO (e.g., excellent backlinks but no `llms.txt`, no schema, no E-E-A-T signals).

### How Answerable's 50-check framework maps

Every check is tagged by which engine type it serves. Most checks serve multiple. The mapping:

| Category | Total checks | SEO | AEO | GEO | Notes |
|---|---|---|---|---|---|
| A — Meta & technical | 10 | 10 | 10 | 10 | Foundation — all three care |
| B — Content & chunking | 11 | 7 | **11** | **11** | "Chunking" is literally a GEO term |
| C — Structured data | 10 | 8 | **10** | **10** | Schema is mandatory for AEO/GEO |
| D — E-E-A-T & authority | 12 | 8 | 10 | **12** | E-E-A-T is THE GEO ranking factor |
| E — Off-site citations | 8 | 5 | 6 | **8** | Brand mentions drive AI citations |
| F — OpenGraph & social | 7 | 7 | 3 | 3 | Mostly traditional social SEO |
| **TOTALS** | **50** | **45** | **50** | **54** | (some checks count for multiple engines weighted) |

### What the user actually sees

Instead of one score, three scores. Side by side. With sub-explanations:

```
Audit · https://mysite.com

╭─ Overall ───────────╮  ╭─ SEO ──────────────╮  ╭─ AEO ──────────────╮  ╭─ GEO ──────────────╮
│                     │  │                     │  │                     │  │                     │
│      87 / 100       │  │      92 / 100       │  │      83 / 100       │  │      71 / 100       │
│      Strong         │  │      Excellent      │  │      Strong         │  │      Average        │
│                     │  │                     │  │                     │  │                     │
╰─────────────────────╯  ╰─────────────────────╯  ╰─────────────────────╯  ╰─────────────────────╯

You score well on traditional SEO. Your AI search visibility (GEO) lags behind —
3 fixes would close the gap. Run: pnpm dlx @answerable-kit/cli explain GEO
```

Now the user knows *exactly* where to focus. A SaaS founder probably wants GEO. A blog wants AEO. A doc site wants all three. **One tool. Three honest scores. No misleading aggregate.**

### Why this is uncopyable in the short term

To copy this, a competitor would need to:
1. Build (or buy) a 50+ check framework
2. Research which engine type each check serves
3. Implement the tagging system
4. Rebuild their UI to show three scores
5. Get their marketing team to stop using their existing single-term branding ("AI search visibility")

That's a 6-12 month project for a funded team. By then we own the term **"unified AI-SEO scoring"** in the developer community. They'd be following us, not the other way around.

### The 5 GEO-specific checks we ship in v0.2.0

To make the GEO column real, not just a label, we add these to the existing 33 checks:

| New check | What it checks | Why GEO cares |
|---|---|---|
| **G1: `llms.txt` present** | File at `/llms.txt` with sitemap-style content for LLMs | Emerging standard, like robots.txt for AI |
| **G2: Content chunkability** | Sections under 200 words, clear H2/H3 hierarchy, no JS-rendered content | LLMs retrieve in chunks; un-chunked content gets ignored |
| **G3: Author byline present** | Each content page has visible `byline`/author | E-E-A-T signal, LLMs cite attributed content more |
| **G4: Date markers visible** | `datePublished` + `dateModified` in schema + visible on page | Freshness is a major AI ranking factor |
| **G5: Citation-ready paragraphs** | Each paragraph makes one factual claim with optional source | LLMs lift paragraph-shaped content directly |

After v0.2.0: **38 checks shipped of an expanded 55-check framework** (50 original + 5 GEO). Coverage rises from 63% to 69% of points.

---

## 8. The ProductHunt Strategy

### Why ProductHunt is a fit

- Audience: indie devs, founders, AI tools, dev tools — exactly our customer
- Launch dynamics: dev tools with magic-moment demos win
- Cost: free + we already have the OSS proof points
- Timing: AI-SEO is hot, but no OSS player has launched on PH yet

### The launch artifact

**Title:** *Answerable — Open-source AI-SEO that ships fixes as code*

**Tagline:** *Audit your site for ChatGPT, Perplexity & Google. AI generates the fixes as a GitHub PR. 50+ checks. $29/mo or self-host free.*

**Video (60-90 seconds):**

```
[0:00] Terminal: pnpm dlx @answerable-kit/cli audit mysite.com
[0:05] Output: 64/100. 8 failing checks. Color-coded.
[0:10] Cut to web dashboard showing same audit visually
[0:20] Click "Generate fixes with AI"
[0:22] 8 code patches appear with diffs
[0:35] Click "Open as PR on GitHub"
[0:40] GitHub PR opens in new tab. Files changed: 6.
[0:50] Cut: re-run audit. Score: 91/100. Excellent.
[0:55] Caption: "Open source. $29/mo. Or self-host free.
       Made by one developer. Try it: answerable.io"
[1:00] End card with logo.
```

### The launch checklist (do NOT launch until all green)

- [ ] OSS repo has 200+ GitHub stars (proves community is real)
- [ ] CLI has 5,000+ weekly npm downloads (proves distribution works)
- [ ] Docs site is live and beautiful (no broken Nextra build)
- [ ] Web dashboard MVP works end-to-end
- [ ] Stripe billing works
- [ ] AI fix generation works for ≥10 check types
- [ ] 50 beta users have used the SaaS and given feedback
- [ ] At least 3 testimonial tweets exist from real users
- [ ] Launch video is recorded and edited
- [ ] Launch tweet thread is written
- [ ] PH hunter is identified and aligned
- [ ] First-day responses to comments are pre-drafted (FAQs)

### Soft pre-launch (before official PH day)

- [ ] Tweet `pnpm dlx @answerable-kit/cli audit twitter.com` and post the result
- [ ] Audit 10 famous sites (Vercel, Stripe, Linear, Notion, etc.) and tweet results
- [ ] Write 3 dev.to / Hashnode posts: technical deep dives on the audit framework
- [ ] Get 5 dev influencers to test the tool privately
- [ ] Submit to Hacker News *before* PH (different audience, gives momentum)

---

## 9. What We Will NOT Build (Discipline Through Subtraction)

The features we don't build are as important as the ones we do. Each rejected feature is a focus victory.

| Rejected feature | Why we don't build it |
|---|---|
| **White-label agency reports** | Marketing agencies are not our customer. Build this if/when we have $500K ARR. |
| **Multi-user team accounts (v1)** | Solo indies don't need teams. Add at $200K ARR. |
| **Enterprise SSO / SAML** | Profound's job. We are explicitly not enterprise. |
| **Real-time AI citation polling** | Too expensive. Weekly batched is honest and sufficient. |
| **Custom dashboards / widgets** | Opinionated UX beats flexible UX. Pick one good view; defend it. |
| **CRM / marketing automation integrations** | Not our customer's workflow. |
| **Mobile app** | Audits are not a mobile use case. |
| **Multi-language SEO support (v1)** | English-first. Add when we have $300K ARR. |
| **Local SEO (Google My Business etc.)** | Different category. Different tool.  |
| **Backlink monitoring** | Ahrefs' job. We don't compete there. |
| **Keyword research** | Different tool category. Partner with one, don't build. |
| **Built-in marketing CRM** | Not our category. |
| **AI chat interface ("ask Answerable anything")** | Gimmicky. Our value is structured audits, not chat. |
| **Browser extension** | Not our customer's workflow. CLI is. |

**Every rejected feature above is a feature competitors will spend engineering on. While they're distracted, we deepen the three pillars.**

---

## 10. The Concrete Next 90 Days

This is the executable plan that flows from this positioning. Each phase is a single PRD.

### Phase 1 — Polish the OSS (weeks 1-3)

Goal: make the OSS credible enough to underpin paid SaaS. The first week is the differentiator-engine work; weeks 2-3 are polish.

**Week 1 — Ship SEO/AEO/GEO unified scoring (v0.2.0). FIRST. Before anything else.**

This is the differentiator. Everything else builds on this engine output, so it must land first.

- Day 1: Add `engines: ('seo' | 'aeo' | 'geo')[]` field to `Check<T>` interface in `@answerable-kit/core`
- Day 1: Tag all 33 existing checks with the engines they serve in `@answerable-kit/audit` registry
- Day 2: Add `computeScoresByEngine()` to runner — returns `{seo, aeo, geo, aggregate}`
- Day 2: Update `consoleReport()` to render three score boxes + aggregate (see Section 7.5 mockup)
- Day 3: Add 5 GEO-specific checks (G1-G5 from Section 7.5): `llms.txt`, content chunkability, author bylines, date markers, citation-ready paragraphs
- Day 4: Update CLI output formatting and `pnpm dlx @answerable-kit/cli audit` command
- Day 5: Update `AUDIT-FRAMEWORK.md` spec; ship v0.2.0 (minor bump because of new exported field)

**Week 2 — Polish + new public artifacts**

- Generate HTML report output from CLI (`--html report.html`) — must show three scores
- Fix the Nextra docs site build (currently broken)
- Update README and docs site with new positioning sentence and SEO+AEO+GEO explanation
- Add ProductHunt-quality landing page (visual design — separate work)

**Week 3 — Content and momentum**

- Write 1 launch-quality blog post: "Why I open-sourced an AI-SEO toolkit" (with SEO/AEO/GEO scoring breakdown)
- Audit 10 famous sites (Vercel, Stripe, Linear, Notion, etc.) with the new three-score system; tweet results
- Reach out to 5 dev influencers for private beta access
- Submit to Hacker News with the three-score angle

**Outcome:** OSS feels like a real, polished, *unique* product. 500+ GitHub stars achievable. The differentiator is live and demonstrable, not marketing copy.

### Phase 2 — Build the SaaS MVP (weeks 4-8)

Goal: ship the minimum viable paid product that delivers the magic moment.

- Web app on Next.js 15 with auth (Clerk or WorkOS)
- Stripe billing ($29/mo Pro tier only — Studio is post-MVP)
- Hosted audit dashboard with score history
- AI fix generation for the 10 most common check failures
- Downloadable patch + "Copy as code" + (basic) GitHub PR integration
- Sentry + Axiom for observability

**Outcome:** A working SaaS that can take payments and deliver value.

### Phase 3 — Soft launch and iterate (weeks 9-12)

Goal: 20-50 paying users; validate before ProductHunt.

- Onboard 20 hand-picked beta users (your existing followers, dev Twitter contacts)
- Capture feedback, fix the top 5 friction points
- Add citation tracking feature (ChatGPT only at first; expand later)
- Write the launch video script
- Build the ProductHunt launch page

**Outcome:** Ready for ProductHunt launch on Day ~90. 50+ users. 3+ testimonial tweets. Real revenue.

### Then: ProductHunt launch (day 91+)

Use the launch checklist in section 8. Expect 200-500 new free users from PH alone. Convert 10-15% to Pro = 20-75 new paying users. Push toward 100 paying / $3K MRR by month 6.

---

## 11. The Promise You Are Making (Read This Daily)

If you stay true to this document for the next 18 months, here is what will be true:

1. **You will be the only OSS player in a $300M-funded category.** That is rare. That compounds.
2. **You will own the "AI-SEO for developers" position** before anyone else stakes it.
3. **You will have a flywheel where OSS feeds SaaS and SaaS feeds OSS** — both grow together.
4. **You will be uncopyable** because your moat is community + brand + dev-mindshare, none of which money buys quickly.
5. **You will run a solo profitable business** that compounds without burning you out.

This is what success looks like. Not raising $20M. Not headlines. **A tool developers love, used in thousands of CI pipelines, generating predictable revenue, that you control.**

---

## 12. The Failure Modes (Read This Monthly)

Things that will kill this strategy. Watch for them.

| Failure mode | Warning sign | How to avoid |
|---|---|---|
| **Feature creep** | "Just one more category"... | Re-read section 9 monthly |
| **Audience drift** | Marketing copy starts addressing "marketers" | Re-read section 2 |
| **Closing the source** | Investor or revenue pressure says "go closed" | You said no when it was tempting; say no again |
| **Pricing inflation** | "We could charge more" | $29 is your weapon. Hold it. |
| **Building for the wrong magic moment** | Adding chat interfaces, AI assistants, etc. | Magic moment is **audit → PR**. Stay focused. |
| **Comparing yourself to Profound** | Anxiety about their feature velocity | Different game. Different prize. |
| **Burning out on community** | Resentment over OSS contributions | Treat community as a flywheel, not unpaid labor. Recognize, celebrate, do not over-invest. |
| **Ignoring trends** | Missing `llms.txt`, multimodal, etc. | Re-read section 7 quarterly. |

---

## 13. The Single Sentence (One More Time)

> **Answerable is the only open-source AI-SEO toolkit (SEO + AEO + GEO unified) that lives in your codebase and ships fixes as code.**

Pin this on your wall. Make it the top of your Twitter bio. Put it in every README. Say it in every interview.

It is the answer to every strategic question you will have for the next 18 months.

---

**Locked: 2026-05-20**
**Next review: 2026-08-20** (90-day review checkpoint)
**Next document: `docs/internal/PRD-V1.md`** (to be drafted)
