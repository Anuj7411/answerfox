# @answerable-kit/metadata

Next.js App Router metadata helpers for the [Answerable](https://github.com/Anuj7411/answerable) SEO toolkit. Compose `title`, `description`, canonical URL, OpenGraph, Twitter, and robots directives from a single typed input — with smart fallbacks across the social-card chain.

> **v0.1.0.** `defineSeo()` ships today and is stable. Additional helpers (`defineRobots()`, `defineOg()`) are tracked on the [roadmap](../../docs/internal/ROADMAP.md).

## Install

```bash
pnpm add @answerable-kit/metadata
# requires next >= 14
```

## Usage

```tsx
// app/layout.tsx
import { defineSeo } from '@answerable-kit/metadata';

export const metadata = defineSeo({
  title: { default: 'Acme', template: '%s — Acme' },
  description: 'The friendliest widget shop on the internet.',
  url: 'https://acme.com',
  image: 'https://acme.com/og.png',
  siteName: 'Acme',
  locale: 'en_US',
});
```

What you get back is a fully-formed Next.js `Metadata` object: `title` template, `metadataBase`, `alternates.canonical`, `openGraph`, `twitter`, and (when supplied) `robots` — all populated from the same source of truth.

## Smart defaults

- **Image fallback chain**: a single top-level `image` populates both `openGraph.images` and `twitter.images` unless overridden.
- **Title / description fallback**: OG and Twitter inherit from the top level unless explicitly set, and Twitter inherits from OG when set there but not on Twitter.
- **Canonical** is required and validated as an absolute `http(s)` URL.
- **`twitter.card` defaults to `summary_large_image`** — the better-converting default.

## Robots conflict guard

Googlebot directives must be *at most as permissive* as the top-level directives — Google can be told to be stricter than the global, but not looser. `defineSeo()` rejects e.g. `index: false` at the top with `googleBot.index: true`.

## License

[MIT](../../LICENSE) © 2026 Anuj Ojha
