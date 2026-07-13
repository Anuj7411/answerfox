import 'server-only';
import type { AnswerModelCall } from './grade-answer';

/**
 * The model adapter for the Agent Answer Simulation.
 *
 * Same shape as the fix generators: a Gemini call behind an injectable
 * seam. The one deliberate difference is `createAnswerModel` returns
 * `null` when no API key is set, instead of a stub. A stubbed answer
 * would produce a fake answerability score, and a fake outcome metric
 * is the exact thing this product refuses to ship. No key means the
 * caller reports "unavailable", never a made-up number.
 */

const DEFAULT_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 30_000;

/** Low-level Gemini call returning the raw model text. */
export async function callGeminiForAnswer(
  prompt: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini returned HTTP ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Build the AnswerModelCall the simulation runs against, or `null` when
 * no API key is configured. Null is intentional (see file header): the
 * caller returns an honest "unavailable" rather than a fabricated score.
 */
export function createAnswerModel(
  opts: { readonly apiKey?: string; readonly fetchImpl?: typeof fetch } = {},
): AnswerModelCall | null {
  const apiKey = opts.apiKey ?? process.env.GEMINI_API_KEY ?? '';
  if (apiKey.length === 0) return null;
  const fetchImpl = opts.fetchImpl ?? fetch;
  return (prompt: string) => callGeminiForAnswer(prompt, apiKey, fetchImpl);
}
