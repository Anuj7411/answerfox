# @answerfox/cli

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
