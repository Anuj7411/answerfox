# Answerfox Feature Roadmap and Framing Decision

Date: 2026-07-13
Author: strategy session (Claude Opus 4.8)
Status: DECISION DOC for founder approval. Do not start implementation until approved.
Scope: evaluates the three-pillar reframe (Answerability + Agent-actionability +
Compliance-as-code), categorizes the 4 Track 1 candidates, and sets a phased build order.

Grounding sources read: `docs/internal/SESSION-HANDOFF.md`,
`docs/internal/PRODUCT_IDEAS_RESEARCH_2026-07-11.md`, `CLAUDE.md`, `git log` (30),
the `apps/web/src/lib` tree, and 30+ cited web sources (Step 4, indexed at the bottom).
Wiring claims below were verified by symbol-level grep, not memory.

---

## 1. Current feature surface, mapped to pillars

Legend: WIRED = reachable at runtime. PARTIAL = built, named gap. ORPHAN = zero
non-test callers (confirmed by exact-symbol grep).

### The cross-cutting delivery rail (Answerfox's real asset)

| # | Module | Files / commit | Status |
|---|--------|----------------|--------|
| 1 | Audit engine | `packages/audit` (`@answerfox/audit`), used at `api/cron/audit-sweep/route.ts:48` | WIRED |
| 2 | Validated-edit contract | `src/lib/edits/{apply,diff,validate,types}.ts` (`e3d9751`) | WIRED |
| 3 | AI edit generation (PR path) | `src/lib/ai/generate-edits.ts`, gemini-2.5-flash, validate-and-retry x3 (`f14a6a9`) | WIRED |
| 4 | Fix-PR pipeline | `src/lib/github/run-fix-pipeline.ts` to `create-fix-pr.ts` to Inngest `open-fix-pr` (`ea1d2d2`, `ce4ecda`) | WIRED |
| 5 | GitHub App + webhook | `src/lib/github/{app-client,verify-signature,webhook-events}.ts`, `api/github/webhook` | WIRED |
| 6 | Proof-of-Fix | `src/lib/proof/run-proof.ts` to Inngest `post-proof` (`a1f8efa`) | WIRED |
| 7 | Drift Guard | `src/lib/drift/run-drift.ts` to Inngest `check-drift` (`4cabc8b`) | WIRED |
| 8 | Stack detection | `src/lib/stack/detect-stack.ts` via `resolve-target-path.ts` (`f2dc0bb`) | WIRED |
| 9 | Repo to site linking | `sites.repoFullName` + `db/link-repo-site` (`a87cab5`) | WIRED |
| 10 | Entitlement gate | `src/lib/entitlement/decide-entitlement.ts` (`f2e5c00`) | PARTIAL: decision wired, **no Stripe checkout exists anywhere in `apps/web`** |
| 11 | Score-drop alerts | `audit/should-alert.ts` + `email/send-alert.ts`, fired by cron | WIRED |
| 12 | Agent-visit analytics | `analytics/classify-agent.ts` + `agent-visits` table + `api/track/visit` | WIRED |
| 13 | Public badge + report | `badge/render-svg.ts` (`/badge/[domain]`), `/site/[domain]` | WIRED |

### Answerability engines (the current core)

| # | Module | Files / commit | Status |
|---|--------|----------------|--------|
| 14 | X-Ray orchestrator | `src/lib/xray/run-xray.ts` (crawler-view vs rendered-view diff, money pages, render cache) (`b9d5180`, `398d16d`) | **ORPHAN** (`runXrayForPage`/`runXrayForSite` = 0 callers) |
| 15 | Agent Answer Simulation | `src/lib/agent-answer/run-agent-answer-test.ts` (answerability score + gap-to-fix map) (`1052b32`, newest) | **ORPHAN** (`runAgentAnswerTest` = 0 callers) |
| 16 | Dashboard manual AI-fix | `generate-fix.ts` (meta/jsonld/file/rewrite/patch artifacts) via `ai-fix-actions.ts`, quota-gated | WIRED, but split: dashboard uses the artifact generator, the PR pipeline uses the validated-edit generator (module 3). Two unmerged fix paths |

### Onboarding

| # | Module | Files / commit | Status |
|---|--------|----------------|--------|
| 17 | Onboarding orchestrator | `src/lib/onboarding/onboard-site.ts` (install to repo to site created/linked/audited) (`21b03c8`) | **ORPHAN** (`onboardSiteFromRepo` = 0 callers; its own header says "No UI here") |

### Pillar map of what exists today

| Pillar | What exists | Depth |
|--------|-------------|-------|
| 1. Answerability | Audit engine, X-Ray (orphan), Agent Answer Sim (orphan), badge (Agent Readiness x/8), agent-visit analytics, public report | Thick, but 2 of 3 hero engines do not run |
| 2. Agent-actionability | `audits.agent_readiness_score` column, badge metric, Agent Answer Sim as the seed | Thin. It measures whether an agent can answer, not whether it can complete a task (no signup/checkout simulation) |
| 3. Compliance-as-code | Nothing | Empty |
| Cross-cutting rail | Validated-edit to fix-PR to proof to drift to stack-detect to entitlement to GitHub App | The moat. Pillars are check-packs on one rail |

Load-bearing fact: `audits.agent_readiness_score` and the badge already lead with
"Agent Readiness x/8". The agent-readiness frame is partly in the schema and the public
surface already, before any reframe copy ships.

---

## 2. Framing verdict: CONFIRM the three pillars, with one sequencing correction

Verdict: the three-pillar reframe is **correct as a destination**, on one condition:
the pillars are coherent only because they share the fix-as-code rail and the
"an AI or agent is the user" frame. Marketed as three separate scanners (AEO + AX + a11y)
it reads as a bag of features. Marketed as one mechanism (everything an AI needs to find,
use, and legally trust your site, shipped as pull requests) it reads as one product.

The evidence that confirms it:

- **No competitor owns even two of the three pillars as fix-as-code.** Across 30+ tools,
  none open pull requests into the customer repo. AEO tools monitor and report
  (Profound, Peec, Otterly, Ahrefs, Semrush). The most execution-forward push to hosted
  surfaces, not the repo: Goodie deploys schema/feed fixes via API to storefronts
  (higoodie.com/features/ai-optimization-actions), Scrunch AXP rewrites crawler infra at
  the CDN (scrunch.com/platform/agent-experience). Accessibility incumbents are overlays,
  scanners, or human-services. Only TestParty ships accessibility fixes as GitHub PRs, and
  only for that one pillar (testparty.ai).
- **The "fix-as-code in the repo" lane is structurally open in every pillar.** That is the
  through-line the reframe is built on, and it is unclaimed.

The correction: **do not lead with accessibility.** Lead with Answerability +
Agent-actionability, where fix-as-code is completely unclaimed and the category is still
forming. Attach Compliance/accessibility as the expansion pillar. Reason in section 4c.

---

## 3. Per-candidate verdict and integration plan

### Candidate 1: Accessibility-as-code (WCAG 2.1 AA / EN 301 549) -> Pillar 3
- Extends or new: reuses the rail wholesale (audit to validated-edit to fix-PR to proof to
  drift). New work = an accessibility check-pack in `packages/audit`, an accessibility
  statement generator (new module, shaped like `badge/render-svg`), and new
  `findings.category`/`checkId` values. `findings.category` is free text, so **no
  migration** for the findings themselves.
- Pillar effect: fills the empty Pillar 3. Reinforces the story (same "ship fixes as
  code," now against a legal deadline).
- Verdict: **INTEGRATE, but sequence LAST (v1.x).** Research doc rated it "strongest of
  Track 1" and "near re-skin of Answerfox machinery," 4-6 week build. The competitive
  reason to sequence it last is in 4c: it is the one pillar with a real fix-as-code
  competitor (TestParty).
- If INTEGRATE: new table `accessibility_statements(id, site_id, wcag_level, generated_at,
  url, published)`. Findings reuse the existing table. New screens: a11y tab on site
  detail, statement preview/publish. PR paths: reuse `run-fix-pipeline` with a11y edit
  templates (alt text, ARIA labels, contrast tokens, label association). Edge cases:
  contrast fixes touch design tokens, so route hosted-CMS sites to suggestion mode via the
  existing stack detection; non-automatable WCAG criteria must stay diagnostics, never PRs
  (the code's own rule at `onboard-site.ts` header, referenced as section 10.5).

### Candidate 2: Agent-operability / AX -> Pillar 2
- Extends or new: directly extends the orphaned Agent Answer Simulation (module 15) from
  "can an agent answer" to "can an agent complete a task" (signup, pricing lookup,
  checkout). New work = a task runner + task-success scoring over time; fixes emit
  `llms.txt`, `agents.md`, and structured action endpoints (the `packages/templates` and
  `packages/metadata` packages already exist to host these).
- Pillar effect: turns thin Pillar 2 real. Reinforces, and it is the widest competitive
  whitespace (see 4b).
- Verdict: **INTEGRATE, sequence SECOND (v1.0), after wiring the orphan.** The research doc
  said "FOLD INTO ANSWERFOX, not a standalone company," which is exactly this reframe.
- If INTEGRATE: new tables `agent_answer_reports(id, audit_id, score, raw)` and
  `agent_task_runs(id, site_id, task, outcome, run_at)`. Screens: AX panel on site detail
  with a task-success trendline. PR paths: scaffold `llms.txt`/`agents.md` via the edit
  contract. Edge cases: task sims spend real agent tokens, so reuse the hash/render cache
  X-Ray already built; a checkout sim must never touch production payment.

### Candidate 3: Vertical AI micro-agent
- Extends or new: neither. Different buyer, different shape, its own correction-dataset
  loop. Does not feed the audit-to-PR rail.
- Verdict: **DROP from this roadmap.** Research: "KEEP only with 2 weeks of customer
  discovery first. Fails the specificity test today (no named user). Not the founder's
  muscle; longest build." Bundling it dilutes the three-pillar story. If ever pursued, it
  is a separate company, not an Answerfox pillar.

### Candidate 4: Spec-conformance drift guard for AI PRs
- Verdict: **KILL (confirmed).** Research: "No proof, no moat, one prompt away from being a
  CodeRabbit feature. Cold-start problem: the spec is usually unwritten." Note the name
  clash with Answerfox's shipped Drift Guard (module 7) is superficial: ours guards live
  site AEO regressions, this guards PR-versus-ticket scope. Unrelated. Stays dead.

---

## 4. Competitive positioning under the confirmed frame

All prices are lowest paid tier unless noted. Funding labeled UNVERIFIED where no primary
source was found. Full URLs in the source index.

### a) Under the current AEO framing, who owns Answerfox's slot and what does it cost?
- **Profound owns the category**: ~$155M raised, $96M Series C at a $1B valuation, Feb 24
  2026, led by Lightspeed. Entry ~$399-499/mo, enterprise custom (siliconangle.com;
  tryprofound.com/blog/profound-raises-96m-series-c).
- **Bluefish** is the enterprise challenger: $68M total, $43M Series B, Apr 2026, Fortune
  500 focus, no self-serve (builtinnyc.com).
- Mid-market is crowded and cheap: Peec $95/mo (funding UNVERIFIED), Otterly $29,
  Rankscale $20, Trakkr $100, Athena $295, Goodie $495, Semrush AI Toolkit $99 add-on,
  Ahrefs Brand Radar $199-699 plus a $129 base (peec.ai/pricing; otterly.ai/pricing;
  rankscale.ai/pricing; higoodie.com/pricing; semrush.com/kb/1493).
- **None of them ship fixes as code.** Every one is monitor, report, or recommend. The
  most execution-forward push to hosted CMS/feed (Goodie) or CDN (Scrunch AXP), never a
  repo PR. So under pure AEO framing Answerfox enters a crowded, better-funded market where
  its only real differentiator is fix-as-code, and it competes on the incumbents' terms
  (visibility tracking) where it is weakest.

### b) Under the reframed platform, does any competitor own all three pillars?
**No, and none owns even two as fix-as-code.**
- Answerability: owned by the monitors above.
- Agent-actionability: no productized paid owner. AX is pre-product: open standards (AXIS
  at axis.run, AXD, AgentReady.org), free scanners (Cloudflare Agent Readiness Score,
  launched Apr 2026, free, emits prompts not fixes, blog.cloudflare.com/agent-readiness;
  Pillar runs a live OpenClaw agent through real tasks but stops at a one-shot free report,
  trypillar.com/resources/agent-score). The one venture outcome is Scrunch, acquired by
  Sitecore for ~$225M, Jun 3 2026, reportedly $10M ARR / 2,500 customers, but CDN-side, not
  repo fixes (bloomberg.com; sitecore.com/company/newsroom). Nobody ships agent-readiness
  fixes as PRs and nobody tracks task-success over time. That intersection is empty.
- Compliance/accessibility: TestParty owns the dev-first PR wedge but is tiny ($4M seed,
  Jun 2024) and leans on human experts, not autonomous fixes (testparty.ai; techcrunch.com
  2024/06/25). Overlays own SMB (accessiBe, UserWay, AudioEye). Scanners own enterprise
  (Deque, Evinced $112M, Siteimprove ~$103M rev, Level Access >$100M ARR).

No single player spans the three. The bundle is genuinely new.

### c) Does bundling accessibility collide with TestParty/Accessio, or create a category?
It would **collide head-on only if Answerfox sells standalone accessibility-as-code to the
same buyer** (Shopify and e-commerce owners) that TestParty targets. Bundled behind
Answerability + Agent-actionability, it does not: it becomes one more check-pack on a rail
the buyer already adopted for AI visibility, sold to the founder/eng-lead who owns the
repo, not to a compliance officer shopping for an accessibility vendor. That bundle is
something neither TestParty (accessibility only) nor Profound (monitoring only) can answer
without building the other two pillars and the fix-as-code rail. Two tailwinds make the
compliance pillar worth holding: EAA enforcement is live since 2025-06-28 with per-violation
fines up to EUR 300k in France (levelaccess.com/blog/eu-accessibility-requirements), and the
FTC's $1M accessiBe settlement (Jan 3 2025, final order Apr 21 2025,
ftc.gov/news-events/news/press-releases/2025/01) explicitly discredits the overlay model
and pushes demand toward real source-level fixes. Conclusion: hold accessibility as the
expansion pillar, do not open with it.

### d) Coherent to a buyer, or a bag of features?
Coherent **only if positioned around the mechanism and the actor**, not the three
acronyms. The unifying sentence: an AI or agent is now a user of your site, and Answerfox
makes your codebase ready for it, shipped as pull requests.

Recommended homepage line (no em-dashes, real mechanism):
> **"The AI-readiness layer for your codebase. Get cited by AI, usable by agents, and
> compliant with accessibility law, all shipped as pull requests to your repo."**

Buyer persona: the engineering-minded founder or eng lead at a 10 to 200 person,
EU-facing SaaS or e-commerce company, who owns the repo and feels both the AI-visibility
anxiety and the EAA deadline. That is the one person who holds all three problems at once.

### e) Pricing band
Correction first: AudioEye is not $15-50K/yr. Its public tiers are $199/$399/$799/mo,
enterprise is contact-sales, and FY2025 was $40.3M revenue, $40M ARR, ~131k customers
(NASDAQ:AEYE, prnewswire.com FY2025 release). The $15-50K/yr figure belongs to Deque axe
enterprise seat bundles, not AudioEye.

Reference points: dev-first accessibility PRs (TestParty) $1,000-5,000/mo; AEO mid-market
$95-495/mo; AX free today; Stark dev tiers $198-21,000/yr. Answerfox's current $9/mo is a
per-repo "keep it fixed" loop price, a different axis from a platform subscription.

Recommendation:
- Keep the $9/mo per-private-repo fix loop as the OSS on-ramp. Do not mistake it for the
  business.
- Platform tiers are the revenue: **~$49-99/mo single pillar (Answerability), ~$199-399/mo
  for the full three-pillar bundle.** That undercuts buying Peec ($95-495) plus TestParty
  ($1,000-5,000) plus manual AX work separately (a $1,300-6,000/mo combined stack) while
  sitting above the pure-monitoring floor. The pitch: one tool at ~$199-399/mo replaces a
  monitoring subscription, an accessibility retainer, and hand-rolled agent-readiness work.

### f) What net-new buyer does the reframe unlock?
The eng-led, EU-facing SaaS or e-commerce company that holds all three problems and finds
no category serving them together: losing ground in AI answers, facing an EAA accessibility
deadline, and wanting agents to be able to use the product, all as review-able PRs rather
than a dashboard subscription, an overlay, or a lawyer. AEO tools ignore compliance,
accessibility tools ignore AI visibility, and neither ships to the repo. That intersection
buyer is unowned today.

---

## 5. Final build order

Principle: every phase is a check-pack (or a fix) on the one existing rail. Later pillars
do not kill earlier ones because they are additive check-packs on the same audit-to-PR
pipeline and the same customer, which compounds retention rather than replacing scope.

### v0.9 — Repair the foundation (before any new pillar)
Rationale: you cannot sell a three-pillar platform when Pillar 1's own hero engines do not
run and nothing can collect money.
1. Wire the three orphans: X-Ray (14), Agent Answer Sim (15), Onboarding orchestrator (17).
   Each is 0 to 1 caller of already-built, already-paid-for code.
2. Ship the Stripe checkout rail (the $9 loop plus platform tiers). The entitlement
   decision (10) already exists; the money collection does not.
3. Resolve the two fix generators: either unify `generate-fix` (artifact) and
   `generate-edits` (validated PR), or draw a clear line (dashboard copy-paste vs
   automated PR) so they stop diverging.
4. Reframe copy: `CLAUDE.md` and marketing from "AI-SEO toolkit" to the AI-readiness line
   in 4d.

### v1.0 — Complete Pillars 1 and 2 (the unclaimed lane) and launch
Rationale: same buyer, same rail, widest competitive whitespace. This is the launchable
product, and it must ship before Cloudflare or Netlify bundle AX away.
5. Agent-actionability: extend Agent Answer Sim to a task-completion sim (signup, pricing,
   checkout) with a task-success trendline over time (the whitespace nobody owns), fixes as
   `llms.txt` / `agents.md` / action-endpoint PRs.
6. Package the Answerability + Agent-actionability bundle as the lead product at
   ~$49-199/mo.

### v1.x — Add Pillar 3 (compliance expansion)
Rationale: accessibility brings a dated legal deadline and proven budgets, but it is where
the only real fix-as-code competitor (TestParty) lives, so enter with the AEO+AX moat
already built rather than head-on. Designed so future compliance domains (EU Pay
Transparency, Digital Product Passport, and the subscription auto-renewal work from the
research doc) slot into the same rail later.
7. Accessibility-as-code check-pack (WCAG 2.1 AA / EN 301 549) plus statement generator, as
   an add-on tier.
8. Position as a compliance expansion for existing customers and new EU-deadline buyers, at
   ~$199-399/mo.

---

## 6. Kill list (refuse to build)

1. **Vertical AI micro-agent (candidate 3)** as an Answerfox pillar. Different buyer and
   shape, dilutes the frame. Separate company at most, and only after real discovery.
2. **Spec-conformance drift guard for AI PRs (candidate 4).** No proof, no moat, a
   CodeRabbit feature in waiting.
3. **Any runtime accessibility overlay.** The FTC's $1M accessiBe settlement proves the
   model is a legal liability, not a feature.
4. **Standalone accessibility product competing head-on with TestParty** on the Shopify and
   e-commerce buyer. Accessibility ships only as the bundled Pillar 3.
5. **A pure AEO monitoring dashboard with no fix-as-code.** That is Profound's crowded,
   better-funded game. Answerfox competes on shipping fixes to the repo or not at all.
6. **An llms.txt generator as a product.** Commoditized to $0 by Fern, Mintlify, and
   Firecrawl. It is a fix output inside Pillar 2, never a product.

---

## Source index (primary URLs, Step 4)

AEO/GEO:
- Profound $96M Series C / $1B: siliconangle.com/2026/02/24/profound-raises-96m-1b-valuation-ai-discovery-monitoring-platform ; tryprofound.com/blog/profound-raises-96m-series-c
- Bluefish $43M Series B: builtinnyc.com/articles/bluefish-raises-43m-series-b-20260417 ; prnewswire.com Bluefish Series B
- Peec pricing: peec.ai/pricing . Otterly: otterly.ai/pricing . Rankscale: rankscale.ai/pricing . Trakkr: trakkr.ai/pricing . Athena: athenahq.ai/plans . Goodie: higoodie.com/pricing and higoodie.com/features/ai-optimization-actions . Semrush: semrush.com/kb/1493-ai-visibility-toolkit . Ahrefs: help.ahrefs.com/en/articles/11064852

Agent Experience / AX:
- Netlify AX: agentexperience.ax ; netlify.com/agent-experience . AXIS: axis.run . AgentReady: agentready.org
- Cloudflare Agent Readiness Score: blog.cloudflare.com/agent-readiness
- Pillar agent task sim: trypillar.com/resources/agent-score
- Scrunch to Sitecore ~$225M: bloomberg.com/news/articles/2026-06-03/sitecore-said-to-acquire-scrunch-for-225-million ; sitecore.com/company/newsroom ; Scrunch $15M Series A: builtin.com/articles/scrunch-raises-15m-...-20250723

Accessibility:
- TestParty (fixes as PRs, $4M seed): testparty.ai ; testparty.ai/blog/best-ai-driven-accessibility-tool-that-fixes-code ; techcrunch.com/2024/06/25/testparty-raises-4-million
- accessiBe FTC $1M: ftc.gov/news-events/news/press-releases/2025/01/ftc-order-requires-online-marketer-pay-1-million... ; ftc.gov/news-events/news/press-releases/2025/04 (final order) ; lflegal.com/2025/01/ftc-accessibe-million-dollar-fine
- AudioEye FY2025 ($40.3M rev, $40M ARR, ~131k customers) and pricing: prnewswire.com AudioEye FY2025 release ; audioeye.com/plans-and-pricing
- accessiBe pricing: accessibe.com/pricing/accesswidget . UserWay acquisition ($98.7M): businesswire.com/news/home/20231230607997 . Level Access >$100M ARR (JMI+KKR): accessible.org/financial-report-revenue-digital-accessibility-companies . Deque axe pricing: deque.com/axe/devtools/pricing . Evinced $112M: prnewswire.com Evinced Series C . Stark pricing: getstark.co/pricing . Siteimprove (Nordic Capital, ~$103M rev): nordiccapital.com/portfolio-cases/investments/siteimprove . Accessio: accessio.io/product ; accessio.ai
- EAA / EN 301 549: levelaccess.com/blog/eu-accessibility-requirements-and-eaa-compliance ; deque.com/en-301-549-compliance
