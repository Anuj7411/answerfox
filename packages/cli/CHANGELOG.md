# @answerfox/cli

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
