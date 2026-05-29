# Answerfox

> **The drop-in SEO toolkit that makes any site answerable by AI search engines.**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/Anuj7411/answerfox/actions/workflows/ci.yml/badge.svg)](https://github.com/Anuj7411/answerfox/actions/workflows/ci.yml)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-blue.svg)](./tsconfig.base.json)
[![Tests: 441](https://img.shields.io/badge/tests-441-brightgreen.svg)](#status)

Install a few packages, run one command, and your Next.js site is SEO-ready, AI-search-ready, and audited continuously — without you becoming an SEO expert.

```bash
# In an existing Next.js project:
pnpm add @answerfox/schemas @answerfox/metadata @answerfox/sitemap @answerfox/audit

# Scaffold trust pages + sitemap + robots, end-to-end:
pnpm dlx @answerfox/cli init

# Audit the result against 33 production-tested checks:
pnpm dlx @answerfox/cli audit http://localhost:3000
```

A score of 85+ on first audit is the design target. The [`examples/basic-nextjs`](./examples/basic-nextjs) example scores 90+ out of the box.

## Why Answerfox?

Indie developers and SaaS founders waste **20–40 hours per launch** on SEO that should be automated. Existing tools each solve a slice:

| | Drop-in fixes | Continuous audit | Plain-English teaching |
|---|:---:|:---:|:---:|
| `next-seo` | partial | ❌ | ❌ |
| Lighthouse | ❌ | partial | ❌ |
| Ahrefs / Semrush ($100–500/mo) | ❌ | ✅ | ❌ |
| AI-SEO checklists | ❌ | partial | ✅ |
| **Answerfox** | ✅ | ✅ | ✅ |

No other tool combines **drop-in code** + **automated audit** + **plain-English explanations** in one MIT-licensed package. That's the wedge.

## What's in the box

Seven packages, each does one thing well, designed to be composable.

| Package | Purpose |
|---|---|
| [`@answerfox/core`](./packages/core) | Branded URL types, errors, the `Check<T>` interface that every audit check implements |
| [`@answerfox/schemas`](./packages/schemas) | Type-safe JSON-LD generators (Organization, WebSite, FAQPage, Article, BlogPosting, Breadcrumb, Product, SoftwareApplication, HowTo) |
| [`@answerfox/metadata`](./packages/metadata) | `defineSeo()` — composes title, description, canonical, OpenGraph, Twitter, robots into a Next.js `Metadata` object with smart fallbacks |
| [`@answerfox/sitemap`](./packages/sitemap) | `buildSitemap()` with priority and `changeFrequency` inferred from path patterns |
| [`@answerfox/templates`](./packages/templates) | Five trust-signal page templates (About, Privacy, Terms, FAQ, Contact) the CLI installs |
| [`@answerfox/audit`](./packages/audit) | Cheerio-backed audit engine — 33 checks shipping today, 17 more in Phase 2 |
| [`@answerfox/cli`](./packages/cli) | The `answerfox` command: `init`, `add`, `audit`, `explain` |

## The audit framework

Every check is documented with a stable ID (e.g. `A4`), severity, point weight, and rationale. Run `answerfox explain A4` to see the full doc for any check.

### Coverage today

| Category | Shipped | Total | Points |
|---|---|---|---|
| **A — Meta & technical** | 9 | 10 | 17 of 20 |
| **B — Content & chunking** | 6 | 11 | 11 of 20 |
| **C — Structured data** | 2 | 10 | 5 of 18 |
| **D — E-E-A-T & authority** | 6 | 12 | 14 of 22 |
| **E — Off-site citations** | 4 | 8 | 7 of 12 |
| **F — OpenGraph & social** | 6 | 7 | 7 of 8 |
| **Total** | **33** | **50** (full list in [AUDIT-FRAMEWORK.md](./docs/internal/AUDIT-FRAMEWORK.md)) | **~63 of 100** |

The 17 unshipped checks split between content-quality NLP (B2, B6, B7, B10, C10), page-type heuristics (C4–C8, D7, D8), and multi-page crawls (A2, D12). They land in Phase 2.

### How a real audit looks

```text
Audit · https://example.com
Fetched 2026-05-16T10:30:00.000Z

Score: 72/100 (Average)
22 pass · 4 fail · 5 warn · 2 skip

[CRITICAL] 2 issue(s)
  A4 · Canonical URL declared as an absolute http(s) link
       Fix: Add <link rel="canonical" href="..."> to <head>
       https://answerfox.dev/docs/checks/A4
  D2 · Privacy policy linked from this page
       Fix: Link to a /privacy page from this page (typically the footer).
       https://answerfox.dev/docs/checks/D2

[HIGH] 3 issue(s)
  ...

[PASSED] 22
  A1 · <title> present and 30-60 chars long
  A3 · Meta description present and 120-160 chars long
  ...
```

## See it run

The [`examples/basic-nextjs`](./examples/basic-nextjs) directory is a complete, committed Next.js 15 App Router app that consumes every `@answerfox/*` package. It's the equivalent of what `answerfox init` would write in a fresh project, checked in so you can read each file:

```
examples/basic-nextjs/app/
├── layout.tsx          → defineSeo() + nav/footer chrome
├── page.tsx            → organization() + webSite() JSON-LD
├── sitemap.ts          → buildSitemap() with smart defaults
├── robots.ts           → Minimal MetadataRoute.Robots
├── about/page.tsx      → Trust page + Organization JSON-LD
├── faq/page.tsx        → faqPage() with matching visible content
├── privacy/page.tsx
├── terms/page.tsx
└── contact/page.tsx
```

## Quickstart in detail

```bash
# 1. Install the runtime packages you'll actually use:
pnpm add @answerfox/schemas @answerfox/metadata @answerfox/sitemap

# 2. Scaffold trust pages (no install required for one-off use):
pnpm dlx @answerfox/cli init
# Three questions: project name, domain, contact email.
# Writes 7 files (5 trust pages + sitemap + robots).

# 3. Audit before shipping:
pnpm dlx @answerfox/cli audit http://localhost:3000

# 4. Or in CI — exit non-zero if score < 80:
pnpm dlx @answerfox/cli audit ${PREVIEW_URL} --ci --min-score 80
```

## Status

**v0.1.0 is live on npm.** All seven library packages publish under the [`@answerfox/*`](https://www.npmjs.com/org/answerfox) scope (441 tests passing). The audit engine ships 33 of 50 checks covering ~63 of 100 points. CLI flow works end-to-end against any Next.js site.

```bash
# Try it on any URL — no install needed:
pnpm dlx @answerfox/cli audit https://example.com
```

The remaining 17 audit checks land incrementally on the path to 50/50. Star and watch the repo to follow releases.

Phase 1 is feature-complete except for: remaining 17 audit checks, the docs site, and one more real-world example (Sotto). See [ROADMAP.md](./docs/internal/ROADMAP.md) for the full Phase 1 / 2 / 3 breakdown.

## Architecture

- **Monorepo:** [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces).
- **Strict TypeScript** — `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`. Public API surfaces use branded types so a `string` doesn't accidentally pass where an `AbsoluteUrl` is required.
- **Validation philosophy:** every input validates *eagerly* with stable error codes. URL inputs throw `InvalidUrlError`. Schema-level issues batch into one `SchemaValidationError` with the full list — never fix-rerun-find-next.
- **Test seams everywhere.** The CLI's `Fs` and `Prompter` are interfaces with both production and in-memory implementations. The audit `runChecks()` is pure; `audit()` is the thin fetching wrapper. Tests never hit the network.
- **Versioning:** [Changesets](https://github.com/changesets/changesets) — every user-facing PR includes a changeset. Releases are automated.

## Documentation

- [ROADMAP](./docs/internal/ROADMAP.md) — Phase 1 / 2 / 3 breakdown
- [PROJECT-SPEC](./docs/internal/PROJECT-SPEC.md) — architectural decision record
- [AUDIT-FRAMEWORK](./docs/internal/AUDIT-FRAMEWORK.md) — all 50 audit checks with rationale
- [CONTRIBUTING](./CONTRIBUTING.md) — how to set up the workspace and propose changes

## Contributing

Contributions are welcome. The fastest way to get useful:

1. Run an audit on a real production site you know well (`pnpm dlx @answerfox/cli audit https://...` — works after the first npm publish, or from a local clone today).
2. Pick a finding that surprised you.
3. Open a discussion or an issue with the URL and what surprised you. False positives, false negatives, and missing-but-obvious checks are equally welcome.

For code contributions, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 Anuj Ojha. The community version is and will remain complete and free, forever. Hosted SaaS conveniences may come later (continuous monitoring, historical trends) — the MIT core stays untouched.
