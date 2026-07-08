import { describe, expect, it } from 'vitest';
import { gradeAgentAnswer } from './grade-answer';
import { runAgentAnswerTest } from './run-agent-answer-test';

const DOCS = 'Widgetly. Install with npm i widgetly. Call createWidget(token) to start.';

function jsonModel(verdict: string, answer = 'a', missing = '') {
  return async () => JSON.stringify({ answer, verdict, missing });
}

describe('gradeAgentAnswer', () => {
  it('passes through a well-formed answerable verdict', async () => {
    const r = await gradeAgentAnswer(
      'how to install?',
      DOCS,
      jsonModel('answerable', 'npm i widgetly'),
    );
    expect(r.verdict).toBe('answerable');
    expect(r.answer).toBe('npm i widgetly');
  });

  it('handles fenced JSON', async () => {
    const r = await gradeAgentAnswer(
      'q',
      DOCS,
      async () => '```json\n{"answer":"x","verdict":"partial","missing":"no example"}\n```',
    );
    expect(r.verdict).toBe('partial');
    expect(r.missing).toBe('no example');
  });

  it('returns unanswerable when the crawler content is empty (before calling the model)', async () => {
    let called = false;
    const r = await gradeAgentAnswer('q', '   ', async () => {
      called = true;
      return jsonModel('answerable')();
    });
    expect(r.verdict).toBe('unanswerable');
    expect(called).toBe(false);
    expect(r.missing).toContain('no readable content');
  });

  it('conservatively returns unanswerable on a malformed model response', async () => {
    const r = await gradeAgentAnswer('q', DOCS, async () => 'not json at all');
    expect(r.verdict).toBe('unanswerable');
  });

  it('conservatively returns unanswerable when the model throws', async () => {
    const r = await gradeAgentAnswer('q', DOCS, async () => {
      throw new Error('HTTP 503');
    });
    expect(r.verdict).toBe('unanswerable');
    expect(r.missing).toContain('503');
  });

  it('rejects an invalid verdict value', async () => {
    const r = await gradeAgentAnswer('q', DOCS, async () =>
      JSON.stringify({ answer: 'x', verdict: 'maybe' }),
    );
    expect(r.verdict).toBe('unanswerable');
  });
});

describe('runAgentAnswerTest', () => {
  const crawlerFetch = async () => `<html><body><p>${DOCS}</p></body></html>`;

  it('scores 100 when the agent can answer every question', async () => {
    const report = await runAgentAnswerTest(
      'https://widgetly.dev/docs',
      { crawlerFetch, model: jsonModel('answerable') },
      ['q1', 'q2', 'q3'],
    );
    expect(report.answerabilityScore).toBe(100);
    expect(report.gaps).toHaveLength(0);
  });

  it('scores 0 and lists every question as a gap when nothing is answerable', async () => {
    const report = await runAgentAnswerTest(
      'https://widgetly.dev/docs',
      { crawlerFetch, model: jsonModel('unanswerable', '', 'missing everything') },
      ['q1', 'q2'],
    );
    expect(report.answerabilityScore).toBe(0);
    expect(report.gaps).toHaveLength(2);
  });

  it('computes a partial score and collects only the failing gaps', async () => {
    // Alternate answerable / partial: 2 + 1 out of 4 max = 75.
    let n = 0;
    const model = async () => {
      n += 1;
      return JSON.stringify({
        answer: 'a',
        verdict: n === 1 ? 'answerable' : 'partial',
        missing: n === 1 ? '' : 'no code example',
      });
    };
    const report = await runAgentAnswerTest('https://x.dev', { crawlerFetch, model }, ['q1', 'q2']);
    expect(report.answerabilityScore).toBe(75);
    expect(report.gaps).toHaveLength(1);
    expect(report.gaps[0]?.missing).toBe('no code example');
  });

  it('scores 0 when the crawler receives an empty (JS-only) shell', async () => {
    const report = await runAgentAnswerTest(
      'https://spa.dev/docs',
      {
        crawlerFetch: async () =>
          '<html><body><div id="root"></div><script src="app.js"></script></body></html>',
        model: jsonModel('answerable'),
      },
      ['q1', 'q2'],
    );
    // extractVisibleText yields nothing -> every question unanswerable.
    expect(report.answerabilityScore).toBe(0);
    expect(report.gaps).toHaveLength(2);
  });
});
