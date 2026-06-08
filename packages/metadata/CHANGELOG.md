# @answerfox/metadata

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

- 672c226: Scaffold the `@answerfox/metadata` package and ship its first export:

  - **`defineSeo(input)`** — composes a complete Next.js App Router `Metadata` object from a single typed input: `title` (string or template), `description`, canonical URL, `metadataBase`, full `openGraph`, full `twitter`, and optional `robots`. Drives audit checks **A1** (title), **A3** (description), **A4** (canonical), and the **F-series** (OpenGraph + Twitter cards).
  - **Smart fallback chain**: a single top-level `image` populates both OG and Twitter images; OG `title`/`description` fall back to the top level when omitted; Twitter falls back to OG, then to the top level.
  - **Robots conflict guard**: Googlebot directives must be at most as permissive as the top-level directives (`top-level index: false` + `googleBot.index: true` is rejected as contradictory).
  - **Sensible defaults**: `og.type` defaults to `'website'`; `twitter.card` defaults to `'summary_large_image'`.
  - **`next`** is declared as a `peerDependency` (≥14) — consumers bring their own Next.js.

  Validation issues (empty title/description, missing `%s` in template, robots conflicts) batch into one `SchemaValidationError`. Bad URLs throw `InvalidUrlError` from `@answerfox/core`.

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerfox/core@0.1.0
