# Answerfox Roadmap

> Source of truth for what's shipping when. Updated 2026-06-08.
> Companion: `TECH-STRATEGY.md` (stack decisions), `SESSION-HANDOFF.md` (60-sec recap), `SPRINT-STATUS.md` (current sprint state).

---

## Status snapshot

- **v0.2.2 shipped** (June 2026): CLI on npm with `af` alias, 33 of 50 SEO/AEO/GEO checks, MIT, 7 composable packages
- **apps/web Days 1-3 shipped**: landing page on Next.js 15 with the ported v3.4 bloom engine
- **Validation sprint in progress**: 20 cold emails sent, 3 LinkedIn DMs sent, r/SideProject filtered, Show HN gated, awaiting reply signal Mon-Tue

---

## The 6-week shipping plan (June 8 to July 20, 2026)

### Week 1 (Jun 8-14): v0.3.0 Agent Readiness DETECTION
- **CLI / packages**:
  - 6 new audit checks added to `@answerfox/audit` for category G (Agent Readiness):
    - G1: MCP Server Card at `.well-known/mcp/server-card.json`
    - G2: A2A `agent-card.json` at `.well-known/agent-card.json`
    - G3: API Catalog (RFC 9727) at `.well-known/api-catalog`
    - G4: `agent-permissions.json`
    - G5: OAuth Authorization Server Metadata (RFC 8414) at `.well-known/oauth-authorization-server`
    - G6: WebMCP form annotations on at least 1 form
  - Score line updates from "33 of 50" to "39 of 56 checks active"
  - Bump to **v0.3.0** on npm via OIDC Trusted Publishing
  - CHANGELOG entry, README update
- **apps/web**:
  - Landing page copy updates: "Agent Readiness coming" becomes "Agent Readiness shipped, try `npx @answerfox/cli audit your-site`"
  - Add 3rd demo audit row comparing Stripe vs Anthropic vs Vercel on the 6 G checks
- **Out**: scaffolding (writing the manifest files) deferred to v0.3.1

### Week 2 (Jun 15-21): v0.3.1 Agent Readiness SCAFFOLDING + apps/web Day 4
- **CLI**: `af add agent-card` scaffolds `agent-card.json` with smart defaults pulled from `package.json` and site analysis. Same for the other 5 manifests.
- **New package**: `@answerfox/agent-manifests` for the templates
- **apps/web Day 4**: Supabase project + Drizzle schema + first migration. Schema includes `profiles`, `sites`, `audits`, `findings`, `agent_readiness_scores`.

### Week 3 (Jun 22-28): apps/web Day 5 + Dashboard MVP shell
- **Auth**: Supabase GitHub OAuth via `@supabase/ssr` + sign-in page (matches TRD-V1 §6.3)
- **Dashboard MVP shell**: minimal pages showing "your last audit run", "your sites", "agent-readiness score over time" chart placeholder
- **Observability**: Sentry DSN + PostHog key wired
- Goal: someone who signs up sees a real product, not a "coming soon" wall

### Week 4 (Jun 29 - Jul 5): Continuous audit + diff view
- Scheduled audit runs via Supabase pg_cron or Edge Functions
- Diff view: "what changed between last 2 audits" (the killer feature for monitoring)
- Email alerts when score drops below threshold (Resend or Postmark)
- This is the first feature that gives someone a reason to log in repeatedly

### Week 5 (Jul 6-12): Stripe billing IF paid signals real, ELSE Agent-Preference Analytics MVP
- **Path A (paid signal confirmed by then)**: Stripe + 2 plans (Free OSS, Pro $19/mo with continuous audit + alerts + 5 sites)
- **Path B (no paid signal yet)**: start Agent-Preference Analytics MVP (referrer + user-agent tracking for AI bots, dashboard showing "ChatGPT sent you N visits this week, Perplexity N, Claude N")

### Week 6 (Jul 13-19): Real Launch
- Product Hunt launch using `PH-LAUNCH-PACK.md`
- Show HN attempt (HN karma built by then through daily comments)
- Cold mail v2 to the 26 X-only contacts skipped (now from a "we shipped continuous audit + agent analytics" position)
- LinkedIn announcement post

---

## Q4 2026 (Oct - Dec): Agent-Preference Analytics depth

If Week 5 Path B happens (or A succeeds), build out the analytics layer:

- Per-agent referrer breakdown (ChatGPT, Perplexity, Gemini, Claude, You.com, Phind)
- Detect when AI products cite your URL (Perplexity API integration, ChatGPT search citations)
- Server log integration (parse access logs for AI user-agents)
- Conversion measurement: human-from-agent click-through behavior
- Pitch: "Google Analytics for AI agents"

By Q4, 10-20% of any site's traffic should be AI-mediated. People will want to see it. This becomes the high-margin SaaS surface.

---

## 2027 bets

Three innovation bets for the year. Each is a separate product surface or major feature.

### Bet 1: MCP Tool Selection Optimization (Q1-Q2 2027)
**Why this timing**: MCP registry has 10K+ servers, 97M monthly downloads (mid 2026). Selection accuracy collapses 43% to 2% as tool count grows from 4 to 51. By Q1 2027 the problem is obvious to MCP server publishers.

**What to build**:
- Audit your MCP server card for "selection readiness"
- Optimize tool descriptions, naming, semantic clustering, examples
- "SEO for MCP tools"
- Sister tool to Answerfox or new feature line

### Bet 2: Agent Trust / Identity Layer (Q2-Q3 2027)
**Why this timing**: Agent-to-agent commerce starting (Stripe Agentic Commerce, OpenAI agent payments). When agents transact for users, sites need to prove "I'm safe to transact with" AND verify "the agent talking to me is legitimate."

**What to build**:
- Trust manifests (signed `agent-card.json` with reputation history)
- Site identity verification (think SSL but for agent interactions)
- Reputation scoring across agent products
- Agent-side verification helpers

**Highest upside, highest risk** because dependent on agent commerce actually scaling.

### Bet 3: AI-Aware Content Negotiation (Q2-Q3 2027)
**Why this timing**: Multi-modal multi-purpose agents become standard. Agents request content in formats optimized for use case (chat answer vs tool use vs booking form).

**What to build**:
- Audit + scaffold content negotiation layers
- Generate alternative content formats automatically
- Like responsive design, but for agent purpose, not screen size

---

## Future watchlist (not yet bets)

Things to track but not commit to:

- Agent rate limiting / quota manifests (small feature, late 2027)
- Privacy manifests for agents (compliance layer)
- AI-aware analytics with real conversion attribution (covered by Bet 1 extensions)
- Synthetic content marketplaces (sites paying to seed AI training data)
- Voice-first / multimodal manifests (Alexa, Siri, Vision Pro)
- DIDs (Decentralized Identifiers) for agents (covered partially by Bet 2)
- Authoritative source signaling (cryptographically signed E-E-A-T)

---

## Decision rules

| Trigger | Action |
|---|---|
| 1+ paid-intent reply from cold mail / outreach this week | Build v0.3.0 (already planned) on schedule. Path A for Week 5 (Stripe). |
| Zero paid signals, but 30+ GitHub stars + 5+ thoughtful issues | OSS resonating. Path B for Week 5 (Analytics MVP). Re-pitch SaaS in 4 weeks. |
| Zero signal across the board | Reposition. Smaller wedge. Maybe pivot focus to Sipcode. |
| MCP ecosystem clearly crowded (>20K servers in registry) | Pull Bet 1 forward |
| Agent commerce announcement from major player | Pull Bet 2 forward |

---

## Anti-roadmap (NOT building)

Per office-hours validation rule, NOT building speculatively:

- "Rank my MCP server" without paid demand evidence
- ATO (Agentic Trust Optimization) buzzword products without real customers
- Multi-page crawler before single-page audit is exhaustive
- ML-based content quality scoring before structural checks are complete
- Mobile app
- Self-hosted enterprise tier
- Whitelabel reseller

---

## How this doc gets updated

- After each weekly ship: update "Status snapshot" + check off completed items
- After each major decision (path A vs B, pull-forward bets): edit the relevant section
- Every Tuesday morning: SPRINT-STATUS.md syncs into this doc
- See TECH-STRATEGY.md for stack and language decisions
