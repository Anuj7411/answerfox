# @answerable-kit/metadata

## 0.1.1

### Patch Changes

- 07e0c2f: Refresh package README headers: replace stale "Pre-alpha" notices with accurate v0.1.0 release context. No code or API changes — documentation only.
- Updated dependencies [07e0c2f]
  - @answerable-kit/core@0.1.1

## 0.1.0

### Minor Changes

- 672c226: Scaffold the `@answerable-kit/metadata` package and ship its first export:

  - **`defineSeo(input)`** — composes a complete Next.js App Router `Metadata` object from a single typed input: `title` (string or template), `description`, canonical URL, `metadataBase`, full `openGraph`, full `twitter`, and optional `robots`. Drives audit checks **A1** (title), **A3** (description), **A4** (canonical), and the **F-series** (OpenGraph + Twitter cards).
  - **Smart fallback chain**: a single top-level `image` populates both OG and Twitter images; OG `title`/`description` fall back to the top level when omitted; Twitter falls back to OG, then to the top level.
  - **Robots conflict guard**: Googlebot directives must be at most as permissive as the top-level directives (`top-level index: false` + `googleBot.index: true` is rejected as contradictory).
  - **Sensible defaults**: `og.type` defaults to `'website'`; `twitter.card` defaults to `'summary_large_image'`.
  - **`next`** is declared as a `peerDependency` (≥14) — consumers bring their own Next.js.

  Validation issues (empty title/description, missing `%s` in template, robots conflicts) batch into one `SchemaValidationError`. Bad URLs throw `InvalidUrlError` from `@answerable-kit/core`.

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerable-kit/core@0.1.0
