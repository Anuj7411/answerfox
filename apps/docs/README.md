# @answerable/docs

The documentation site for [Answerable](https://github.com/Anuj7411/answerable), built with [Nextra 4](https://nextra.site/) on Next.js 15 App Router.

Lives at https://answerable.dev when deployed; runs at http://localhost:3000 locally.

## Run it

```bash
# From the repo root:
pnpm install

# Then in this directory:
cd apps/docs
pnpm dev
```

## What's in here

| Route | Source | Purpose |
|---|---|---|
| `/` | `app/page.tsx` | Landing — the pitch |
| `/docs` | `app/docs/page.mdx` | Getting Started + quickstart |
| `/docs/audit-framework` | `app/docs/audit-framework/page.mdx` | What the audit measures, how the score works |
| `/docs/checks/<ID>` | `app/docs/checks/[id]/page.tsx` | Dynamic — one page per registered audit check |

The dynamic check route reads `DEFAULT_CHECKS` from `@answerable/audit` at build time and resolves every `docsUrl` an audit check references. No "coming soon" stubs — if a check is registered, its docs page works.

## Deploying

Set the Vercel project root to `apps/docs/` and Vercel infers the build automatically. Or:

```bash
pnpm build
pnpm start
```

## Pre-alpha disclaimer

The site is a scaffold. Content depth lands in subsequent PRs (recipes, concepts, API reference).
