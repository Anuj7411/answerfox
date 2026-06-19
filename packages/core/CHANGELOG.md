# @answerfox/core

## 0.4.0

### Minor Changes

- 304703a: v0.6.0 — Agentic Commerce category H. **16 of 16 Cloudflare AR Score parity reached.**

  Adds 4 new audit checks for the agentic commerce protocols Cloudflare tracks
  in their AR Score. After this release, every check Cloudflare scores is
  covered, plus 36 checks we have they don't (classic SEO/AEO/GEO + the WebMCP,
  A2A, and agent-permissions G checks they skipped).

  New category

  - **H — agentic-commerce**: 4 checks, 12 of 100 max points.

  New checks

  - **H1 x402** (4 pts, medium): detects x402 capability via
    `/.well-known/x402` manifest OR `X-Payment-Required` header. x402
    was acquired by the Linux Foundation in 2026 (Coinbase origins,
    $50M+ cumulative volume by April).
  - **H2 UCP** (3 pts, medium): detects Universal Commerce Protocol
    manifest at `/.well-known/ucp.json`. Google + Shopify/Walmart/Target
    launch, January 11 2026.
  - **H3 ACP** (3 pts, medium): detects Agentic Commerce Protocol
    manifest at `/.well-known/acp.json`. OpenAI + Stripe joint protocol
    for agent checkout flows.
  - **H4 MPP** (2 pts, low): detects Machine Payment Protocol manifest
    at `/.well-known/mpp.json`. Cloudflare addition to AR Score, May 2026.

  Core API additions

  - `'agentic-commerce'` added to the `Category` enum.
  - `CATEGORY_ID_PREFIX['agentic-commerce'] = 'H'`.
  - `CATEGORY_POINT_BUDGET` updated to reflect actual per-category
    weights: A=21, B=20, C=9, D=22, E=12, F=8, G=39, H=12. Total of
    143 max points (score normalizes to 100 in the runner).

  Framework

  - Active checks: 46 → **50** of 67 planned.
  - Cloudflare-equivalent coverage: 13 of 16 → **16 of 16**.
  - Classic-perfect fixture without AR + commerce manifests now scores
    **55** (was 61 after phase 2, was 100 in v0.3.x). Drops from
    "average" to "weak" band — a perfect SEO site that ships zero
    agent or commerce signals is no longer middling, it's deficient.

  Tests

  - 14 new test cases (4 H1, 4 H2, 3 H3, 3 H4).
  - runner.test.ts updated for new check IDs and new score math.
  - console.test.ts updated to allow Weak band on the perfect fixture.
  - All 242 tests pass.

### Patch Changes

- 515ca16: v0.5.0 phase 2 — Cloudflare Agent Readiness Score coverage parity, phase 2 of 3.

  Adds 5 new checks bringing the active framework from 41 to 46 of 63 planned.
  Cloudflare-equivalent coverage moves from 8 of 16 to 13 of 16. The final 3
  (x402, UCP, ACP, MPP as a single Agentic Commerce category H) land in v0.6.0.

  New checks

  - **A12 RFC 8288 Link headers**: detects Link headers in the HTTP response
    with rel attributes. 1 point, low severity. Skips on the runChecks
    fixture path (no headers context).
  - **A13 AI bot rules**: detects explicit AI bot user agents in robots.txt
    (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot,
    anthropic-ai, cohere-ai, CCBot, and 10 more). 2 points, medium severity.
  - **C3 Markdown content negotiation**: re-fetches the audited URL with
    Accept: text/markdown, checks if Content-Type or body shape is markdown.
    2 points, low severity.
  - **C4 Content Signals**: detects X-Content-Signals HTTP header or
    matching meta tag, requires at least one recognised policy field
    (use-policy, citation, training, paywall, freshness). 2 points, medium.
  - **G8 Web Bot Auth (RFC 9421)**: detects HTTP Message Signatures via
    Signature-Input + Signature headers. 4 points, low severity. Skips
    on the runChecks fixture path.

  Crawler refactor

  - `FetchAndParseResult` now includes a `headers: Headers` field.
  - `RunChecksInput` accepts an optional `headers?: Headers` field.
  - `@answerfox/core`'s `CheckInput` interface adds an optional
    `headers?: Headers` field so checks can typesafely access response
    headers. Backward-compatible: existing checks ignore the new field.

  Framework reweight

  - A category: 18 → 21 of 100 pts (A12=1, A13=2 added)
  - C category: 5 → 9 of 100 pts (C3=2, C4=2 added)
  - G category: 35 → 39 of 100 pts (G8=4 added)
  - Total max-points budget: ~101 of normalized 100 (score normalizes)
  - A classic-perfect fixture without AR manifests now scores 61 (was 65
    after phase 1, was 70 after AR-first reweight, was 100 in v0.3.x).

  Tests

  - 24 new test cases (5 for A12, 5 for A13, 4 for C3, 5 for C4, 5 for G8).
  - All 228 tests pass.

## 0.3.0

### Minor Changes

- f514451: Ship v0.3.0: Agent Readiness detection.

  Adds **6 new audit checks** (category G) that detect AI-agent-era manifests on a site's origin:

  - **G1** MCP Server Card at `/.well-known/mcp/server-card.json`
  - **G2** A2A `agent-card.json` at `/.well-known/agent-card.json`
  - **G3** API Catalog (RFC 9727) at `/.well-known/api-catalog`
  - **G4** `agent-permissions.json` at `/.well-known/agent-permissions.json`
  - **G5** OAuth Authorization Server Metadata (RFC 8414) at `/.well-known/oauth-authorization-server`
  - **G6** WebMCP form annotations in HTML

  These checks are **informational in v0.3.x** (`points: 0`). They appear in the audit report so users can see their agent-readiness posture, but they don't affect the SEO/AEO/GEO score — keeping the 0-100 baseline comparable across versions.

  The score header now reads `39 of 56 audit checks active` (up from `33 of 50`). Category G adds a new `agent-readiness` enum value to `@answerfox/core` and a new category in the registry.

  Scaffolding (write-the-manifest commands like `af add agent-card`) is scoped for v0.3.1.

  Why this matters: Stripe, Vercel, Supabase, and Linear were each missing 4 to 5 of these 6 manifests as of mid-2026. As AI agents act on users' behalf (search via Perplexity/Claude/ChatGPT, transact via Stripe Agentic Commerce, etc.), the manifest layer becomes how your site is discovered, trusted, and used. Answerfox is the first audit-as-code tool to surface gaps directly in the developer's terminal.

## 0.2.0

### Minor Changes

- d164034: Rebrand to Answerfox. The toolkit is now published under the `@answerfox/*` scope, the CLI command is `answerfox`, the base error class is `AnswerfoxError`, and documentation links point to `answerfox.dev`. This is the first unified `0.2.0` release across all seven packages under the new brand. Users on `@answerable-kit/*` should migrate to `@answerfox/*`.

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.

## 0.1.0

### Minor Changes

- eeb3966: Introduce the core primitives every other Answerfox package builds on:

  - Branded `URLString` and `AbsoluteUrl` types with zod schemas; `parseAbsoluteUrl` / `tryParseAbsoluteUrl` helpers.
  - `Severity` enum (`critical` / `high` / `medium` / `low`) with `SEVERITY_ORDER` and `severityRank`.
  - `Category` enum (six audit categories) plus `CATEGORY_ID_PREFIX` and `CATEGORY_POINT_BUDGET` constants that mirror AUDIT-FRAMEWORK.md.
  - `AnswerfoxError` base class with `InvalidUrlError` and `SchemaValidationError` subclasses, all carrying stable error codes.
  - `Check` interface and `defineCheck()` identity helper for authoring typed audit checks.
