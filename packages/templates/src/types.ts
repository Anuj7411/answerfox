/**
 * Catalog of templates Answerfox's CLI can install. Stable string
 * literals — these become the values users pass to
 * `answerfox add <name>`.
 */
export type TemplateName = 'about' | 'privacy' | 'terms' | 'faq' | 'contact';

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
