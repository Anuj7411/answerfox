import { parseAbsoluteUrl } from '@answerfox/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { runChecks } from '../runner.js';
import { consoleReport } from './console.js';

const URL = parseAbsoluteUrl('https://example.com');

const PERFECT_HTML = `<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>A precise page title between thirty and sixty</title>
    <meta name="description" content="A precise meta description that summarizes the page in roughly the 120-160 character window Google uses for SERP snippets without truncating.">
    <link rel="canonical" href="https://example.com/page">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <meta property="og:title" content="Acme">
    <meta property="og:description" content="What Acme does.">
    <meta property="og:image" content="https://example.com/og.png">
    <meta property="og:url" content="https://example.com/page">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://example.com/og.png">
    <script type="application/ld+json">{"@type":"Organization","name":"Acme","sameAs":["https://twitter.com/acme","https://linkedin.com/company/acme","https://github.com/acme"]}</script>
  </head>
  <body>
    <nav><a href="/about">About</a></nav>
    <main>
      <h1>The one and only h1</h1>
      <h2>Section A</h2>
      <h2>Section B</h2>
      <ul>
        <li><a href="/page-a">A</a></li>
        <li><a href="/page-b">B</a></li>
        <li><a href="/page-c">C</a></li>
      </ul>
      <p>External: <a href="https://research.org">research</a>.</p>
      <p>Profiles: <a href="https://g2.com/products/acme">G2</a>, <a href="https://github.com/acme">GitHub</a>, <a href="https://linkedin.com/company/acme">LinkedIn</a>.</p>
    </main>
    <footer>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
    </footer>
  </body>
</html>`;

const BROKEN_HTML = '<html><head></head><body></body></html>';

describe('consoleReport', () => {
  it('includes the URL, score, and band', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toContain('https://example.com');
    expect(out).toContain('100/100');
    expect(out).toContain('Excellent');
  });

  it('groups failures by severity descending', async () => {
    const report = await runChecks({ url: URL, html: BROKEN_HTML, dom: loadHtml(BROKEN_HTML) });
    const out = consoleReport(report, { color: false });
    const criticalIdx = out.indexOf('[CRITICAL]');
    const highIdx = out.indexOf('[HIGH]');
    // Both present; critical comes before high in the output.
    expect(criticalIdx).toBeGreaterThanOrEqual(0);
    expect(highIdx).toBeGreaterThanOrEqual(0);
    expect(criticalIdx).toBeLessThan(highIdx);
  });

  it('lists every passed check at the bottom under [PASSED]', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toContain('[PASSED] 33');
    expect(out).toContain('A1');
    expect(out).toContain('C1');
  });

  it('shows fix recommendation and docs URL inline with each failure', async () => {
    const report = await runChecks({ url: URL, html: BROKEN_HTML, dom: loadHtml(BROKEN_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toContain('Fix:');
    expect(out).toContain('https://answerfox.dev/docs/checks/');
  });

  it('strips ANSI codes when color is false', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    const plain = consoleReport(report, { color: false });
    // Naive ANSI check.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI escape detection
    expect(plain).not.toMatch(/\x1b\[/);
  });

  it('includes summary counts in the header', async () => {
    const report = await runChecks({ url: URL, html: BROKEN_HTML, dom: loadHtml(BROKEN_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toMatch(/\d+ pass · \d+ fail · \d+ warn · \d+ skip/);
  });

  it('shows a framework-coverage footer so 100/100 results stay honest', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toMatch(/\d+ of 50 audit checks active/);
    expect(out).toContain('github.com/Anuj7411/answerfox');
  });
});
