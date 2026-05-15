import type { Prompter } from './prompter.js';

/**
 * Tokens we know how to derive without prompting (sensible defaults).
 * Anything not in this set must come from the user.
 */
type DerivableToken = 'URL' | 'DESCRIPTION' | 'EFFECTIVE_DATE' | 'JURISDICTION';

const DERIVABLE: ReadonlySet<DerivableToken> = new Set([
  'URL',
  'DESCRIPTION',
  'EFFECTIVE_DATE',
  'JURISDICTION',
]);

/**
 * Collect a `Record<TOKEN, value>` map by prompting for non-derivable
 * fields and synthesizing the rest from sensible defaults.
 *
 * Indie-dev tools that ask seven questions get abandoned mid-init,
 * so we only prompt for `PROJECT_NAME`, `DOMAIN`, and `CONTACT_EMAIL`
 * — the three values nobody else can reasonably guess. Everything
 * else gets a starter placeholder the user edits in their editor.
 */
export async function collectTokens(
  required: ReadonlyArray<string>,
  defaultProjectName: string | undefined,
  prompter: Prompter,
): Promise<Record<string, string>> {
  const tokens: Record<string, string> = {};
  const needs = new Set(required);

  if (needs.has('PROJECT_NAME')) {
    tokens.PROJECT_NAME = await prompter.text({
      message: 'Project name?',
      ...(defaultProjectName !== undefined && { defaultValue: defaultProjectName }),
      validate: (v) => (v.trim().length > 0 ? undefined : 'Project name cannot be empty.'),
    });
  }

  if (needs.has('DOMAIN') || needs.has('URL')) {
    const domain = await prompter.text({
      message: 'Domain (e.g. acme.com)?',
      validate: (v) =>
        /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v.trim())
          ? undefined
          : 'Use a bare domain like "acme.com" — no protocol or path.',
    });
    tokens.DOMAIN = domain.trim();
    tokens.URL = `https://${tokens.DOMAIN}`;
  }

  if (needs.has('CONTACT_EMAIL')) {
    tokens.CONTACT_EMAIL = await prompter.text({
      message: 'Contact email (used in privacy + contact pages)?',
      validate: (v) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? undefined : 'Use a real email address.',
    });
  }

  // Derived defaults — the user edits these in their editor.
  if (needs.has('DESCRIPTION') && tokens.DESCRIPTION === undefined) {
    const subject = tokens.PROJECT_NAME ?? 'this project';
    tokens.DESCRIPTION = `[Edit me] What ${subject} does.`;
  }
  if (needs.has('EFFECTIVE_DATE') && tokens.EFFECTIVE_DATE === undefined) {
    tokens.EFFECTIVE_DATE = new Date().toISOString().slice(0, 10);
  }
  if (needs.has('JURISDICTION') && tokens.JURISDICTION === undefined) {
    tokens.JURISDICTION = '[Edit me] your local jurisdiction';
  }

  return tokens;
}

/**
 * Subset a token map to only the keys a particular template needs.
 * Prevents passing extra tokens that would trigger
 * `renderTemplate`'s unknown-token rejection.
 */
export function pickTokens(
  all: Readonly<Record<string, string>>,
  required: readonly string[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of required) {
    const v = all[key];
    if (v !== undefined) out[key] = v;
  }
  return out;
}

export { DERIVABLE };
