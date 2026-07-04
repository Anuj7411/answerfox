import { describe, expect, it } from 'vitest';
import { generateValidatedEditSet } from './generate-edits';

// Live smoke against the real Gemini API. Skipped unless GEMINI_API_KEY
// is set, so CI stays hermetic. Run locally to prove the full
// model -> apply -> validate -> diff loop end to end.
const KEY = process.env.GEMINI_API_KEY ?? '';

describe.skipIf(KEY.length === 0)('generateValidatedEditSet (live Gemini)', () => {
  it('produces a validated, applying, parsing EditSet for a real finding', async () => {
    const layout = [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="utf-8" />',
      '  <title>Acme Docs</title>',
      '</head>',
      '<body>',
      '  <main><h1>Quickstart</h1><p>Install acme and go.</p></main>',
      '</body>',
      '</html>',
    ].join('\n');

    const result = await generateValidatedEditSet(
      {
        checkId: 'C2',
        description: 'Organization JSON-LD missing. AI crawlers cannot identify the site owner.',
        fixRecommendation:
          'Add a <script type="application/ld+json"> Organization object in <head>.',
        evidence: 'No application/ld+json script found in the document head.',
        siteUrl: 'https://acme.dev/docs',
        repoFiles: new Map([['index.html', layout]]),
      },
      { apiKey: KEY },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.diff).toContain('index.html');
      expect(result.diff.toLowerCase()).toContain('ld+json');
      // The edited file must still contain valid JSON-LD (parse gate passed).
      const edited = result.files.get('index.html') ?? '';
      expect(edited).toContain('application/ld+json');
      console.log(`\n=== LIVE GEMINI PROOF (attempts: ${result.attempts}) ===\n${result.diff}\n`);
    }
  }, 45_000);
});
