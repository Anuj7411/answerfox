/**
 * Catalog of templates Answerfox's CLI can install. Stable string
 * literals, these become the values users pass to `answerfox add <name>`.
 *
 * Two kinds of templates:
 * - **Page templates** (about, privacy, terms, faq, contact): trust
 *   pages installed into a Next.js App Router project at `app/<name>/page.tsx`.
 * - **Manifest templates** (agent-card, mcp-server-card, api-catalog,
 *   agent-permissions, oauth-discovery): agent-readiness manifests
 *   installed at `public/.well-known/<file>`. Framework-agnostic
 *   (Next.js, Astro, Remix, plain Vite, etc.). Shipped in v0.3.1.
 *
 * A template is a manifest if its filename starts with `public/`.
 */
export type PageTemplateName = 'about' | 'privacy' | 'terms' | 'faq' | 'contact';
export type ManifestTemplateName =
  | 'agent-card'
  | 'mcp-server-card'
  | 'api-catalog'
  | 'agent-permissions'
  | 'oauth-discovery';
export type TemplateName = PageTemplateName | ManifestTemplateName;

/**
 * Map of token name → substitution value. Both keys and values are
 * plain strings; the renderer rejects non-string values at runtime.
 */
export type TokenValues = Readonly<Record<string, string>>;

/**
 * Describes one installable page template. Each template module
 * exports a `Template` constant via `src/templates/<name>.ts`.
 */
export interface Template {
  readonly name: TemplateName;
  /**
   * Path relative to the user's project root where the rendered file
   * is written, e.g. `"app/about/page.tsx"`.
   */
  readonly filename: string;
  /** Raw template source with `{{TOKEN}}` placeholders. */
  readonly content: string;
  /**
   * Tokens that must be present in the values map at render time.
   * Auto-derived from `content` when the module is loaded — the
   * registry asserts the explicit list matches the derived list.
   */
  readonly requiredTokens: readonly string[];
}
