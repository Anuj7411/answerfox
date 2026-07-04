import { describe, expect, it } from 'vitest';
import { compareViews } from './compare';
import { extractVisibleText, tokenizeWords } from './extract-text';

describe('extractVisibleText', () => {
  it('strips scripts, styles, noscript, comments, and tags', () => {
    const html =
      '<html><head><style>.a{color:red}</style><script>var x=1;</script></head>' +
      '<body><!-- hidden --><noscript>enable js</noscript><h1>Docs</h1><p>Read &amp; learn</p></body></html>';
    expect(extractVisibleText(html)).toBe('Docs Read & learn');
  });

  it('returns empty for a script-only SPA shell', () => {
    const shell = '<html><body><div id="root"></div><script src="app.js"></script></body></html>';
    expect(extractVisibleText(shell)).toBe('');
  });

  it('tokenizes case-insensitively and drops single characters', () => {
    expect(tokenizeWords('The API, the api! A x 42.')).toEqual(['the', 'api', 'the', 'api', '42']);
  });
});

describe('compareViews', () => {
  const RENDERED =
    '<html><body><nav>Home Docs Pricing</nav>' +
    '<main><h1>Quickstart</h1><p>Install the widget package and initialize the client with your project token to start sending events.</p></main></body></html>';

  it('reports 100% coverage when crawler receives the same content', () => {
    const result = compareViews(RENDERED, RENDERED);
    expect(result.coveragePercent).toBe(100);
    expect(result.missingSamples).toEqual([]);
  });

  it('reports the gap and samples the missing paragraph for a gutted crawler view', () => {
    const crawler = '<html><body><nav>Home Docs Pricing</nav><div id="root"></div></body></html>';
    const result = compareViews(crawler, RENDERED);
    expect(result.coveragePercent).toBeLessThan(30);
    expect(result.missingSamples.length).toBeGreaterThan(0);
    expect(result.missingSamples[0]).toContain('install the widget package');
  });

  it('uses multiset coverage so repeated rendered content must exist repeatedly', () => {
    const crawler = '<p>token</p>';
    const rendered = '<p>token token token token</p>';
    const result = compareViews(crawler, rendered);
    expect(result.coveragePercent).toBe(25);
  });

  it('treats an empty rendered page as fully covered (nothing to miss)', () => {
    expect(compareViews('<p>extra</p>', '<html></html>').coveragePercent).toBe(100);
  });
});
