# @answerable-kit/cli

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.
- Updated dependencies [07e0c2f]
  - @answerable-kit/audit@0.1.1
  - @answerable-kit/core@0.1.1
  - @answerable-kit/templates@0.1.1

## 0.1.0

### Minor Changes

- 7e0026d: Scaffold `@answerable-kit/cli` — the seventh and final library package — exposing the `answerable` command. Wraps the audit engine for terminal and CI use.

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

- 66dc148: Add two new CLI commands that wire `@answerable-kit/templates` into the developer flow:

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
  - @answerable-kit/audit@0.1.0
  - @answerable-kit/core@0.1.0
  - @answerable-kit/templates@0.1.0
