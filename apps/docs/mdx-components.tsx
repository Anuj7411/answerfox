import type { MDXComponents } from 'mdx/types';
import { useMDXComponents as getThemeComponents } from 'nextra-theme-docs';

/**
 * Required by Next.js App Router for MDX support. Nextra's theme
 * supplies the default component set (callouts, code blocks, tables,
 * etc.); we merge any per-page overrides on top.
 */
const themeComponents = getThemeComponents();

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...themeComponents,
    ...components,
  };
}
