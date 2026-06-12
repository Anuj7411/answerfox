# Answerfox Pricing & Tiers — LOCKED 2026-06-12

> **Single source of truth for all pricing and tier discussions.** When PRD-V1 §7 and STRATEGIC-POSITIONING §7.6 disagree with this file, this file wins. Edit here first, propagate to other docs second.

## Locked tier prices

| Tier | Monthly | Annual (15% off) | Notes |
|---|---|---|---|
| **Free** | $0 | $0 | OSS + 1-site SaaS account, forever |
| **Pro** | $29 | $295 | Launches with Stripe wiring, target Aug 2026 |
| **Studio** | $69 | $703 | **First 100 customers grandfathered at $69 lifetime.** Customer #101+ pays $89. Launches Q3 2026 |

### Why $69 (not $99)

- Sits between Otterly's $29 (basic monitoring) and Peec AI's ~$95 (mid-market visibility). Below the $79/$99 SaaS pricing psychology barrier
- Pro→Studio ratio is 2.4x (clear tier upgrade, not a leap)
- Easier to raise from $69 to $89 later than to start at $99 and discount
- First-100 grandfather creates scarcity narrative + rewards early adopters; we can publicly cite "X / 100 grandfather seats remaining" as social proof

### Annual discount math

- Pro: $29 × 12 × 0.85 = $295.80 → list as $295/year ("save $53")
- Studio: $69 × 12 × 0.85 = $703.80 → list as $703/year ("save $125")

### Trial and refund

- **No free trial.** The Free tier IS the trial
- **14-day refund**, no questions

## Locked feature distribution

### 🟢 FREE — OSS + 1-site SaaS

| ID | Feature | Surface |
|---|---|---|
| F1 | Audit engine with **four scores + Aggregate**: SEO + AEO + GEO + Agent Readiness. Target 55+ checks by v1.0 (currently 39, expanding via v0.5 + v0.6) | OSS + Web |
| F2 | CLI: `audit`, `explain`, `init`, plus 7 manifest scaffolders | OSS |
| F3 | GitHub Action (`answerfox/audit-action@v1`) | OSS |
| F4 | Public 4-score badge | OSS + Web |
| F5 | Web dashboard: 1 site, latest audit only, 3 re-audits/day | Web |

### 🟠 PRO $29/mo — Monitor + AI fix

| ID | Feature |
|---|---|
| F6 | AI fix generation (90/mo) — covers all 55+ checks including AR manifest content |
| F7 | 30-day history + 4-line trend graphs (SEO/AEO/GEO/AR) |
| F8 | Multi-site (up to 3) |
| F9 | Scheduled daily audits + AR-regression alerts |
| F10 | Weekly digest (AR section included) |
| F11 | Detailed evidence inspector with raw `.well-known/*` HTTP responses |

### 🟣 STUDIO $69/mo — Automate (Q3 2026, first 100 grandfathered)

| Feature |
|---|
| **Auto-PR with manifest fixes** (GitHub App opens PR with `agent-card.json`, `llms.txt`, etc.) |
| API access |
| Team accounts (5 seats) |
| Unlimited AI fixes |
| 10 sites |
| Hourly auto-audit |
| Agentic commerce coverage (x402, UCP, ACP, MPP detection, v0.6+) |
| Vendor / competitor AR tracking |
| Citation tracking (Phase 2.1) |
| Priority support |

### ⚙️ Platform foundations (both tiers, infrastructure)

F12 Auth (Supabase + GitHub/Google OAuth), F13 Billing (Stripe), F14 Site verification (DNS/file/meta).

## Locked check framework expansion

| Version | Checks added | Total | Cloudflare parity |
|---|---|---|---|
| v0.4.0 (shipped) | G1-G6 Agent Readiness | 39 | 6 of 16 |
| **v0.5.0** (~Jul 2026) | A11 sitemap.xml, A12 RFC 8288 Link headers, A13 AI bot rules, C3 Markdown content negotiation, C4 Content Signals, G7 llms.txt, G8 Web Bot Auth | 46 | 13 of 16 |
| **v0.6.0** (~Aug 2026) | H1 x402, H2 UCP, H3 ACP, H4 MPP (Agentic Commerce category) | 50 | **16 of 16 (full parity)** |
| v1.0 (Oct 2026) | Polish + 5 more from community PRs | 55+ | Compounding |

After v0.6 we cover everything Cloudflare covers **plus 34 checks they don't** (A1-A10 meta/technical classic, B1-B14 content quality, C1-C2 schema, D1-D6 trust, E1-E11 off-site citations, F1-F7 OpenGraph/social, G2 A2A agent-card, G4 agent-permissions, G6 WebMCP form annotations).

## Locked positioning

### Hero copy (replaces "open-source AI-SEO toolkit")

> **The Agent Readiness toolkit. Open source.**
> Audit, scaffold, and auto-PR the manifests that make your site discoverable to AI agents.
> Lives in your repo. Ships fixes as code. Covers SEO, AEO, and GEO too.

### Pricing-page narrative

- **Free verifies.** One audit, four scores, the badge. Open source.
- **Pro $29/mo monitors and AI-writes the fix.** Daily scans, 30-day trends, AI generates the patch.
- **Studio $69/mo automates.** Auto-PR lands the manifest fixes in your repo. *First 100 customers locked at $69 lifetime.*

### Competitive frame (for sales conversations)

| | Cloudflare AR Score | Profound | Peec AI | Otterly | **Answerfox** |
|---|---|---|---|---|---|
| Price | Free | $499/mo | ~$95/mo | $29/mo | **$29 / $69** |
| Scoring | ✅ 16 checks | ✅ Visibility | ✅ Visibility | ✅ Basic | ✅ 55+ checks |
| In-repo audit | ❌ (CDN-side) | ❌ | ❌ | ❌ | **✅ CLI** |
| Generates fixes | ❌ | ❌ | ❌ | ❌ | **✅ AI fix + scaffold** |
| Auto-PR with fix | ❌ | ❌ | ❌ | ❌ | **✅ Studio** |
| Customer | All (CDN users) | Enterprise | Mid-market | Indie | **Solo devs + indie SaaS** |

## Locked timeline (aggressive, public launch Aug 2026)

| Week | Date | Ship |
|---|---|---|
| Week 2 (now) | Jun 13-22 | v0.5.0 phase 1 (A11 sitemap, G7 llms.txt) + start scaffolders + landing page refresh |
| Week 3 | Jun 23-29 | v0.5.0 phase 2 (Link headers, AI bot rules, Web Bot Auth, Content Signals, Markdown negotiation). Pricing page live. |
| Week 4 | Jun 30 - Jul 6 | Stripe wired, Pro paywall, soft-launch invite-only to ~30 hand-picked devs |
| Week 5-6 | Jul 7-20 | Auto-PR feature for Studio. Iterate on Pro feedback. v0.6.0 commerce checks. |
| Week 7-8 | Jul 21 - Aug 3 | Studio tier soft-launch with first-100-grandfather. Show HN. |
| Week 9-12 | Aug 4-31 | Iterate. Phase 3 prep. ProductHunt prep (day 91+). |

## Decision rules (kept honest)

- **If <3 paying users by end of Week 6** (Jul 13): pivot positioning to narrower wedge (e.g. "for MCP server publishers only"), not Path B Analytics MVP
- **If Cloudflare ships an in-repo CLI / GitHub Action**: accelerate auto-PR to v0.5.x and lead all marketing with it (the only thing they can't match without a code-write product)
- **If MCP registry exceeds 20K servers before Q4 2026**: pull §7.6 Bet #1 (MCP Tool Selection Optimization) into v0.7 instead of Q1 2027

## Anti-roadmap (do NOT build)

Per PRD §15 + §7.6 anti-roadmap, do not propose:
- White-label agency reports / reseller program
- Enterprise SSO/SAML at launch
- Multi-language SEO at launch
- Local SEO (Google My Business)
- Backlink monitoring
- Keyword research
- Built-in CRM/marketing automation
- AI chat interface ("ask Answerfox anything")
- Browser extension
- Mobile app
- Real-time citation polling (weekly batched is honest enough)
- Custom dashboards / widget builders
- "Rank my MCP server" feature without paid demand evidence
- Self-hosted enterprise tier
