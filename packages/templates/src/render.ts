import { SchemaValidationError } from '@answerable/core';
import type { TokenValues } from './types.js';

/**
 * Matches any `{{TOKEN}}` placeholder. Token names are `[A-Z][A-Z0-9_]*`
 * — uppercase + digits + underscore, leading with a letter.
 */
const TOKEN_PATTERN = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;

/**
 * Extract the set of distinct token names referenced in a template
 * content string. Used by the registry to derive `requiredTokens`
 * and by `renderTemplate` to check for unknown keys at call time.
 */
export function extractTokens(content: string): readonly string[] {
  const seen = new Set<string>();
  // Iterate matches by repeatedly executing the global regex. Each
  // match's capture group 1 is the token name.
  const matches = content.matchAll(TOKEN_PATTERN);
  for (const m of matches) {
    const token = m[1];
    if (token !== undefined) seen.add(token);
  }
  return [...seen].sort();
}

/**
 * Substitute every `{{TOKEN}}` in `content` with the corresponding
 * value from `values`. Strict on both sides:
 *
 * - Every token referenced in `content` MUST have a value (missing
 *   tokens are rejected so the CLI can re-prompt).
 * - Every key in `values` MUST correspond to a referenced token
 *   (unknown keys are rejected to catch typos at install time).
 *
 * @throws SchemaValidationError batching the missing-token list and
 *   the unknown-token list into one error so the CLI can surface
 *   both in a single prompt.
 */
export function renderContent(content: string, values: TokenValues): string {
  const referenced = new Set(extractTokens(content));
  const provided = new Set(Object.keys(values));

  const issues: string[] = [];
  const missing = [...referenced].filter((t) => !provided.has(t));
  if (missing.length > 0) {
    issues.push(`missing token values: ${missing.sort().join(', ')}`);
  }
  const unknown = [...provided].filter((t) => !referenced.has(t));
  if (unknown.length > 0) {
    issues.push(`unknown token keys (not referenced by template): ${unknown.sort().join(', ')}`);
  }
  if (issues.length > 0) {
    throw new SchemaValidationError(issues);
  }

  // Substitute. `replaceAll` would require ES2021+ which we have, but
  // a single replace with the global regex is just as fast.
  return content.replace(TOKEN_PATTERN, (_, token: string) => {
    // referenced.has(token) guaranteed by the validation above —
    // provided.has(token) follows from the missing check passing.
    return values[token] ?? '';
  });
}
