/**
 * @answerfox/templates ships two kinds of installable templates the
 * Answerfox CLI scaffolds into a user's project.
 *
 * **Page templates** (about, privacy, terms, faq, contact): trust
 * pages installed into a Next.js App Router project at `app/<name>/page.tsx`.
 * Each is a single .tsx file wired up with `defineSeo()` from
 * `@answerfox/metadata` and the matching JSON-LD generator from
 * `@answerfox/schemas`, drop one in and you have a working,
 * audit-ready page.
 *
 * **Manifest templates** (agent-card, mcp-server-card, api-catalog,
 * agent-permissions, oauth-discovery): agent-readiness manifests
 * installed at `public/.well-known/<file>`. Framework-agnostic
 * (Next.js, Astro, Remix, plain Vite). Shipped in v0.3.1 to
 * complete the Agent Readiness wedge (detection in v0.3.0).
 */

export const VERSION = '0.0.0';

export { extractTokens, renderContent } from './render.js';
export { getTemplate, isManifestTemplate, listTemplates, renderTemplate } from './registry.js';
export type {
  ManifestTemplateName,
  PageTemplateName,
  Template,
  TemplateName,
  TokenValues,
} from './types.js';
