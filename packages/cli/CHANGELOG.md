# @answerfox/cli

## 0.4.2

### Patch Changes

- 4d8a0de: Reweight Agent Readiness category (G1-G6) from 0 to 30 of 100 total points.

  Agent Readiness is the Answerfox wedge — until now the six G category
  checks (MCP Server Card, A2A agent-card.json, RFC 9727 API Catalog,
  agent-permissions.json, OAuth discovery, WebMCP form annotations) were
  informational only and didn't affect the score. A site that aced classic
  SEO but shipped zero agent manifests scored 100/100, which undermines
  the point of the framework.

  New weights: G1=6, G2=6, G3=5, G4=5, G5=4, G6=4 (total 30 of 100).
  A "classic-perfect" site with no AR manifests now scores 70 (average band)
  instead of 100 (excellent). Existing classic-SEO checks are unchanged.

  Tests updated to match. No code-path changes outside `points: 0 → N` on
  the six G check definitions.

- 0141cc0: v0.5.0 phase 1 — Cloudflare Agent Readiness Score coverage parity push.

  Adds 2 new checks (sitemap.xml at A11, llms.txt at G7), bringing the active
  audit framework from 39 to 41 checks (of 58 planned by v0.6.0).

  New checks

  - **A11 sitemap.xml**: detects sitemap.xml at the origin root, accepts both
    urlset and sitemapindex shapes. 2 points, medium severity. Matches the
    Cloudflare "Discoverability" category.
  - **G7 llms.txt**: detects llms.txt at the origin root, requires markdown
    shape with an H1 and at least one link. 5 points, medium severity. Adopted
    by ~10% of all sites, ~40% of developer-facing SaaS (Anthropic, Stripe,
    Vercel, Cloudflare).

  Framework reweight

  - G category total moves from 30 to 35 of 100 points (G7 added at 5 pts;
    G1-G6 unchanged).
  - A classic-perfect fixture without AR manifests now scores 65 (was 70 in
    v0.4.x reweight, was 100 in v0.3.x). The wedge gets sharper with every
    AR check added.

  New helper

  - `fetchOriginPath(url, path)` for root-relative artifact fetches, mirroring
    the existing `fetchWellKnown` helper. Used by A11 and G7.

  Tests

  - 13 new test cases (7 for A11, 6 for G7) covering pass/fail/warn/network
    error/empty body/wrong shape branches per check. All 204 tests pass.

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

- bcc78c2: v0.5.0 phase 3 — completes the agent manifest scaffolder set.

  Adds two new manifest templates so the CLI can scaffold every G category
  check that audits to a missing file. Users who score 0/8 on Agent
  Readiness can now run a single command per gap to ship the fix.

  New templates

  - **llms-txt** at `public/llms.txt` (audit check G7). Per the llmstxt.org
    spec: H1 site name, blockquote description, and starter sections with
    curated markdown links to docs, about, and optional content.
  - **web-bot-auth** at `public/.well-known/http-message-signatures-directory`
    (audit check G8). JWKS-shaped JSON declaring an Ed25519 public key with
    an inline `_comment` field walking the user through key generation
    (`openssl genpkey -algorithm ed25519`), base64url encoding, and signing
    per RFC 9421.

  CLI commands

  - `answerfox add llms-txt` — scaffolds the llms.txt file
  - `answerfox add web-bot-auth` — scaffolds the JWKS directory
  - Both join the existing `agent-card`, `mcp-server-card`, `api-catalog`,
    `agent-permissions`, `oauth-discovery` set. Total of 7 G-category
    manifest scaffolders now available.

  Notes

  - Both new templates are framework-agnostic (no Next.js gate, write
    under `public/`).
  - The registry-invariant test was relaxed to allow `public/<file>` in
    addition to `public/.well-known/<file>` — llms.txt is the spec
    exception that puts the file at the origin root.
  - No new audit checks in this PR. Phase 3 closes the "we fix" promise
    for the 8 AR checks already shipped (G1-G8). Agentic Commerce (H1-H4)
    lands next in v0.6.0.

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

- Updated dependencies [4d8a0de]
- Updated dependencies [0141cc0]
- Updated dependencies [515ca16]
- Updated dependencies [bcc78c2]
- Updated dependencies [304703a]
  - @answerfox/audit@0.5.0
  - @answerfox/core@0.4.0
  - @answerfox/templates@0.4.0

## 0.4.1

### Patch Changes

- 5e28bc4: Add gated-page detection. When the audited URL looks like a logged-out gate page (login wall on linkedin.com, github.com, gmail.com, etc.), the report now includes a banner above the score line explaining why the score is low: the page is intentionally minimal, not broken.

  5 heuristics, page is classified as a gate if 3 or more fire:

  - Title under 30 characters
  - Title contains a login keyword (sign in, log in, welcome to, join now, etc.)
  - Page has a password input
  - Body word count under 200
  - No /about /pricing /docs /blog links anywhere on the page

  The score itself is NOT adjusted, the engine stays deterministic. Gate pages still surface real fixable issues for sites that want to optimize them anyway.

  This kills the most common misread of the tool ("I audited linkedin.com and got 50, the tool is broken") permanently. New `AuditReport.gatePage` field exposes the detection for downstream consumers; reporters print a yellow banner with the matching signals listed.

  Internal: new `gate-detector.ts` module in `@answerfox/audit`. Wired into `runChecks()` and the console reporter. 7 new tests, all 25 audit-level tests pass.

- Updated dependencies [5e28bc4]
  - @answerfox/audit@0.4.0

## 0.4.0

### Minor Changes

- 2272e73: Ship v0.3.1: Agent Readiness scaffolding (the complement to v0.3.0 detection).

  The CLI `add` command now scaffolds 5 agent-readiness manifest templates alongside the existing 5 trust-page templates:

  ```bash
  af add agent-card           # writes public/.well-known/agent-card.json
  af add mcp-server-card      # writes public/.well-known/mcp/server-card.json
  af add api-catalog          # writes public/.well-known/api-catalog (RFC 9727)
  af add agent-permissions    # writes public/.well-known/agent-permissions.json
  af add oauth-discovery      # writes public/.well-known/oauth-authorization-server (RFC 8414)
  ```

  You can also install multiple in one command:

  ```bash
  af add agent-card mcp-server-card agent-permissions
  ```

  Three things to know:

  1. **Manifest templates do NOT require Next.js.** They write to `public/.well-known/` which works in any framework (Astro, Remix, Vite, plain HTML, etc.). The Next.js App Router gate only applies when you're installing page templates.
  2. **No prompts.** Manifests have no required tokens, the content uses sensible defaults with `TODO` placeholders for the fields you should edit.
  3. **`af init` is unchanged.** It still scaffolds the 5 trust pages + sitemap + robots for a fresh Next.js project. Manifests are intentionally opt-in via `af add` since not every project wants every manifest.

  This completes the Agent Readiness wedge: v0.3.0 ships detection (the 6 G checks in audit), v0.3.1 ships scaffolding (write-the-manifest commands here). Cold-mail recipients who asked "would scaffolding be useful" can now answer yes by running the commands.

  Internal: extends `@answerfox/templates` `TemplateName` with the 5 new manifest names (`PageTemplateName` and `ManifestTemplateName` discriminated subtypes). Adds an `isManifestTemplate()` helper. Updates `add.ts` gate logic. Total: 81 of 81 templates tests pass, 63 of 63 cli tests pass.

### Patch Changes

- Updated dependencies [2272e73]
  - @answerfox/templates@0.3.0

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
  - @answerfox/audit@0.3.0
  - @answerfox/core@0.3.0
  - @answerfox/templates@0.2.1

## 0.2.2

### Patch Changes

- f6c339e: Add `af` short alias for the `answerfox` binary. After `pnpm add -g @answerfox/cli`, both `answerfox audit <url>` and `af audit <url>` work identically. Saves 7 characters per invocation, faster for repeat use.

## 0.2.1

### Patch Changes

- 058487c: Fix two CLI bugs. `--version` now reads the real version from package.json instead of printing a hardcoded `0.0.0`. The `audit` command now sets the exit code and lets the process exit naturally instead of calling `process.exit()` while fetch (undici) sockets are still closing, which previously triggered a libuv assertion crash on Windows after the report printed.

## 0.2.0

### Minor Changes

- d164034: Rebrand to Answerfox. The toolkit is now published under the `@answerfox/*` scope, the CLI command is `answerfox`, the base error class is `AnswerfoxError`, and documentation links point to `answerfox.dev`. This is the first unified `0.2.0` release across all seven packages under the new brand. Users on `@answerable-kit/*` should migrate to `@answerfox/*`.

### Patch Changes

- Updated dependencies [d164034]
  - @answerfox/audit@0.2.0
  - @answerfox/core@0.2.0
  - @answerfox/templates@0.2.0

## 0.1.2

### Patch Changes

- Updated dependencies [6ea0355]
  - @answerfox/audit@0.1.2

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.
- Updated dependencies [07e0c2f]
  - @answerfox/audit@0.1.1
  - @answerfox/core@0.1.1
  - @answerfox/templates@0.1.1

## 0.1.0

### Minor Changes

- 7e0026d: Scaffold `@answerfox/cli` — the seventh and final library package — exposing the `answerable` command. Wraps the audit engine for terminal and CI use.

  **Commands shipping today:**

  - `answerable audit <url>` — fetch, run all 17 checks, print a human-readable report
  - `answerable audit <url> --json` — emit JSON to stdout (CI integration)
  - `answerable audit <url> --ci --min-score 80` — exit non-zero when score < threshold
  - `answerable audit <url> --no-color` — disable ANSI for non-TTY pipelines
  - `answerable explain <check-id>` — full doc for a single check (description · category · severity · rationale · docs URL)

  **Exit codes:**

  - `0` — success (and, with `--ci`, score ≥ threshold)
  - `1` — CI threshold not met
  - `2` — argument error, unknown check ID, or audit failure (network, parse)

  **Architecture note.** Each command is split into a pure runner (`runAuditCommand`, `runExplainCommand`) that returns `{ stdout, exitCode, error? }`, and a thin commander registration that wires the runner to `process.stdout` / `process.exit`. The runners take an optional deps object for test injection (`{ auditImpl }`) — so tests never hit the network and never call `process.exit`.

  **Deferred to Step 12:** `init`, `add`, and `verify` commands (need more design — interactive prompts, file-writing patterns, JSON-LD walking).

- 66dc148: Add two new CLI commands that wire `@answerfox/templates` into the developer flow:

  - **`answerable init`** — interactive setup of an existing Next.js project. Detects Next.js + App Router; prompts for three irreducible tokens (project name, domain, contact email); derives the rest; installs all five page templates + `app/sitemap.ts` + `app/robots.ts`. Prompts before overwriting an existing file.
  - **`answerable add <templates>`** — install a specific subset of templates. Accepts space- or comma-separated names: `answerable add about,faq` or `answerable add about faq`. Only prompts for the tokens those templates need.

  **New testable infrastructure:**

  - **`Fs`** interface + `NodeFs` (production) + `InMemoryFs` (tests). All paths normalized to forward-slash form so Windows and POSIX hosts produce identical in-memory layouts.
  - **`Prompter`** interface + `ClackPrompter` (@clack/prompts) + `ScriptedPrompter` (returns canned answers from a queue, throws on overflow or type mismatch).
  - **`detectNextProject(cwd, fs)`** — checks `package.json` for `next` in either dependencies or devDependencies, plus `app/` directory presence.
  - **`installFile()`** — write a rendered file to disk; prompt before overwriting; create parent directories as needed.
  - **`collectTokens()`** — prompts for the three irreducible tokens (PROJECT_NAME, DOMAIN, CONTACT_EMAIL) and derives URL (`https://${DOMAIN}`), DESCRIPTION (placeholder), EFFECTIVE_DATE (today's ISO date), and JURISDICTION (placeholder). Indie-dev tools that ask seven questions get abandoned mid-init — we keep it short and put `[Edit me]` placeholders where lawyers and editors will replace text anyway.

  **New exit codes:**

  - `0` — success
  - `2` — argument error / no Next.js project / no `app/` directory / unknown template name
  - `130` — user cancelled a prompt (SIGINT-equivalent)

  **Deferred to Step 12b:** `answerable verify` (JSON-LD validation in local source), layout.tsx wiring, page.tsx JSON-LD injection.

### Patch Changes

- Updated dependencies [a9e17cb]
- Updated dependencies [f2aadfe]
- Updated dependencies [ab812b8]
- Updated dependencies [eeb3966]
- Updated dependencies [d7c2eba]
  - @answerfox/audit@0.1.0
  - @answerfox/core@0.1.0
  - @answerfox/templates@0.1.0
