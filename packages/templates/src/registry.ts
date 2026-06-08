import { renderContent } from './render.js';
import { aboutTemplate } from './templates/about.js';
import { agentCardTemplate } from './templates/agent-card.js';
import { agentPermissionsTemplate } from './templates/agent-permissions.js';
import { apiCatalogTemplate } from './templates/api-catalog.js';
import { contactTemplate } from './templates/contact.js';
import { faqTemplate } from './templates/faq.js';
import { mcpServerCardTemplate } from './templates/mcp-server-card.js';
import { oauthDiscoveryTemplate } from './templates/oauth-discovery.js';
import { privacyTemplate } from './templates/privacy.js';
import { termsTemplate } from './templates/terms.js';
import type { Template, TemplateName, TokenValues } from './types.js';

const REGISTRY: Readonly<Record<TemplateName, Template>> = {
  // Page templates (trust pages, Next.js App Router only)
  about: aboutTemplate,
  privacy: privacyTemplate,
  terms: termsTemplate,
  faq: faqTemplate,
  contact: contactTemplate,
  // Manifest templates (agent-readiness, framework-agnostic, v0.3.1+)
  'agent-card': agentCardTemplate,
  'mcp-server-card': mcpServerCardTemplate,
  'api-catalog': apiCatalogTemplate,
  'agent-permissions': agentPermissionsTemplate,
  'oauth-discovery': oauthDiscoveryTemplate,
};

/**
 * True if the template is a manifest (writes to public/.well-known/)
 * rather than a page (writes to app/). Used by the CLI to decide
 * whether to gate on a Next.js project.
 */
export function isManifestTemplate(name: TemplateName): boolean {
  return REGISTRY[name].filename.startsWith('public/');
}

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
