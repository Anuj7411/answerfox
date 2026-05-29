# Answerfox — Project Specification

> The complete architectural decision record. This document is the single source of truth.
> Last updated: May 12, 2026.

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| **Name** | `answerable` |
| **Tagline** | The drop-in SEO toolkit that makes any site answerable by AI search engines. |
| **One-line pitch** | Install one package. Run one command. Your site is SEO-ready, AI-search-ready, and audited continuously. |
| **License** | MIT |
| **GitHub** | `github.com/Anuj7411/answerfox` (to be created) |
| **NPM scope** | `@answerfox/*` |
| **Origin** | Born out of doing manual SEO work on Sotto (sottogames.com) and realizing nothing in the ecosystem combines fix + audit + playbook. |

## 2. Problem Statement

**Indie developers and SaaS founders waste 20-40 hours per launch on SEO that should be automated.** Existing tools each solve a slice:

- `next-seo` gives you components but not a strategy
- Lighthouse audits but doesn't fix
- Ahrefs/Semrush costs $100-500/month and is overkill
- AI-SEO (E-E-A-T, entity authority, answer engine readiness) is barely covered anywhere

**There is no single tool that:**
1. Drops in production-grade SEO code (`fix`)
2. Continuously audits the deployed site (`audit`)
3. Teaches the developer *why* each piece matters (`teach`)

Answerfox is that tool.

## 3. Target User

**Primary persona:** Solo indie developer or small SaaS team shipping a new product. Comfortable in TypeScript/Next.js. Wants SEO done right but doesn't have time to become an SEO expert.

**Secondary persona:** Agency or contractor building multiple sites who needs a repeatable SEO baseline.

**Anti-persona:** Enterprise SEO teams who already use Ahrefs/Semrush and need workflow integration — they're not our target.

## 4. Competitive Landscape

| Tool | Category | Gap |
|------|----------|-----|
| `next-seo` | Components | No audit, no strategy, no fix recommendations |
| `next-sitemap` | Single concern | Just sitemap |
| `schema-dts` | Types only | No runtime helpers |
| Lighthouse | Audit | Doesn't fix; doesn't cover AI-SEO |
| `freeaiseoaudit.com` | AI-SEO audit | Audit only, no code |
| Ahrefs / Semrush | Enterprise SaaS | Expensive, complex |

**The wedge:** Combine drop-in fix + automated audit + plain-English explanation in one MIT-licensed package.

## 5. Architecture

### Monorepo Layout (Turborepo + pnpm workspaces)

```
answerable/
├── README.md                      # Hero + quickstart + demo GIF
├── LICENSE                        # MIT
├── package.json                   # workspaces root
├── turbo.json                     # Turborepo config
├── pnpm-workspace.yaml
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                 # Test, lint, typecheck on every PR
│   │   ├── publish.yml            # Changesets-driven npm publish
│   │   └── audit-self.yml         # Audit our own docs site
│   └── ISSUE_TEMPLATE/
│
├── apps/
│   ├── docs/                      # Nextra docs site, hosted on Vercel
│   │   ├── pages/
│   │   │   ├── index.mdx
│   │   │   ├── getting-started/
│   │   │   ├── recipes/
│   │   │   ├── concepts/
│   │   │   └── reference/
│   │   └── public/
│   │
│   └── playground/                # Live demo site exercising every feature
│
├── packages/
│   ├── schemas/                   # @answerfox/schemas
│   ├── metadata/                  # @answerfox/metadata
│   ├── sitemap/                   # @answerfox/sitemap
│   ├── templates/                 # @answerfox/templates (page scaffolds)
│   ├── audit/                     # @answerfox/audit (the audit engine)
│   ├── cli/                       # @answerfox/cli (unified entrypoint)
│   └── core/                      # @answerfox/core (shared types, utils)
│
├── examples/
│   ├── sotto/                     # Real-world example using sottogames.com
│   ├── basic-nextjs/              # Minimal Next.js example
│   └── ssr-multilingual/          # Multi-locale example (Phase 2)
│
├── checklists/
│   ├── pre-launch.md
│   ├── monthly-audit.md
│   └── ai-readiness.md
│
└── CONTRIBUTING.md
```

### Package Responsibilities

#### `@answerfox/core`
Shared types, utility functions, error classes. Other packages depend on this. No runtime dependencies beyond `zod`.

#### `@answerfox/schemas`
Type-safe JSON-LD generators for:
- `organization()`
- `softwareApplication()`
- `faqPage()`
- `article()` / `blogPosting()`
- `breadcrumb()`
- `product()`
- `howTo()`
- `webSite()` with SearchAction
- `localBusiness()` (Phase 2)
- `videoObject()` (Phase 2)

Every helper returns a typed JSON-LD object. Components also exported for React/Next.js usage.

#### `@answerfox/metadata`
Next.js metadata API helpers:
- `defineSeo()` — composes title, description, OG, Twitter, canonical
- `defineCanonical()`
- `defineRobots()`
- `defineOg()` with image fallback chain
- `defineKeywords()` with deduplication

Framework support: Next.js App Router (Phase 1). Pages Router (Phase 2). Astro, Remix (Phase 2).

#### `@answerfox/sitemap`
- `buildSitemap()` accepts route definitions, returns Next.js-compatible MetadataRoute.Sitemap
- Smart defaults for priority/changeFrequency based on path patterns
- `sitemap-index` support for large sites

#### `@answerfox/templates`
Page templates the CLI installs into a user's project:
- `about.tsx`
- `privacy.tsx`
- `terms.tsx`
- `faq.tsx` with built-in FAQPage schema
- `contact.tsx`
- `blog/[slug].tsx` (Phase 2)

Templates are TypeScript files with placeholder tokens like `{{PROJECT_NAME}}`. The CLI does the substitution at install time.

#### `@answerfox/audit`
**The killer differentiator.** A check engine that:

1. Crawls a target URL (cheerio for static, Playwright for SPA)
2. Runs 50 checks across 6 categories (see `AUDIT-FRAMEWORK.md`)
3. Reports findings with severity, evidence, and fix recommendation
4. Optionally outputs in JSON for CI integration
5. Optionally auto-fixes (writes patches to local code)

#### `@answerfox/cli`
Single command-line entrypoint exposing:

```bash
answerfox init                              # Set up SEO in current project
answerfox add about,privacy,terms,faq      # Add specific templates
answerfox audit <url>                      # Run audit
answerfox audit --ci                       # CI mode (exits non-zero on regressions)
answerfox verify                           # Validate all JSON-LD in current project
answerfox explain <check-id>               # Print full doc for a check
```

## 6. Audit Engine Design

See `AUDIT-FRAMEWORK.md` for the full check list.

### Run flow

1. User runs `answerfox audit https://example.com`
2. CLI fetches the URL (HEAD first to validate)
3. Renders HTML via cheerio. If SPA detected (e.g., empty body), upgrades to Playwright.
4. Each check receives the parsed DOM + the raw HTML
5. Check returns `{ id, status, severity, evidence, fixRecommendation, autoFixable, points }`
6. Reporter formats output: console (colored), JSON (for CI), HTML (for sharing)

### Check structure

```typescript
interface Check {
  id: string;                    // e.g., "B5-faq-section"
  category: Category;            // e.g., "content-structure"
  severity: "critical" | "high" | "medium" | "low";
  points: number;                // weight toward total score
  description: string;
  rationale: string;             // why this matters
  run: (input: CheckInput) => CheckResult | Promise<CheckResult>;
  autoFix?: (project: ProjectContext) => Promise<void>;
  docsUrl: string;
}
```

### Scoring

- Total possible: 100 points across all checks
- Each check is weighted (matches freeaiseoaudit.com weights as a starting point, refined over time)
- Score interpretation: 0-40 critical, 41-60 weak, 61-80 average, 81-90 strong, 91-100 excellent

## 7. User Experience

### New project setup (1 minute)

```bash
cd my-nextjs-project
pnpm add @answerfox/schemas @answerfox/metadata @answerfox/sitemap
npx answerfox init
# Interactive prompts:
# - Project name
# - Domain
# - GitHub repo URL
# - Social profiles (Instagram, Twitter, etc.)
# - Brand keywords
# Then:
# - Generates app/sitemap.ts
# - Generates app/robots.ts
# - Updates app/layout.tsx with metadata
# - Adds JSON-LD to app/page.tsx
# - Creates about/, privacy/, terms/, faq/, contact/ pages
```

### Existing project audit (30 seconds)

```bash
npx answerfox audit https://my-site.com
# Outputs:
# 📊 Score: 67/100 (Average)
#
# ❌ CRITICAL (3 issues)
#   • Missing canonical URL  →  npx answerfox fix canonical
#   • No FAQPage schema      →  npx answerfox add faq
#   • No Organization schema →  npx answerfox add organization
#
# ⚠️  HIGH (5 issues)
# ...
```

### CI integration

```yaml
# .github/workflows/seo.yml
- name: SEO audit
  run: npx answerfox audit ${{ env.PREVIEW_URL }} --ci --min-score 80
```

## 8. Documentation Strategy

Three tiers, modeled after Stripe + Next.js:

### Tier 1: Quick Recipes
One-page solutions. Copy-paste code. Title = the problem.
- "How to add FAQ schema in 60 seconds"
- "How to fix 'missing canonical URL'"
- "How to make my site rank in Perplexity"

### Tier 2: Concepts
Long-form explanations of *why*.
- What is E-E-A-T and why it ranks pages now
- How AI answer engines (Perplexity, Claude, ChatGPT) read your site
- The difference between traditional SEO and AI-SEO
- Schema.org explained for developers

### Tier 3: API Reference
Auto-generated from TypeScript types using `typedoc`.

### Checklists (in `/checklists/`)
1. Pre-launch checklist (printable)
2. Monthly audit routine
3. AI readiness checklist

## 9. Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Monorepo | Turborepo + pnpm | Industry standard, fast incremental builds |
| Language | TypeScript strict | Type safety, great DX |
| Testing | Vitest | Faster than Jest, better TS support |
| Docs site | Nextra | Markdown + React, dead simple |
| CLI framework | commander | Mature, well-documented |
| CLI output | chalk + ora + boxen | Polish without overhead |
| HTML parsing | cheerio | Fast static parsing |
| JS rendering | playwright | Modern, faster than Puppeteer for our use |
| Schema validation | zod | Runtime + type inference |
| Publishing | changesets | Industry standard versioning |
| CI | GitHub Actions | Free for OSS |
| Hosting (docs) | Vercel | Zero-config Next.js hosting |

## 10. Versioning & Release

- Semantic versioning (semver)
- All package versions tracked together via changesets
- Pre-1.0 (`0.x.x`) for the entire MVP period
- `1.0.0` reserved for when MVP is feature-complete + battle-tested
- Daily/weekly canary releases possible via `--tag canary`

## 11. Community Strategy

- **Initial seed:** Sotto launch + author's network
- **First 100 users:** Indie Hackers, r/SideProject, r/SaaS, Twitter
- **First 1000 users:** Product Hunt launch (after we're stable), Hacker News (Show HN), dev.to articles
- **Community:** GitHub Discussions enabled from day 1, Discord considered at 500+ stars

## 12. Monetization (Future, Not MVP)

The MIT package stays free forever. Future revenue possibilities (NOT a priority):
- Hosted SaaS dashboard for continuous monitoring
- Premium audit features (competitor tracking, historical trends)
- White-label for agencies

**For Phase 1: zero monetization concerns. Open source, free, no upsell.**

## 13. Non-Goals

To stay focused, Answerfox explicitly does NOT do:

- ❌ Backlink building / outreach
- ❌ Keyword research (use Ahrefs/Semrush for that)
- ❌ Rank tracking
- ❌ Content writing / AI generation (Phase 2 maybe)
- ❌ Competitor analysis
- ❌ Social media scheduling
- ❌ Email marketing

**We are the SEO foundation layer. Other tools sit on top.**

## 14. Decisions Made (For Reference)

| Decision | Choice | Why |
|----------|--------|-----|
| Name | `answerable` | Brandable, signals AI-answer-engine focus |
| Initial framework | Next.js App Router only | Most modern, our test bed |
| Audit crawler | Playwright over Puppeteer | Faster + modern API |
| License | MIT | Maximum adoption, no GPL strings |
| Repo structure | Monorepo | All packages move together |
| First example | Sotto (sottogames.com) | Real product we know intimately |
| Documentation tool | Nextra | Markdown-first + Next.js native |
| Package manager | pnpm | Faster, disk-efficient |
| Audit framework basis | freeaiseoaudit.com checklist | Industry-validated starting point |

## 15. Open Questions (Resolve in Session 2)

These were intentionally deferred:

1. Should we support Pages Router for Next.js? (Probably yes but Phase 2)
2. Should `init` work on existing files or only fresh projects?
3. How aggressive should auto-fix be? (Default to dry-run = yes)
4. Will we mirror docs to GitHub Pages as fallback to Vercel?
5. Should `audit` cache crawl results locally?
