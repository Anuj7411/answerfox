# @answerfox/audit

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

### Patch Changes

- Updated dependencies [f514451]
  - @answerfox/core@0.3.0

## 0.2.0

### Minor Changes

- d164034: Rebrand to Answerfox. The toolkit is now published under the `@answerfox/*` scope, the CLI command is `answerfox`, the base error class is `AnswerfoxError`, and documentation links point to `answerfox.dev`. This is the first unified `0.2.0` release across all seven packages under the new brand. Users on `@answerable-kit/*` should migrate to `@answerfox/*`.

### Patch Changes

- Updated dependencies [d164034]
  - @answerfox/core@0.2.0

## 0.1.2

### Patch Changes

- 6ea0355: Add a framework-coverage footer to the console reporter so users scoring 100/100 understand they were audited against the currently-shipped subset (33 of 50 checks at v0.1.x), not the full spec. Also exports a new `TOTAL_PLANNED_CHECKS` constant for downstream tools that want to compute coverage themselves.

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.
- Updated dependencies [07e0c2f]
  - @answerfox/core@0.1.1

## 0.1.0

### Minor Changes

- a9e17cb: Add 16 more checks to the audit registry: content structure (B), E-E-A-T trust signals (D), and off-site citations (E). Audit grows from 17 → **33 checks** covering **~63 of 100 points**.

  **B-series (content & chunking) — 11 new points:**

  | ID  | Check                                                  | Sev      | Pts |
  | --- | ------------------------------------------------------ | -------- | --- |
  | B1  | Exactly one `<h1>`                                     | critical | 3   |
  | B3  | Logical h2/h3 hierarchy (no skipped levels)            | high     | 2   |
  | B4  | Long pages broken into multiple h2 sections            | high     | 2   |
  | B8  | At least one external citation (different-origin link) | medium   | 1   |
  | B11 | ≥3 internal links to sibling pages                     | medium   | 1   |
  | B14 | Lists or tables present (`<ul>`/`<ol>`/`<table>`)      | medium   | 2   |

  **D-series (E-E-A-T & entity authority) — 14 new points:**

  | ID  | Check                                                                | Sev      | Pts |
  | --- | -------------------------------------------------------------------- | -------- | --- |
  | D1  | About page linked                                                    | critical | 3   |
  | D2  | Privacy policy linked                                                | critical | 3   |
  | D3  | Terms of use linked (accepts `/terms`, `/tos`, `/terms-of-use`)      | high     | 2   |
  | D4  | Contact accessible (`/contact` page or `mailto:`)                    | high     | 2   |
  | D5  | Trust link in `<nav>`/`<header>` (about / team / company / newsroom) | high     | 2   |
  | D6  | Footer contains all three of /privacy, /terms, /contact              | high     | 2   |

  **E-series (off-site citation surface) — 7 new points:**

  | ID  | Check                                                                                | Sev    | Pts |
  | --- | ------------------------------------------------------------------------------------ | ------ | --- |
  | E1  | Link to a review / marketplace profile (G2, Product Hunt, Capterra, Trustpilot, ...) | medium | 2   |
  | E7  | GitHub link present                                                                  | medium | 2   |
  | E10 | Organization JSON-LD `sameAs` has ≥3 authoritative profiles                          | medium | 2   |
  | E11 | LinkedIn profile linked                                                              | low    | 1   |

  **Notable design notes:**

  - **B4 (long-page chunking)** treats pages under 1500 chars of body text as "short" and passes them without h2 section requirements — short pages don't need chunking.
  - **B8 (external citations)** parses each link's URL and excludes same-origin absolutes, so a page with only internal `https://example.com/...` links still warns.
  - **D6** distinguishes between "no footer at all" (fail), "footer with 0 of 3 trust links" (fail), and "footer with 1-2 of 3" (warn) — partial credit isn't pass, but the error message tells you what to add.
  - **E10** walks the schema.org `@graph` form via a recursive type-finder, so `organization()` output is detected whether emitted as a single object, inside an array, or under `@graph`.

  67 new tests. PERFECT_HTML fixture updated to exercise all 33 checks; "empty-HTML hits critical band" assertion relaxed to `score < 20` (A8 + B4 still pass on empty HTML by design).

- f2aadfe: Add 12 more checks to the audit registry — meta foundations, Organization JSON-LD, OpenGraph, and Twitter cards. Audit grows from 5 to **17 checks** covering **~31 of 100 points**.

  **A-series (meta & technical) — 7 new points:**

  | ID  | Check                                                                         | Sev    | Pts |
  | --- | ----------------------------------------------------------------------------- | ------ | --- |
  | A6  | Viewport meta (`width=device-width` + `initial-scale=1`)                      | high   | 2   |
  | A7  | charset declared as UTF-8 (modern or http-equiv form)                         | medium | 1   |
  | A8  | robots meta consistent with intent (no accidental noindex, no contradictions) | high   | 2   |
  | A9  | Favicon linked (icon / shortcut icon / mask-icon)                             | medium | 1   |
  | A10 | Apple touch icon linked                                                       | low    | 1   |

  **C-series (structured data) — 2 new points:**

  | ID  | Check                                                                          | Sev  | Pts |
  | --- | ------------------------------------------------------------------------------ | ---- | --- |
  | C2  | Organization JSON-LD present (walks plain objects, arrays, and `@graph` forms) | high | 2   |

  **F-series (OpenGraph & Twitter) — 7 new points:**

  | ID  | Check                                           | Sev    | Pts |
  | --- | ----------------------------------------------- | ------ | --- |
  | F1  | og:title set                                    | high   | 1   |
  | F2  | og:description set                              | high   | 1   |
  | F3  | og:image declared with absolute http(s) URL     | high   | 2   |
  | F5  | og:url declared as canonical absolute URL       | medium | 1   |
  | F6  | twitter:card set to a recognised type           | high   | 1   |
  | F7  | twitter:image (or og:image fallback acceptable) | medium | 1   |

  A8 deliberately _passes_ when no robots meta is present — absence means the default (`index, follow`), which is the correct behaviour for a live page. The check fires only on accidental `noindex` (the most common SEO own-goal) or contradictory directives like `index, noindex`.

  F7 implements the OpenGraph → Twitter fallback chain: a missing `twitter:image` passes if `og:image` is present, since X/Twitter falls back to it.

- ab812b8: Scaffold the `@answerfox/audit` package — the sixth workspace package and the project's killer differentiator — with foundations and the first 5 checks.

  **Foundations:**

  - **`fetchAndParse(url)`** — cheerio-backed static crawler. Polite User-Agent (`Answerfox/0.0.0 (+https://github.com/Anuj7411/answerfox)`), redirect-follow, abort-on-timeout (15s default), `CrawlError` on non-2xx or network failure with cause preserved.
  - **`loadHtml(html)` + `AuditDom`** — thin cheerio wrapper exporting the DOM type so check authors don't depend on cheerio directly.
  - **`runChecks({ url, html, dom, checks? })`** — pure runner with no network. Each check runs in parallel via `Promise.all`. Thrown checks captured as `skip` with the error message — the audit always completes.
  - **`audit(url, options?)`** — convenience wrapper that fetches then runs.
  - **`bandFromScore(score)`** — maps integer score to AUDIT-FRAMEWORK band (critical / weak / average / strong / excellent).
  - **`consoleReport(report)`** — kleur-colored terminal output. Groups failures by severity (critical → high → medium → low), surfaces evidence + fix recommendation + docs URL per finding, lists passing checks at the bottom. Color can be toggled off for CI/snapshot tests.

  **First 5 checks (14 points of 100 total):**

  | ID  | Check                                                              | Severity | Pts |
  | --- | ------------------------------------------------------------------ | -------- | --- |
  | A1  | `<title>` present and 30-60 chars                                  | critical | 3   |
  | A3  | Meta description present and 120-160 chars                         | critical | 3   |
  | A4  | Canonical URL declared (absolute)                                  | critical | 3   |
  | A5  | `<html lang>` BCP 47 tag                                           | high     | 2   |
  | C1  | At least one `<script type="application/ld+json">` with valid JSON | critical | 3   |

  Score is computed against the _checks that ran_ (excluding skips) so category-filtered audits score on their own denominator. Stable check IDs (`A1`, `A3`, ...) match AUDIT-FRAMEWORK.md and never renumber — they're part of the public API once users pin `--ignore A4` in CI.

  The remaining 45 checks land in follow-up PRs (B-series content structure, D-series E-E-A-T, E-series off-site, F-series OG/Twitter, plus the remaining A and C checks).

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerfox/core@0.1.0
