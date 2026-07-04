import { describe, expect, it } from 'vitest';
import { detectCmsFromHtml, detectStackFromRepo } from './detect-stack';

describe('detectStackFromRepo', () => {
  it('detects Next.js by dependency and picks the real layout file', () => {
    const result = detectStackFromRepo(
      ['package.json', 'next.config.ts', 'src/app/layout.tsx', 'src/app/page.tsx'],
      { dependencies: { next: '15.0.0' } },
    );
    expect(result.framework).toBe('nextjs');
    expect(result.mode).toBe('pr');
    expect(result.headFileHint).toBe('src/app/layout.tsx');
  });

  it('detects docusaurus before nextjs even when react is present', () => {
    const result = detectStackFromRepo(['docusaurus.config.ts', 'package.json'], {
      dependencies: { '@docusaurus/core': '3.0.0', react: '18.0.0' },
    });
    expect(result.framework).toBe('docusaurus');
  });

  it('detects config-file-only frameworks without package.json (hugo, jekyll, mkdocs)', () => {
    expect(detectStackFromRepo(['hugo.toml', 'layouts/partials/head.html']).framework).toBe('hugo');
    expect(detectStackFromRepo(['_config.yml', '_layouts/default.html']).framework).toBe('jekyll');
    expect(detectStackFromRepo(['mkdocs.yml', 'docs/index.md']).framework).toBe('mkdocs');
  });

  it('falls back to plain-html PR mode when an index.html exists', () => {
    const result = detectStackFromRepo(['index.html', 'style.css']);
    expect(result).toMatchObject({
      framework: 'plain-html',
      mode: 'pr',
      headFileHint: 'index.html',
    });
  });

  it('returns honest suggestion mode for unrecognizable repos', () => {
    const result = detectStackFromRepo(['README.md', 'src/main.rs', 'Cargo.toml']);
    expect(result.framework).toBe('unknown');
    expect(result.mode).toBe('suggestion');
    expect(result.headFileHint).toBeNull();
  });

  it('prefers an existing head-hint file over the default guess', () => {
    const withPagesRouter = detectStackFromRepo(
      ['next.config.js', 'pages/_document.tsx', 'pages/index.tsx'],
      { dependencies: { next: '14.0.0' } },
    );
    expect(withPagesRouter.headFileHint).toBe('pages/_document.tsx');
  });
});

describe('detectCmsFromHtml', () => {
  it('fingerprints hosted CMS platforms', () => {
    expect(detectCmsFromHtml('<meta name="generator" content="WordPress 6.4" />')).toBe(
      'wordpress',
    );
    expect(detectCmsFromHtml('<img src="https://static.wixstatic.com/x.png">')).toBe('wix');
    expect(detectCmsFromHtml('<!-- This is Squarespace. -->')).toBe('squarespace');
    expect(detectCmsFromHtml('<script src="https://cdn.shopify.com/t.js"></script>')).toBe(
      'shopify',
    );
    expect(detectCmsFromHtml('<meta name="generator" content="Framer 2.0">')).toBe('framer');
  });

  it('returns null for self-hosted sites', () => {
    expect(detectCmsFromHtml('<html><head><title>Docs</title></head></html>')).toBeNull();
  });
});
