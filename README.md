# Answerfox

> **The open-source AI-SEO toolkit that lives in your codebase and ships fixes as code.**

[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](./LICENSE)
[![CI](https://github.com/Anuj7411/answerfox/actions/workflows/ci.yml/badge.svg)](https://github.com/Anuj7411/answerfox/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@answerfox/cli.svg)](https://www.npmjs.com/package/@answerfox/cli)
[![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-blue.svg)](./tsconfig.base.json)

Answerfox audits your site for SEO, AEO (answer engines), and GEO (generative engines), explains every issue in plain English, and gives you the fix as code you commit. It runs in your terminal and your CI, not as another dashboard you have to log into.

```bash
# Try without installing:
pnpm dlx @answerfox/cli audit https://stripe.com
```

## Quickstart

Install once, then run any command:

```bash
pnpm add -g @answerfox/cli
# or: npm install -g @answerfox/cli
```

Installing gives you two commands: `answerfox` (the full name) and `af` (a shorter alias). Pick whichever feels right.

```bash
# Audit any URL
af audit https://your-site.com

# Read the full doc for any check, in your terminal
af explain A4

# Scaffold trust pages, sitemap, and robots in a Next.js project
af init

# Fail a CI build if the score drops below a threshold
af audit ${PREVIEW_URL} --ci --min-score 80
```

If you'd rather not install, `pnpm dlx` runs the CLI for a one-shot. Note the URL must be on the SAME line:

```bash
pnpm dlx @answerfox/cli audit https://your-site.com
```

`audit` and `explain` run anywhere and need no setup. `init` and `add` are interactive (they prompt before writing files) and expect a Next.js App Router project.

## What a real audit looks like

Real output from `audit https://example.com` (a bare page, so it scores low, which is the point, it catches what is missing):

```text
Audit · https://example.com
Fetched 2026-06-05T20:05:54.806Z

Score: 20/100 (Critical)
6 pass · 20 fail · 6 warn · 1 skip

[CRITICAL] 6 issue(s)
  A1 · <title> present and 30-60 chars long
     Title is 14 chars: "Example Domain"
     Fix: Adjust the <title> to 30-60 characters (currently 14).
  A4 · Canonical URL declared as an absolute http(s) link
     Fix: Add <link rel="canonical" href="..."> inside <head>. Use defineSeo()
     from @answerfox/metadata to emit this automatically.
  C1 · At least one <script type="application/ld+json"> with valid JSON
     Fix: Add a JSON-LD block. Start with organization() from @answerfox/schemas.
  ...
```

Every finding names the check, why it matters, and the exact fix, often pointing at the Answerfox package that emits it. Run `answerfox explain <id>` for the full rationale of any check.

## What good looks like

The score is a page-level machine-readability number, not a brand authority score. Audit a SaaS marketing page, a docs site, a content blog, or an indie product homepage. Avoid auditing logged-in product gates (like `linkedin.com`, `github.com`, `twitter.com`) where the public URL is intentionally sparse; the score will under-report because those pages are not built for crawlers.

For reference, here is how the tool calibrates on sites you already know:

| URL | Score | Why |
|---|:---:|---|
| `stripe.com` | 76 | Full marketing surface, three real fixable gaps. |
| `calendly.com` | 74 | Same shape as Stripe, a couple of trust-page misses. |
| `examples/basic-nextjs` (in this repo) | 79 | What the `init` command scaffolds out of the box. |
| `vercel.com` | 68 | Solid, a few real misses. |
| `github.com` | 52 | Logged-out product gate, intentionally sparse. |
| `linkedin.com` | 50 | Logged-out product gate, intentionally sparse. |
| `example.com` | 20 | Bare page, no SEO at all. |

If your marketing page scores in the 70s with a few fixes flagged, you are doing well. If it scores in the 50s and you are not a login wall, the report is telling you something real.

## You can audit any URL

Point Answerfox at any URL that returns HTML. Homepage, subpage, blog post, docs page, a GitHub repo page, a YouTube channel, a Medium article, a Notion public page, a Substack newsletter. The CLI fetches the page and analyzes the HTML, whether that page is yours or someone else's.

What the score means depends on who built the HTML you're auditing:

| If you audit... | The score measures... |
|---|---|
| Your own site or blog (you control the HTML) | Your work. Actionable. |
| A subpage of your site (e.g. `/pricing`, `/blog/post`) | Your work on that page. Actionable. |
| A competitor's marketing page | Their work. Useful for benchmarking. |
| A GitHub repo page (`github.com/<you>/<repo>`) | GitHub's repo template. Informational only. |
| A YouTube channel page | YouTube's template. Informational. |
| A LinkedIn profile or Medium article | Their platform template. Informational. |

For actionable fixes, audit a URL whose HTML you actually control. For curiosity, competitive research, or platform diagnostics, audit anyone.

A heads-up: `github.com/<owner>/<repo>` currently scores around 44 of 100, and `linkedin.com` scores 50. Big platforms are not yet optimizing their templated pages for AI search readability. Indie devs who host on their own domain just got a structural advantage in the AI search era.

## Why Answerfox

Indie developers and solo founders lose hours of fiddly SEO work per launch on things that should be automated. Existing tools each cover a slice:

| | Drop-in fixes | Continuous audit | Plain-English teaching | In your codebase |
|---|:---:|:---:|:---:|:---:|
| `next-seo` | partial | ❌ | ❌ | ✅ |
| Lighthouse | ❌ | partial | ❌ | ❌ |
| Ahrefs / Semrush | ❌ | ✅ | ❌ | ❌ |
| **Answerfox** | ✅ | ✅ | ✅ | ✅ |

The wedge: drop-in code, automated audit, and plain-English explanations, in one MIT-licensed toolkit that lives where you work.

## What's in the box

Seven packages, each does one thing, all composable.

| Package | Purpose |
|---|---|
| [`@answerfox/core`](./packages/core) | Branded URL types, errors, the `Check<T>` interface every audit check implements |
| [`@answerfox/schemas`](./packages/schemas) | Type-safe JSON-LD generators (Organization, WebSite, FAQPage, Article, Breadcrumb, Product, SoftwareApplication, HowTo) |
| [`@answerfox/metadata`](./packages/metadata) | `defineSeo()` composes title, description, canonical, OpenGraph, Twitter, and robots into a Next.js `Metadata` object |
| [`@answerfox/sitemap`](./packages/sitemap) | `buildSitemap()` with priority and `changeFrequency` inferred from path patterns |
| [`@answerfox/templates`](./packages/templates) | Five trust-page templates (About, Privacy, Terms, FAQ, Contact) the CLI installs |
| [`@answerfox/audit`](./packages/audit) | Cheerio-backed audit engine, 39 of 56 checks shipping today |
| [`@answerfox/cli`](./packages/cli) | The `answerfox` command: `audit`, `explain`, `init`, `add` |

## The audit framework

Checks are scored 0-100 (single score plus a band: Critical, Weak, Average, Strong, Excellent) and grouped by category. The framework defines 56 checks; **39 are active today**.

| Category | Active | Total |
|---|---|---|
| A · Meta & technical | 9 | 10 |
| B · Content & chunking | 6 | 11 |
| C · Structured data | 2 | 10 |
| D · E-E-A-T & authority | 6 | 12 |
| E · Off-site citations | 4 | 8 |
| F · OpenGraph & social | 6 | 7 |
| G · Agent Readiness *(informational, see note)* | 6 | 6 |
| **Total** | **39** | **56** |

The remaining 17 (content-quality NLP, page-type heuristics, multi-page crawls) land incrementally. Full spec in [AUDIT-FRAMEWORK.md](./docs/internal/AUDIT-FRAMEWORK.md).

**About Category G (Agent Readiness):** v0.3.0 ships 6 checks that detect AI-agent-era manifests on your origin (MCP Server Card, A2A `agent-card.json`, RFC 9727 API Catalog, `agent-permissions.json`, OAuth Authorization Server Metadata, WebMCP form annotations). These are **informational** in v0.3.x — they appear in the report but don't move your score, so the SEO/AEO/GEO baseline (0-100) stays comparable across versions. Future v0.4+ may roll them into scoring once standards stabilize.

## See it run

[`examples/basic-nextjs`](./examples/basic-nextjs) is a complete, committed Next.js 15 App Router app that consumes every `@answerfox/*` package, the equivalent of what `answerfox init` writes. Audited out of the box it scores **79/100**; the unshipped checks and the example's minimal content are the ceiling, a content-rich production site scores higher. Clone it, run the audit, read each file.

## What's next: Agent Readiness

SEO, AEO, and GEO are about being *read* by search and answer engines. The shift now underway is being *usable by AI agents* that act on a user's behalf. Answerfox is adding an **Agent Readiness** audit: does your site ship the machine-readable manifests agents use to discover and act on it, such as an MCP Server Card, `agent-card.json`, an API catalog ([RFC 9727](https://www.rfc-editor.org/rfc/rfc9727)), agent permissions, OAuth discovery, and WebMCP form annotations?

We scanned Stripe, Vercel, Supabase, and Linear: each is missing 4 to 5 of the 6. Almost nobody has shipped these yet. Like the rest of Answerfox, the plan is to audit your codebase and hand you the manifests as files you commit, not patch you at the edge.

**Status: in progress, not yet shipped.** If you want your site checked for agent readiness, open an issue with your URL and I'll take a look.

## Status

**v0.2.x is live on npm** under the [`@answerfox/*`](https://www.npmjs.com/org/answerfox) scope; CI is green on every package (see the badge above). The audit engine ships 33 of 50 checks. `audit` and `explain` are stable and CI-friendly; `init` and `add` work interactively in a real terminal.

The remaining 17 checks and the Agent Readiness audit land incrementally. Star and watch the repo to follow releases. The web docs site is in progress; for now, `answerfox explain <id>` gives the full doc for any check in your terminal.

## Architecture

- **Monorepo:** [Turborepo](https://turbo.build/) + [pnpm workspaces](https://pnpm.io/workspaces).
- **Strict TypeScript:** `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`. Public APIs use branded types so a `string` cannot pass where an `AbsoluteUrl` is required.
- **Eager validation:** inputs validate up front with stable error codes (`InvalidUrlError`, batched `SchemaValidationError`).
- **Test seams:** the CLI's `Fs` and `Prompter` are interfaces with in-memory implementations; `audit()` is a thin fetch wrapper over a pure `runChecks()`. Tests never hit the network.
- **Releases:** [Changesets](https://github.com/changesets/changesets) + Trusted Publishing (OIDC, no tokens).

## Documentation

- [AUDIT-FRAMEWORK](./docs/internal/AUDIT-FRAMEWORK.md) — all 50 checks with rationale
- [ROADMAP](./docs/internal/ROADMAP.md) — phase breakdown
- [CONTRIBUTING](./CONTRIBUTING.md) — set up the workspace and propose changes

## Contributing

The fastest way to help: run an audit on a production site you know well, find a result that surprised you (false positive, false negative, or an obvious missing check), and open an issue with the URL. Code contributions welcome, see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE) © 2026 Anuj Ojha. The community version stays complete and free. Hosted conveniences (continuous monitoring, history) may come later; the MIT core stays untouched.
