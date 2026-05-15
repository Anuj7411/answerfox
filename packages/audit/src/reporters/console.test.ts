import { parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import { loadHtml } from '../parser.js';
import { runChecks } from '../runner.js';
import { consoleReport } from './console.js';

const URL = parseAbsoluteUrl('https://example.com');

const PERFECT_HTML = `<html lang="en">
  <head>
    <title>A precise page title between thirty and sixty</title>
    <meta name="description" content="A precise meta description that summarizes the page in roughly the 120-160 character window Google uses for SERP snippets without truncating.">
    <link rel="canonical" href="https://example.com/page">
    <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
  </head>
  <body></body>
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
    expect(out).toContain('[PASSED] 5');
    expect(out).toContain('A1');
    expect(out).toContain('C1');
  });

  it('shows fix recommendation and docs URL inline with each failure', async () => {
    const report = await runChecks({ url: URL, html: BROKEN_HTML, dom: loadHtml(BROKEN_HTML) });
    const out = consoleReport(report, { color: false });
    expect(out).toContain('Fix:');
    expect(out).toContain('https://answerable.dev/docs/checks/');
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
});
