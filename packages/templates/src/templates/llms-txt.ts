import type { Template } from '../types.js';

/**
 * `llms.txt` template (audit check G7).
 *
 * Lives at the origin root (`/llms.txt`), NOT under `.well-known/`.
 * In a Next.js project, that means `public/llms.txt`. AI agents fetch
 * this file to discover a curated, markdown-shaped table of contents
 * of the most important content on the site.
 *
 * Spec: https://llmstxt.org/
 *
 * Per the spec, the H1 is the only required field. The blockquote and
 * sections of markdown links are strongly recommended. We scaffold all
 * three with TODOs so the user has a starting shape to edit.
 */
export const llmsTxtTemplate: Template = {
  name: 'llms-txt',
  filename: 'public/llms.txt',
  content: `# TODO Your site or product name

> TODO One sentence describing what this site is, who it serves, and what an
> AI agent would find most useful here.

## Docs

- [Quickstart](/docs/quickstart): get running in 60 seconds
- [API reference](/docs/api): every endpoint, every parameter
- [Guides](/docs/guides): how-to articles for common tasks

## About

- [About](/about): who we are and why this exists
- [Pricing](/pricing): plans and limits
- [Contact](/contact): how to reach us

## Optional

- [Changelog](/changelog): what shipped when
- [Blog](/blog): longer-form writing
`,
  requiredTokens: [],
};
