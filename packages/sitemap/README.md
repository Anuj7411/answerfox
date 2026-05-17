# @answerable-kit/sitemap

Sitemap builder for the [Answerable](https://github.com/Anuj7411/answerable) SEO toolkit. Takes a list of paths, applies smart defaults inferred from path patterns, and returns a Next.js-compatible `MetadataRoute.Sitemap`.

> **v0.1.0.** `buildSitemap()` and `sitemapIndex()` ship today with smart path-based defaults for priority and change frequency.

## Install

```bash
pnpm add @answerable-kit/sitemap
# requires next >= 14
```

## Usage

```ts
// app/sitemap.ts
import { buildSitemap } from '@answerable-kit/sitemap';

export default function sitemap() {
  return buildSitemap(
    [
      { path: '/' },
      { path: '/about' },
      { path: '/privacy' },
      { path: '/blog/launch' },
      { path: '/blog/post-1', lastModified: '2026-05-14' },
    ],
    { baseUrl: 'https://acme.com' },
  );
}
```

## Smart defaults

Priority and `changeFrequency` are inferred from path patterns when you don't set them explicitly:

| Path pattern | priority | changeFrequency |
|---|---|---|
| `/` (home) | 1.0 | daily |
| `/blog/*`, `/news/*`, `/posts/*` | 0.7 | weekly |
| `/docs/*` | 0.6 | weekly |
| `/products/*`, `/pricing` | 0.8 | weekly |
| `/about`, `/privacy`, `/terms`, `/contact`, `/faq` | 0.3 | yearly |
| Anything else | 0.5 | monthly |

Explicit `priority` or `changeFrequency` on a route always wins over inferred defaults.

## Large sites (>50k URLs)

```ts
import { sitemapIndex } from '@answerable-kit/sitemap';

const index = sitemapIndex([
  { url: 'https://acme.com/sitemap-1.xml' },
  { url: 'https://acme.com/sitemap-2.xml', lastModified: new Date() },
]);
```

## License

[MIT](../../LICENSE) © 2026 Anuj Ojha
