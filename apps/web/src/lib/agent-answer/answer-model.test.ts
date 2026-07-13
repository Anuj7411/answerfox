import { describe, expect, it } from 'vitest';
import { callGeminiForAnswer, createAnswerModel } from './answer-model';

/**
 * Builds a fake `fetch` that returns a Gemini-shaped success envelope
 * wrapping `text`, so the adapter can be exercised with no network.
 */
function fakeFetch(text: string, status = 200): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }),
      { status, headers: { 'Content-Type': 'application/json' } },
    )) as unknown as typeof fetch;
}

describe('createAnswerModel', () => {
  it('returns null when no API key is set (no fake score)', () => {
    expect(createAnswerModel({ apiKey: '' })).toBeNull();
  });

  it('returns a callable model when a key is present', () => {
    const model = createAnswerModel({ apiKey: 'k', fetchImpl: fakeFetch('{"ok":true}') });
    expect(typeof model).toBe('function');
  });

  it('passes the prompt through to Gemini and returns its text', async () => {
    const model = createAnswerModel({
      apiKey: 'k',
      fetchImpl: fakeFetch('{"verdict":"answerable"}'),
    });
    expect(model).not.toBeNull();
    const out = await model?.('any prompt');
    expect(out).toBe('{"verdict":"answerable"}');
  });
});

describe('callGeminiForAnswer', () => {
  it('extracts the first candidate part text', async () => {
    const out = await callGeminiForAnswer('p', 'k', fakeFetch('hello'));
    expect(out).toBe('hello');
  });

  it('returns empty string when the envelope has no candidates', async () => {
    const empty: typeof fetch = (async () =>
      new Response(JSON.stringify({}), { status: 200 })) as unknown as typeof fetch;
    expect(await callGeminiForAnswer('p', 'k', empty)).toBe('');
  });

  it('throws on a non-ok HTTP status', async () => {
    await expect(callGeminiForAnswer('p', 'k', fakeFetch('nope', 500))).rejects.toThrow(
      /Gemini returned HTTP 500/,
    );
  });
});
