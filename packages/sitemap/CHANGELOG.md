# @answerfox/sitemap

## 0.2.2

### Patch Changes

- Updated dependencies [515ca16]
- Updated dependencies [304703a]
  - @answerfox/core@0.4.0

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

- 89f1298: Scaffold the `@answerfox/sitemap` package — the fourth workspace package — and ship two exports:

  - **`buildSitemap(routes, { baseUrl })`** — returns a Next.js `MetadataRoute.Sitemap`. Each route is just `{ path }` plus optional `lastModified`, `changeFrequency`, `priority`, and locale `alternates`. URL composition is automatic; explicit `priority`/`changeFrequency` always overrides inferred defaults.
  - **`sitemapIndex(entries)`** — typed builder for sites that exceed Google's 50k-URL per-file limit. Validates URLs and `lastModified` values; returns a typed array the caller serializes.

  Smart defaults inferred from path patterns:

  | Pattern                                            | priority | changeFrequency |
  | -------------------------------------------------- | -------- | --------------- |
  | `/`                                                | 1.0      | daily           |
  | `/blog/*`, `/news/*`, `/posts/*`                   | 0.7      | weekly          |
  | `/docs/*`                                          | 0.6      | weekly          |
  | `/products/*`, `/pricing`                          | 0.8      | weekly          |
  | `/about`, `/privacy`, `/terms`, `/contact`, `/faq` | 0.3      | yearly          |
  | fallback                                           | 0.5      | monthly         |

  Validation: paths must start with `/` (full URLs rejected), `priority` must be 0.0–1.0, duplicate paths rejected, `lastModified` accepts `Date` or ISO 8601 string (with the same silent-rollover guard `article()` uses). Validation issues batch into one `SchemaValidationError`. Bad URLs throw `InvalidUrlError`.

  `next` declared as `peerDependency` (≥14).

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerfox/core@0.1.0
