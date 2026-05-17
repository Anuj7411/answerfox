# @answerable-kit/schemas

## 0.1.0

### Minor Changes

- c41b9c9: Add `article()` and `blogPosting()` generators backed by a shared builder:

  - **`article(input)`** — emits `WithContext<Article>` covering `headline`, `url`, `mainEntityOfPage`, `datePublished`, `dateModified`, `description`, `image`, `author`, `publisher`. Drives audit check **C5** and surfaces the date and byline signals **D7** / **D8** look for.
  - **`blogPosting(input)`** — same shape, emits `@type: 'BlogPosting'`. Schema.org's `BlogPosting` extends `Article` so every input field carries over.
  - **`AuthorInput`** is a discriminated union: a `'Person'` author has optional `url`, an `'Organization'` author has required `url` and optional `logo` — the type system enforces both.
  - **ISO 8601 date validation** rejects loose formats (`"5/14/2026"`) AND silent rollovers (`"2026-02-30"` is detected as not Feb 30, even though `Date.parse` accepts it).
  - Validation issues are batched into one `SchemaValidationError` so callers see every empty field and bad date at once.

- 3dd2ebe: Add two more JSON-LD generators and refactor the shared narrowing pattern into an internal helper:

  - **`faqPage()`** — emits a `WithContext<FAQPage>` with each `{ question, answer }` entry mapped to a `Question` + nested `Answer`. The most-leveraged generator for AI answer engines (Perplexity, Claude, ChatGPT all key off FAQPage). Drives audit check `C4`.
  - **`breadcrumb()`** — emits a `WithContext<BreadcrumbList>` with `position` auto-numbered from 1 in input order. Drives audit check `C7`.

  Both generators batch their validation failures: a single `SchemaValidationError.issues` array enumerates every empty question / answer / breadcrumb name in the input rather than throwing on the first.

- 6757fe6: Add `howTo()` — the eighth and final Phase 1 generator, completing the `@answerable-kit/schemas` package:

  - **`howTo(input)`** — emits `WithContext<HowTo>` with `name`, ordered `step` array (auto-numbered `position`), optional `description`, `totalTime`, `image`, `supply`, and `tool`. Drives audit check **C8**.
  - **`HowToStepInput`** — `name` + `text` required; optional `image` and `url` for richer steps (e.g. video timestamps).
  - **`HowToInput`** — top-level fields plus required non-empty `steps` array and optional string arrays for `supply` (consumables → `HowToSupply` nested objects) and `tool` (reusables → `HowToTool` nested objects).
  - **ISO 8601 duration validation** for `totalTime`: accepts `"PT15M"`, `"PT1H30M"`, `"P1D"`, `"P2W"`, `"P1Y2M3D"`, `"P1DT2H"`, fractional seconds (`"PT30.5S"`); rejects weeks-mixed-with-other-components and the "P with nothing after it" trap.
  - Validation issues batch across top level + every step + `totalTime`, surfacing every problem in a single `SchemaValidationError`.

- daa10bf: Introduce the first two JSON-LD generators of the eight Phase 1 will ship:

  - **`organization()`** — emits a `WithContext<Organization>` with name, url, optional logo, description, sameAs, and a nested ContactPoint (defaulting `contactType` to `"customer support"`).
  - **`webSite()`** — emits a `WithContext<WebSite>`. When `searchUrlTemplate` is supplied, attaches a `SearchAction` with the standard `query-input: "required name=search_term_string"` field.

  All URL inputs are validated as absolute http(s) URLs at runtime via `@answerable-kit/core`; invalid input throws `InvalidUrlError`. A bad `searchUrlTemplate` (missing the `{search_term_string}` placeholder) throws `SchemaValidationError`.

- e4fd1d6: Add `product()` and `softwareApplication()` generators with shared commerce primitives:

  - **`product(input)`** — emits `WithContext<Product>` with name, url, optional description, image, brand (mapped to a nested `Brand` object), sku, offers, and aggregateRating. Drives audit check **C6**.
  - **`softwareApplication(input)`** — emits `WithContext<SoftwareApplication>` with name, url, required `applicationCategory`, optional `operatingSystem`, description, image, offers, and aggregateRating. Drives audit check **C2** for app pages.
  - **New shared input types**: `OffersInput`, `AggregateRatingInput`, `OfferAvailability`. Reused across both generators.
  - **Validation lands here**: ISO 4217 currency codes, non-negative finite prices, rating values within `worstRating..bestRating` (defaults 1–5), non-negative integer rating counts, and inverted-range guards (`worstRating > bestRating`).
  - Issues batch across top-level + `offers` + `aggregateRating`, so callers see every problem in a single `SchemaValidationError`.

### Patch Changes

- Updated dependencies [eeb3966]
  - @answerable-kit/core@0.1.0
