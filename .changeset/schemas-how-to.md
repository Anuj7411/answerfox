---
"@answerable/schemas": minor
---

Add `howTo()` — the eighth and final Phase 1 generator, completing the `@answerable/schemas` package:

- **`howTo(input)`** — emits `WithContext<HowTo>` with `name`, ordered `step` array (auto-numbered `position`), optional `description`, `totalTime`, `image`, `supply`, and `tool`. Drives audit check **C8**.
- **`HowToStepInput`** — `name` + `text` required; optional `image` and `url` for richer steps (e.g. video timestamps).
- **`HowToInput`** — top-level fields plus required non-empty `steps` array and optional string arrays for `supply` (consumables → `HowToSupply` nested objects) and `tool` (reusables → `HowToTool` nested objects).
- **ISO 8601 duration validation** for `totalTime`: accepts `"PT15M"`, `"PT1H30M"`, `"P1D"`, `"P2W"`, `"P1Y2M3D"`, `"P1DT2H"`, fractional seconds (`"PT30.5S"`); rejects weeks-mixed-with-other-components and the "P with nothing after it" trap.
- Validation issues batch across top level + every step + `totalTime`, surfacing every problem in a single `SchemaValidationError`.
