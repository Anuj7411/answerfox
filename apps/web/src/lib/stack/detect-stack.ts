/**
 * Stack detection (§10.5): decide up front whether a customer gets
 * fix-PRs or honest suggestion-mode. Two views, both pure:
 *
 * - detectStackFromRepo: given a repo file manifest (+ optional
 *   package.json), identify the framework and where fixes land.
 *   Repo-deployed frameworks -> PR mode.
 * - detectCmsFromHtml: given the live site's HTML, fingerprint hosted
 *   CMS platforms whose pages don't live in the repo -> suggestion
 *   mode at onboarding, never a bait-and-switch after payment.
 */

export type Framework =
  | 'nextjs'
  | 'astro'
  | 'docusaurus'
  | 'vitepress'
  | 'sveltekit'
  | 'nuxt'
  | 'remix'
  | 'gatsby'
  | 'hugo'
  | 'jekyll'
  | 'mkdocs'
  | 'eleventy'
  | 'plain-html'
  | 'unknown';

export type FixMode = 'pr' | 'suggestion';

export interface StackDetection {
  readonly framework: Framework;
  readonly mode: FixMode;
  /** Repo-relative file where head/meta fixes most likely land. */
  readonly headFileHint: string | null;
  /** Why we decided this — shown in onboarding, never hidden. */
  readonly reason: string;
}

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function hasDep(pkg: PackageJsonLike | null, name: string): boolean {
  return Boolean(pkg?.dependencies?.[name] ?? pkg?.devDependencies?.[name]);
}

interface FrameworkRule {
  readonly framework: Framework;
  readonly dep?: string;
  readonly files?: readonly string[];
  readonly headHints: readonly string[];
}

// Order matters: more specific frameworks first (docusaurus depends on
// react, astro sites may include vite, etc.).
const RULES: readonly FrameworkRule[] = [
  {
    framework: 'docusaurus',
    dep: '@docusaurus/core',
    files: ['docusaurus.config.js', 'docusaurus.config.ts'],
    headHints: ['docusaurus.config.ts', 'docusaurus.config.js'],
  },
  {
    framework: 'nextjs',
    dep: 'next',
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    headHints: [
      'src/app/layout.tsx',
      'app/layout.tsx',
      'src/pages/_document.tsx',
      'pages/_document.tsx',
    ],
  },
  {
    framework: 'astro',
    dep: 'astro',
    files: ['astro.config.mjs', 'astro.config.ts'],
    headHints: ['src/layouts/Layout.astro', 'src/layouts/BaseLayout.astro'],
  },
  {
    framework: 'vitepress',
    dep: 'vitepress',
    files: ['.vitepress/config.ts', '.vitepress/config.mts'],
    headHints: ['.vitepress/config.ts', '.vitepress/config.mts'],
  },
  {
    framework: 'sveltekit',
    dep: '@sveltejs/kit',
    files: ['svelte.config.js'],
    headHints: ['src/app.html'],
  },
  {
    framework: 'nuxt',
    dep: 'nuxt',
    files: ['nuxt.config.ts', 'nuxt.config.js'],
    headHints: ['nuxt.config.ts', 'app.vue'],
  },
  {
    framework: 'remix',
    dep: '@remix-run/react',
    files: ['remix.config.js'],
    headHints: ['app/root.tsx'],
  },
  {
    framework: 'gatsby',
    dep: 'gatsby',
    files: ['gatsby-config.js', 'gatsby-config.ts'],
    headHints: ['src/components/seo.js', 'gatsby-config.js'],
  },
  {
    framework: 'hugo',
    files: ['hugo.toml', 'hugo.yaml', 'config.toml'],
    headHints: ['layouts/partials/head.html', 'layouts/_default/baseof.html'],
  },
  {
    framework: 'jekyll',
    files: ['_config.yml'],
    headHints: ['_includes/head.html', '_layouts/default.html'],
  },
  { framework: 'mkdocs', files: ['mkdocs.yml', 'mkdocs.yaml'], headHints: ['mkdocs.yml'] },
  {
    framework: 'eleventy',
    dep: '@11ty/eleventy',
    files: ['.eleventy.js', 'eleventy.config.js'],
    headHints: ['_includes/base.njk', '.eleventy.js'],
  },
];

/**
 * Detect the framework from a repo file manifest and package.json.
 * `paths` should be repo-relative with forward slashes (any depth —
 * only the paths themselves are inspected).
 */
export function detectStackFromRepo(
  paths: readonly string[],
  packageJson: PackageJsonLike | null = null,
): StackDetection {
  const pathSet = new Set(paths);

  for (const rule of RULES) {
    const byDep = rule.dep !== undefined && hasDep(packageJson, rule.dep);
    const byFile = rule.files?.some((f) => pathSet.has(f)) ?? false;
    if (byDep || byFile) {
      const headFileHint = rule.headHints.find((h) => pathSet.has(h)) ?? rule.headHints[0] ?? null;
      return {
        framework: rule.framework,
        mode: 'pr',
        headFileHint,
        reason: byDep
          ? `Found ${rule.dep} in package.json.`
          : `Found ${rule.files?.find((f) => pathSet.has(f))}.`,
      };
    }
  }

  const htmlEntry = ['index.html', 'public/index.html', 'src/index.html'].find((f) =>
    pathSet.has(f),
  );
  if (htmlEntry !== undefined) {
    return {
      framework: 'plain-html',
      mode: 'pr',
      headFileHint: htmlEntry,
      reason: `Found ${htmlEntry} with no framework config.`,
    };
  }

  return {
    framework: 'unknown',
    mode: 'suggestion',
    headFileHint: null,
    reason: 'No recognizable framework or HTML entry point in the repo.',
  };
}

const CMS_FINGERPRINTS: ReadonlyArray<{ cms: string; pattern: RegExp }> = [
  { cms: 'wordpress', pattern: /<meta[^>]+generator[^>]+wordpress|\/wp-content\//i },
  { cms: 'wix', pattern: /<meta[^>]+generator[^>]+wix|static\.wixstatic\.com/i },
  { cms: 'squarespace', pattern: /<!-- This is Squarespace|static1\.squarespace\.com/i },
  { cms: 'webflow', pattern: /<meta[^>]+generator[^>]+webflow|assets\.website-files\.com/i },
  { cms: 'shopify', pattern: /cdn\.shopify\.com|Shopify\.theme/i },
  { cms: 'ghost', pattern: /<meta[^>]+generator[^>]+ghost/i },
  { cms: 'framer', pattern: /<meta[^>]+generator[^>]+framer|framerusercontent\.com/i },
];

/**
 * Fingerprint hosted CMS platforms from live HTML. A hit means the
 * page source is NOT in the customer's repo, so fixes must be
 * suggestions (with copy-paste snippets), stated at onboarding.
 */
export function detectCmsFromHtml(html: string): string | null {
  for (const { cms, pattern } of CMS_FINGERPRINTS) {
    if (pattern.test(html)) return cms;
  }
  return null;
}
