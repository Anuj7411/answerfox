---
"@answerable/schemas": minor
---

Add `product()` and `softwareApplication()` generators with shared commerce primitives:

- **`product(input)`** — emits `WithContext<Product>` with name, url, optional description, image, brand (mapped to a nested `Brand` object), sku, offers, and aggregateRating. Drives audit check **C6**.
- **`softwareApplication(input)`** — emits `WithContext<SoftwareApplication>` with name, url, required `applicationCategory`, optional `operatingSystem`, description, image, offers, and aggregateRating. Drives audit check **C2** for app pages.
- **New shared input types**: `OffersInput`, `AggregateRatingInput`, `OfferAvailability`. Reused across both generators.
- **Validation lands here**: ISO 4217 currency codes, non-negative finite prices, rating values within `worstRating..bestRating` (defaults 1–5), non-negative integer rating counts, and inverted-range guards (`worstRating > bestRating`).
- Issues batch across top-level + `offers` + `aggregateRating`, so callers see every problem in a single `SchemaValidationError`.
