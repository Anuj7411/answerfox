/**
 * @answerable/templates — page templates installed by the Answerable
 * CLI into a user's Next.js project. Each template is a single .tsx
 * file wired up with `defineSeo()` from `@answerable/metadata` and
 * the matching JSON-LD generator from `@answerable/schemas` — drop
 * one in and you have a working, audit-ready page.
 */

export const VERSION = '0.0.0';

export { extractTokens, renderContent } from './render.js';
export { getTemplate, listTemplates, renderTemplate } from './registry.js';
export type { Template, TemplateName, TokenValues } from './types.js';
