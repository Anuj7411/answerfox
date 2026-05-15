/**
 * @answerable/sitemap — sitemap builder with smart path-based defaults
 * for the Answerable SEO toolkit. Wraps Next.js's `MetadataRoute.Sitemap`
 * type with priority/changeFrequency inference, URL composition,
 * duplicate-path detection, and a sitemap-index helper for large sites.
 */

export const VERSION = '0.0.0';

export {
  buildSitemap,
  type BuildSitemapOptions,
  type ChangeFrequency,
  type SitemapRouteInput,
} from './build-sitemap.js';

export { sitemapIndex, type SitemapIndexEntry } from './sitemap-index.js';
