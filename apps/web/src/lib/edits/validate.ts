/**
 * Post-apply parse gate: after an EditSet applies cleanly, every
 * touched file must still parse for its type. A fix-PR that breaks
 * the customer's JSON or ships invalid JSON-LD is worse than no PR
 * (§10.5 — PR hygiene is a survival trait, not polish).
 */

export interface ValidationFailure {
  readonly path: string;
  readonly reason: string;
}

const JSON_LD_BLOCK = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function validateJson(content: string): string | null {
  try {
    JSON.parse(content);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Invalid JSON.';
  }
}

function validateHtmlLike(content: string): string | null {
  // Full HTML validation is framework territory; the gate we own is
  // that every JSON-LD block we may have touched still parses.
  const matches = content.matchAll(JSON_LD_BLOCK);
  let index = 0;
  for (const match of matches) {
    index += 1;
    const body = (match[1] ?? '').trim();
    if (body.length === 0) return `JSON-LD block ${index} is empty.`;
    const jsonError = validateJson(body);
    if (jsonError !== null) return `JSON-LD block ${index} does not parse: ${jsonError}`;
  }
  return null;
}

function validateRobots(content: string): string | null {
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? '').trim();
    if (line.length === 0 || line.startsWith('#')) continue;
    if (!/^[A-Za-z][A-Za-z-]*\s*:/.test(line)) {
      return `robots.txt line ${i + 1} is not a "field: value" directive.`;
    }
  }
  return null;
}

/**
 * Validate every file an EditSet produced. Returns the failures;
 * empty array = the set is safe to turn into a diff and a PR.
 */
export function validateEditedFiles(files: ReadonlyMap<string, string>): ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  for (const [path, content] of files) {
    const lower = path.toLowerCase();
    let reason: string | null = null;
    if (lower.endsWith('.json')) {
      reason = validateJson(content);
    } else if (lower.endsWith('robots.txt')) {
      reason = validateRobots(content);
    } else if (/\.(html?|jsx?|tsx?|astro|vue|svelte|md|mdx)$/.test(lower)) {
      reason = validateHtmlLike(content);
    }
    if (reason !== null) failures.push({ path, reason });
  }
  return failures;
}
