import { renderContent } from './render.js';
import { aboutTemplate } from './templates/about.js';
import { contactTemplate } from './templates/contact.js';
import { faqTemplate } from './templates/faq.js';
import { privacyTemplate } from './templates/privacy.js';
import { termsTemplate } from './templates/terms.js';
import type { Template, TemplateName, TokenValues } from './types.js';

const REGISTRY: Readonly<Record<TemplateName, Template>> = {
  about: aboutTemplate,
  privacy: privacyTemplate,
  terms: termsTemplate,
  faq: faqTemplate,
  contact: contactTemplate,
};

/**
 * Every template registered with the package, in a stable order
 * matching the AUDIT-FRAMEWORK trust-page sequence (D1 → D4).
 * Useful for `answerfox add all` flows in the CLI.
 */
export function listTemplates(): readonly Template[] {
  return Object.values(REGISTRY);
}

/**
 * Look up a single template by name. Returns the same object across
 * calls — safe to compare by reference if you need to.
 */
export function getTemplate(name: TemplateName): Template {
  return REGISTRY[name];
}

/**
 * Render a template by name with the supplied token values. Equivalent
 * to `renderContent(getTemplate(name).content, values)` — see
 * `renderContent` for the validation semantics.
 *
 * @throws SchemaValidationError if any required token is missing or
 *   any provided key is unknown to the template.
 */
export function renderTemplate(name: TemplateName, values: TokenValues): string {
  return renderContent(getTemplate(name).content, values);
}
