# @answerable-kit/templates

## 0.1.0

### Minor Changes

- d7c2eba: Scaffold the `@answerable-kit/templates` package — the fifth workspace package — and ship its first five page templates plus the token-substitution engine:

  - **`renderContent(content, values)`** — strict in both directions: every `{{TOKEN}}` referenced in `content` must have a value, and every key in `values` must correspond to a referenced token. Missing-token and unknown-token issues batch into one `SchemaValidationError` so the CLI can re-prompt with the full list.
  - **`extractTokens(content)`** — returns the distinct token names referenced by a template, sorted. Used by the registry to derive `requiredTokens` and by `renderContent` for validation.
  - **`getTemplate(name)`**, **`listTemplates()`**, **`renderTemplate(name, values)`** — the public registry API. Five templates ship: `about`, `privacy`, `terms`, `faq`, `contact`.

  Each template is a complete Next.js App Router page that imports `defineSeo()` from `@answerable-kit/metadata` and (where appropriate) a JSON-LD generator from `@answerable-kit/schemas`. Drop the rendered file into `app/<name>/page.tsx` and you have a working, audit-ready page.

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
  - @answerable-kit/core@0.1.0
