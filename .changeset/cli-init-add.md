---
"@answerable/cli": minor
---

Add two new CLI commands that wire `@answerable/templates` into the developer flow:

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
