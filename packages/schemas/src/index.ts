/**
 * @answerable/schemas — type-safe JSON-LD generators for the
 * Answerable SEO toolkit. Each helper returns a `WithContext<T>`
 * object from `schema-dts` (narrowed to remove the IRI-reference
 * variant) that's ready to be embedded as
 * `<script type="application/ld+json">{...}</script>`.
 */

export const VERSION = '0.0.0';

export {
  article,
  blogPosting,
  type ArticleInput,
  type AuthorInput,
  type PublisherInput,
} from './article.js';

export { breadcrumb, type BreadcrumbInput, type BreadcrumbItemInput } from './breadcrumb.js';

export { faqPage, type FaqPageInput, type FaqQuestionInput } from './faq-page.js';

export { howTo, type HowToInput, type HowToStepInput } from './how-to.js';

export {
  organization,
  type ContactPointInput,
  type OrganizationInput,
} from './organization.js';

export { product, type ProductInput } from './product.js';

export {
  softwareApplication,
  type SoftwareApplicationInput,
} from './software-application.js';

export { webSite, type WebSiteInput } from './website.js';

export type { AggregateRatingInput, OfferAvailability, OffersInput } from './_offers.js';
