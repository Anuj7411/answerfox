# @answerable-kit/core

## 0.1.0

### Minor Changes

- eeb3966: Introduce the core primitives every other Answerable package builds on:

  - Branded `URLString` and `AbsoluteUrl` types with zod schemas; `parseAbsoluteUrl` / `tryParseAbsoluteUrl` helpers.
  - `Severity` enum (`critical` / `high` / `medium` / `low`) with `SEVERITY_ORDER` and `severityRank`.
  - `Category` enum (six audit categories) plus `CATEGORY_ID_PREFIX` and `CATEGORY_POINT_BUDGET` constants that mirror AUDIT-FRAMEWORK.md.
  - `AnswerableError` base class with `InvalidUrlError` and `SchemaValidationError` subclasses, all carrying stable error codes.
  - `Check` interface and `defineCheck()` identity helper for authoring typed audit checks.
