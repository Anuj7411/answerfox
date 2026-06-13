import { defineCheck, parseAbsoluteUrl } from '@answerfox/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuditDom } from './parser.js';
import { loadHtml } from './parser.js';
import { bandFromScore, runChecks } from './runner.js';

// Stub fetch globally so the G1-G5 checks (which fetch /.well-known/*)
// behave deterministically. They get 404 here, which maps to "fail" — the
// expected outcome for fixture sites without agent-readiness manifests.
beforeEach(() => {
  vi.stubGlobal('fetch', async () => new Response('', { status: 404 }));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

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
    <nav><a href="/about">About</a> · <a href="/pricing">Pricing</a></nav>
    <main>
      <h1>The one and only h1</h1>
      <h2>Section A</h2>
      <p>Some intro prose for section A.</p>
      <h2>Section B</h2>
      <h3>Subsection of B</h3>
      <ul>
        <li><a href="/page-a">Page A</a></li>
        <li><a href="/page-b">Page B</a></li>
        <li><a href="/page-c">Page C</a></li>
      </ul>
      <p>External: <a href="https://research.org/paper">research</a>.</p>
      <p>Profiles: <a href="https://g2.com/products/acme">G2</a>, <a href="https://github.com/acme">GitHub</a>, <a href="https://linkedin.com/company/acme">LinkedIn</a>.</p>
    </main>
    <footer>
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
    </footer>
  </body>
</html>`;

const EMPTY_HTML = '<html></html>';

describe('runChecks', () => {
  it('a classic-perfect fixture without AR manifests lands in average band', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    // Math: 33 A-F checks pass (62 of 62 A-F max). A11, A13, C3, C4
    // fail (8 max points). G1-G5 + G7 fail (31 max). H1-H4 fail
    // (12 max — full Agentic Commerce category). A12, G6, G8 skip.
    // Considered max = 62 + 8 + 31 + 12 = 113. Earned = 62.
    // Score = 55 -> 'weak' band. A classic-perfect site that skips
    // every agent and commerce manifest is now decisively below
    // average — the wedge sharpens with every category added.
    expect(report.score).toBe(55);
    expect(report.band).toBe('weak');
    expect(report.summary.pass).toBe(33);
    expect(report.summary.fail).toBe(14);
    expect(report.summary.skip).toBe(3);
  });

  it('lands in critical band on a fixture missing nearly everything', async () => {
    // Note: A8 (robots) correctly passes on empty HTML because the absence of
    // a robots meta means the default `index, follow` — which is the right
    // behaviour for a live page. So the floor score isn't 0; it's whatever
    // A8 contributes (2 of ~30 max points → ~7/100).
    const report = await runChecks({ url: URL, html: EMPTY_HTML, dom: loadHtml(EMPTY_HTML) });
    expect(report.score).toBeLessThan(20);
    expect(report.band).toBe('critical');
    expect(report.summary.fail).toBeGreaterThanOrEqual(10);
  });

  it('preserves AUDIT-FRAMEWORK check order in results', async () => {
    const report = await runChecks({ url: URL, html: EMPTY_HTML, dom: loadHtml(EMPTY_HTML) });
    expect(report.results.map((r) => r.id)).toEqual([
      'A1',
      'A3',
      'A4',
      'A5',
      'A6',
      'A7',
      'A8',
      'A9',
      'A10',
      'A11',
      'A12',
      'A13',
      'B1',
      'B3',
      'B4',
      'B8',
      'B11',
      'B14',
      'C1',
      'C2',
      'C3',
      'C4',
      'D1',
      'D2',
      'D3',
      'D4',
      'D5',
      'D6',
      'E1',
      'E7',
      'E10',
      'E11',
      'F1',
      'F2',
      'F3',
      'F5',
      'F6',
      'F7',
      'G1',
      'G2',
      'G3',
      'G4',
      'G5',
      'G6',
      'G7',
      'G8',
      'H1',
      'H2',
      'H3',
      'H4',
    ]);
  });

  it('records earnedPoints = 0 for non-pass statuses', async () => {
    const report = await runChecks({ url: URL, html: EMPTY_HTML, dom: loadHtml(EMPTY_HTML) });
    for (const r of report.results) {
      if (r.status !== 'pass') {
        expect(r.earnedPoints).toBe(0);
      }
    }
  });

  it('records earnedPoints = maxPoints for pass statuses', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    for (const r of report.results) {
      if (r.status === 'pass') {
        expect(r.earnedPoints).toBe(r.maxPoints);
      }
    }
  });

  it('captures thrown check errors as skip with the error message', async () => {
    const throwing = defineCheck<AuditDom>({
      id: 'X1',
      category: 'meta-and-technical',
      severity: 'low',
      points: 1,
      description: 'always throws',
      rationale: 'test fixture',
      docsUrl: 'https://example.com/docs',
      run: () => {
        throw new Error('boom');
      },
    });
    const report = await runChecks({
      url: URL,
      html: EMPTY_HTML,
      dom: loadHtml(EMPTY_HTML),
      checks: [throwing],
    });
    expect(report.results).toHaveLength(1);
    expect(report.results[0]?.status).toBe('skip');
    expect(report.results[0]?.error).toBe('boom');
  });

  it('scores against the run checks only (excluding skips)', async () => {
    const passing = defineCheck<AuditDom>({
      id: 'P1',
      category: 'meta-and-technical',
      severity: 'low',
      points: 5,
      description: 'always pass',
      rationale: 'test fixture',
      docsUrl: 'https://example.com/docs',
      run: () => ({ status: 'pass' }),
    });
    const throwing = defineCheck<AuditDom>({
      id: 'X1',
      category: 'meta-and-technical',
      severity: 'low',
      points: 50,
      description: 'always throws',
      rationale: 'test fixture',
      docsUrl: 'https://example.com/docs',
      run: () => {
        throw new Error('boom');
      },
    });
    const report = await runChecks({
      url: URL,
      html: EMPTY_HTML,
      dom: loadHtml(EMPTY_HTML),
      checks: [passing, throwing],
    });
    // Skips excluded — score is 5/5 = 100
    expect(report.score).toBe(100);
    expect(report.summary.skip).toBe(1);
    expect(report.summary.pass).toBe(1);
  });
});

describe('bandFromScore', () => {
  it('maps scores to AUDIT-FRAMEWORK bands', () => {
    expect(bandFromScore(0)).toBe('critical');
    expect(bandFromScore(40)).toBe('critical');
    expect(bandFromScore(41)).toBe('weak');
    expect(bandFromScore(60)).toBe('weak');
    expect(bandFromScore(61)).toBe('average');
    expect(bandFromScore(80)).toBe('average');
    expect(bandFromScore(81)).toBe('strong');
    expect(bandFromScore(90)).toBe('strong');
    expect(bandFromScore(91)).toBe('excellent');
    expect(bandFromScore(100)).toBe('excellent');
  });
});
