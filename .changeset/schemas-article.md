---
"@answerable/schemas": minor
---

Add `article()` and `blogPosting()` generators backed by a shared builder:

- **`article(input)`** — emits `WithContext<Article>` covering `headline`, `url`, `mainEntityOfPage`, `datePublished`, `dateModified`, `description`, `image`, `author`, `publisher`. Drives audit check **C5** and surfaces the date and byline signals **D7** / **D8** look for.
- **`blogPosting(input)`** — same shape, emits `@type: 'BlogPosting'`. Schema.org's `BlogPosting` extends `Article` so every input field carries over.
- **`AuthorInput`** is a discriminated union: a `'Person'` author has optional `url`, an `'Organization'` author has required `url` and optional `logo` — the type system enforces both.
- **ISO 8601 date validation** rejects loose formats (`"5/14/2026"`) AND silent rollovers (`"2026-02-30"` is detected as not Feb 30, even though `Date.parse` accepts it).
- Validation issues are batched into one `SchemaValidationError` so callers see every empty field and bad date at once.
