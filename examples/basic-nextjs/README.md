# Basic Next.js Example

The minimal example of an [Answerable](https://github.com/Anuj7411/answerable)-powered Next.js site. Every file under `app/` demonstrates one piece of the toolkit wired together.

This is the committed equivalent of what `answerable init` would produce in a fresh Next.js project. Open each file to trace how a single package contributes to a polished, audit-ready site.

## What's in here

| File | Demonstrates |
|---|---|
| `app/layout.tsx` | `defineSeo()` — site-wide title template, description, OG, Twitter, canonical, robots |
| `app/page.tsx` | `organization()` + `webSite()` JSON-LD on the home page |
| `app/sitemap.ts` | `buildSitemap()` with path-pattern-inferred priorities |
| `app/robots.ts` | Minimal `MetadataRoute.Robots` config |
| `app/about/page.tsx` | Trust page + `organization()` JSON-LD |
| `app/faq/page.tsx` | `faqPage()` JSON-LD with the same Q&A in visible content |
| `app/privacy/page.tsx` | Privacy policy starter |
| `app/terms/page.tsx` | Terms of use starter |
| `app/contact/page.tsx` | Contact page |

## Run it

```bash
# From the repo root (one-time):
pnpm install

# Then in this directory:
cd examples/basic-nextjs
pnpm dev
```

Visit http://localhost:3000 and try:

```bash
# In another terminal — audit your local dev server:
pnpm dlx @answerable/cli audit http://localhost:3000
```

You should see a score around 80+ out of 100. The remaining points are content-quality checks (B-series) and off-site signals (E-series) that this minimal example doesn't bother to fake.

## What this is not

- **Not styled.** No CSS, no Tailwind, no design system. The point is the SEO scaffold, not the visuals.
- **Not a real-world example.** No analytics, no auth, no database. See [`examples/sotto/`](../sotto) for that once it lands.
- **Not a tutorial.** Read the source. Every file is short.

## Regenerating from templates

These files match what `answerable init` would write with these tokens:

```text
PROJECT_NAME    = Basic Next.js Example
DOMAIN          = example.com
URL             = https://example.com
DESCRIPTION     = The minimal example of an Answerable-powered Next.js site.
CONTACT_EMAIL   = hello@example.com
EFFECTIVE_DATE  = 2026-05-15
JURISDICTION    = the State of Delaware, USA
```

If you change the templates in `@answerable/templates`, run `answerable init` in this directory and accept overwrites to regenerate.
