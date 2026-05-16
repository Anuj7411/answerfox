# Answerable

> The drop-in SEO toolkit that makes any site answerable by AI search engines.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/Anuj7411/answerable/actions/workflows/ci.yml/badge.svg)](https://github.com/Anuj7411/answerable/actions/workflows/ci.yml)
[![Status: Pre-Alpha](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#status)

Install one package. Run one command. Your site is SEO-ready, AI-search-ready, and audited continuously — without you becoming an SEO expert.

## Why Answerable?

Indie developers and SaaS founders waste **20–40 hours per launch** on SEO that should be automated. Existing tools each solve a slice — `next-seo` gives components but no strategy, Lighthouse audits but doesn't fix, Ahrefs costs hundreds per month, and AI-search readiness is barely covered anywhere.

Answerable is the missing tool that combines all three:

| | Drop-in fixes | Continuous audit | Plain-English teaching |
|---|:---:|:---:|:---:|
| `next-seo` | partial | ❌ | ❌ |
| Lighthouse | ❌ | partial | ❌ |
| Ahrefs / Semrush | ❌ | ✅ | ❌ |
| **Answerable** | ✅ | ✅ | ✅ |

## Status

**Pre-alpha.** All seven library packages are built and tested in-repo (374 tests passing). Nothing on npm yet — first publish lands when the audit framework reaches 50/50 checks. See [ROADMAP](./docs/internal/ROADMAP.md) for the Phase 1 / 2 / 3 breakdown.

Star and watch the repo to follow along.

## Packages

| Package | Purpose | Status |
|---|---|---|
| `@answerable/core` | Shared types, branded URLs, errors, `Check<T>` | ✅ |
| `@answerable/schemas` | Type-safe JSON-LD (Organization, WebSite, FAQPage, Article, BlogPosting, Breadcrumb, Product, SoftwareApplication, HowTo) | ✅ 8/8 |
| `@answerable/metadata` | `defineSeo()` — Next.js App Router metadata helpers | ✅ |
| `@answerable/sitemap` | `buildSitemap()` with smart path-based defaults | ✅ |
| `@answerable/templates` | About, Privacy, Terms, FAQ, Contact templates | ✅ 5/5 |
| `@answerable/audit` | Cheerio-backed audit engine | ✅ 17/50 checks |
| `@answerable/cli` | `answerable init / add / audit / explain` | ✅ |

## Quickstart

```bash
# In your existing Next.js project:
pnpm add @answerable/schemas @answerable/metadata @answerable/sitemap @answerable/audit
pnpm dlx @answerable/cli init        # 3 prompts → 7 files written
pnpm dlx @answerable/cli audit http://localhost:3000
```

See [`examples/basic-nextjs/`](./examples/basic-nextjs) for a working minimal example — everything `init` would produce, committed and runnable.

## Repository layout

```
answerable/
├── packages/      # Published npm packages
├── apps/          # Docs site + live playground
├── examples/      # Real-world integrations
├── checklists/    # Pre-launch / monthly-audit / AI-readiness checklists
└── docs/internal/ # Project spec, roadmap, audit framework
```

## Contributing

Contributions are welcome once Phase 1 lands. See [CONTRIBUTING.md](./CONTRIBUTING.md). In the meantime, feel free to open [Discussions](https://github.com/Anuj7411/answerable/discussions) for feedback on the architecture.

## License

[MIT](./LICENSE) © 2026 Anuj Ojha. The community version is and will remain complete and free forever.
