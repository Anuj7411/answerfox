import { fetchCrawlerView } from '@/lib/xray/crawler-fetch';
import { describe, expect, it } from 'vitest';
import { runAgentAnswerTest } from './run-agent-answer-test';

// Live proof: run the real Agent Answer Simulation against real docs
// sites with the real Gemini model. Demonstrates the core claim — a
// docs site that renders fine for humans can leave an AI coding agent
// unable to answer basic developer questions. Gated behind RUN_STRESS=1
// and a GEMINI_API_KEY.
const KEY = process.env.GEMINI_API_KEY ?? '';
const RUN = process.env.RUN_STRESS === '1' && KEY.length > 0;

async function gemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${KEY}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500,
        responseMimeType: 'application/json',
      },
    }),
  });
  if (!r.ok) throw new Error(`Gemini HTTP ${r.status}`);
  const data = (await r.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

describe.skipIf(!RUN)('Agent Answer Simulation (live Gemini + real docs)', () => {
  const deps = { crawlerFetch: fetchCrawlerView, model: gemini };
  const questions = [
    'How do I install this and get a minimal example running?',
    'Show me a working code example for the most common use case.',
  ];

  it('scores a JS-gutted docs page low (agent cannot answer)', async () => {
    // React docs /learn is SPA-rendered; the crawler view is sparse for
    // task-specific answers. Apple SwiftUI is near-empty to a crawler.
    const report = await runAgentAnswerTest(
      'https://developer.apple.com/documentation/swiftui',
      deps,
      questions,
    );
    // eslint-disable-next-line no-console
    console.log(
      `\nApple SwiftUI agent-answerability: ${report.answerabilityScore}/100, gaps: ${report.gaps.length}`,
    );
    for (const g of report.gaps) {
      // eslint-disable-next-line no-console
      console.log(`  [${g.verdict}] ${g.question}\n     missing: ${g.missing.slice(0, 160)}`);
    }
    expect(report.answerabilityScore).toBeLessThan(50);
    expect(report.gaps.length).toBeGreaterThan(0);
  }, 60_000);

  it('scores a well-rendered docs page higher than the gutted one', async () => {
    // Vite's guide is largely server-rendered readable prose.
    const good = await runAgentAnswerTest('https://vitejs.dev/guide/', deps, questions);
    // eslint-disable-next-line no-console
    console.log(
      `\nVite guide agent-answerability: ${good.answerabilityScore}/100, gaps: ${good.gaps.length}`,
    );
    expect(good.answerabilityScore).toBeGreaterThan(0);
  }, 60_000);
});
