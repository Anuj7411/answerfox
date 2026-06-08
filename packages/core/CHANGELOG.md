# @answerfox/core

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
