# @answerable/templates

Page templates installed into user projects by the [Answerable](https://github.com/Anuj7411/answerable) CLI. Each template is a Next.js App Router page (`.tsx`) wired up with `defineSeo()` from `@answerable/metadata` and the matching JSON-LD generator from `@answerable/schemas` — drop one in and you have a working, audit-ready page.

> **Pre-alpha.** Five templates ship today: About, Privacy, Terms, FAQ, Contact.

## Public API

```ts
import { listTemplates, getTemplate, renderTemplate } from '@answerable/templates';

// Enumerate every available template:
for (const t of listTemplates()) {
  console.log(t.name, t.filename, t.requiredTokens);
}

// Render a template with substituted token values:
const source = renderTemplate('about', {
  PROJECT_NAME: 'Acme',
  DOMAIN: 'acme.com',
  URL: 'https://acme.com',
  DESCRIPTION: 'The friendliest widget shop on the internet.',
});

// `source` is now a string of TSX, ready to write to app/about/page.tsx.
```

## Templates & audit checks

| Template | Filename | Drives audit checks |
|---|---|---|
| `about` | `app/about/page.tsx` | D1 (About page), D5 (chrome link), C2 (Organization schema) |
| `privacy` | `app/privacy/page.tsx` | D2 (Privacy policy), D6 (footer link) |
| `terms` | `app/terms/page.tsx` | D3 (Terms of use), D6 (footer link) |
| `faq` | `app/faq/page.tsx` | B5 (FAQ section), C4 (FAQPage schema) |
| `contact` | `app/contact/page.tsx` | D4 (Contact info), D6 (footer link) |

## Validation

`renderTemplate()` rejects:
- **Missing tokens** — every `{{TOKEN}}` referenced in the template must have a value
- **Unknown tokens** — every key in your `values` object must correspond to a `{{TOKEN}}` referenced in the template (catches typos at install time)

Both errors include the full list of offending tokens so the CLI can surface them all in one prompt.

## License

[MIT](../../LICENSE) © 2026 Anuj Ojha
