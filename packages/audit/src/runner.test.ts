import { defineCheck, parseAbsoluteUrl } from '@answerable/core';
import { describe, expect, it } from 'vitest';
import type { AuditDom } from './parser.js';
import { loadHtml } from './parser.js';
import { bandFromScore, runChecks } from './runner.js';

const URL = parseAbsoluteUrl('https://example.com');

const PERFECT_HTML = `<html lang="en">
  <head>
    <title>A precise page title between thirty and sixty</title>
    <meta name="description" content="A precise meta description that summarizes the page in roughly the 120-160 character window Google uses for SERP snippets without truncating.">
    <link rel="canonical" href="https://example.com/page">
    <script type="application/ld+json">{"@type":"Organization","name":"Acme"}</script>
  </head>
  <body><h1>Hi</h1></body>
</html>`;

const EMPTY_HTML = '<html></html>';

describe('runChecks', () => {
  it('returns 100 + excellent band on a perfect fixture', async () => {
    const report = await runChecks({ url: URL, html: PERFECT_HTML, dom: loadHtml(PERFECT_HTML) });
    expect(report.score).toBe(100);
    expect(report.band).toBe('excellent');
    expect(report.summary.pass).toBe(5);
    expect(report.summary.fail).toBe(0);
  });

  it('returns 0 + critical band on a fixture missing everything', async () => {
    const report = await runChecks({ url: URL, html: EMPTY_HTML, dom: loadHtml(EMPTY_HTML) });
    expect(report.score).toBe(0);
    expect(report.band).toBe('critical');
    expect(report.summary.fail).toBeGreaterThanOrEqual(4);
  });

  it('preserves AUDIT-FRAMEWORK check order in results', async () => {
    const report = await runChecks({ url: URL, html: EMPTY_HTML, dom: loadHtml(EMPTY_HTML) });
    expect(report.results.map((r) => r.id)).toEqual(['A1', 'A3', 'A4', 'A5', 'C1']);
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
