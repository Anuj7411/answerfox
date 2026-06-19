# @answerfox/templates

## 0.4.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [515ca16]
- Updated dependencies [304703a]
  - @answerfox/core@0.4.0

## 0.3.0

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

## 0.2.1

### Patch Changes

- Updated dependencies [f514451]
  - @answerfox/core@0.3.0

## 0.2.0

### Minor Changes

- d164034: Rebrand to Answerfox. The toolkit is now published under the `@answerfox/*` scope, the CLI command is `answerfox`, the base error class is `AnswerfoxError`, and documentation links point to `answerfox.dev`. This is the first unified `0.2.0` release across all seven packages under the new brand. Users on `@answerable-kit/*` should migrate to `@answerfox/*`.

### Patch Changes

- Updated dependencies [d164034]
  - @answerfox/core@0.2.0

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.
- Updated dependencies [07e0c2f]
  - @answerfox/core@0.1.1

## 0.1.0

### Minor Changes

- d7c2eba: Scaffold the `@answerfox/templates` package — the fifth workspace package — and ship its first five page templates plus the token-substitution engine:

  - **`renderContent(content, values)`** — strict in both directions: every `{{TOKEN}}` referenced in `content` must have a value, and every key in `values` must correspond to a referenced token. Missing-token and unknown-token issues batch into one `SchemaValidationError` so the CLI can re-prompt with the full list.
  - **`extractTokens(content)`** — returns the distinct token names referenced by a template, sorted. Used by the registry to derive `requiredTokens` and by `renderContent` for validation.
  - **`getTemplate(name)`**, **`listTemplates()`**, **`renderTemplate(name, values)`** — the public registry API. Five templates ship: `about`, `privacy`, `terms`, `faq`, `contact`.

  Each template is a complete Next.js App Router page that imports `defineSeo()` from `@answerfox/metadata` and (where appropriate) a JSON-LD generator from `@answerfox/schemas`. Drop the rendered file into `app/<name>/page.tsx` and you have a working, audit-ready page.

  Audit framework coverage from this PR:

  | Template  | Drives                                                 |
  | --------- | ------------------------------------------------------ |
  | `about`   | D1 (About), D5 (chrome link), C2 (Organization schema) |
  | `privacy` | D2 (Privacy), D6 (footer link)                         |
  | `terms`   | D3 (Terms), D6 (footer link)                           |
  | `faq`     | B5 (FAQ section), C4 (FAQPage schema)                  |
  | `contact` | D4 (Contact info), D6 (footer link)                    |

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerfox/core@0.1.0
