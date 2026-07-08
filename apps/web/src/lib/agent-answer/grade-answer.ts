import type { AnswerVerdict, QuestionResult } from './types';

/**
 * One agent-answer grading round. Injected model call (same pattern as
 * the fix generator) so the whole thing is testable without a live API
 * and works against any model in production.
 */
export type AnswerModelCall = (prompt: string) => Promise<string>;

const VERDICTS: readonly AnswerVerdict[] = ['answerable', 'partial', 'unanswerable'];

function buildPrompt(question: string, docsContent: string): string {
  return [
    'You are an AI coding assistant (like Cursor, Claude Code, or Codex) helping a developer.',
    'The developer is evaluating the library documented below and asked this question:',
    `QUESTION: ${question}`,
    '',
    'IMPORTANT: The DOCS CONTENT below is EXACTLY what an AI crawler receives from this',
    "library's documentation site — no JavaScript executed, just the raw readable text.",
    'This is all you have. Do not use any outside knowledge about the library.',
    '',
    'Answer the developer using ONLY the docs content. Then judge honestly whether the',
    'content was sufficient to give a CORRECT, COMPLETE, USABLE answer:',
    '- "answerable": the docs contained enough to answer correctly with a real example.',
    '- "partial": you could give a partial answer but key details (code, params, config)',
    '  are missing, so a developer might get stuck or write broken code.',
    '- "unanswerable": the content is insufficient; you would have to guess/hallucinate,',
    '  or you would tell the developer to go read the docs elsewhere.',
    '',
    'Return STRICT JSON, no markdown fences:',
    '{"answer": "your answer to the developer", "verdict": "answerable|partial|unanswerable", "missing": "what content was missing, or empty string if answerable"}',
    '',
    '--- DOCS CONTENT (what the AI crawler sees) ---',
    docsContent.slice(0, 20_000),
  ].join('\n');
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) return candidate;
  return candidate.slice(start, end + 1);
}

function parse(raw: string): { answer: string; verdict: AnswerVerdict; missing: string } | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      return null;
    }
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const p = parsed as { answer?: unknown; verdict?: unknown; missing?: unknown };
  const verdict = typeof p.verdict === 'string' ? (p.verdict as AnswerVerdict) : undefined;
  if (verdict === undefined || !VERDICTS.includes(verdict)) return null;
  return {
    answer: typeof p.answer === 'string' ? p.answer : '',
    verdict,
    missing: typeof p.missing === 'string' ? p.missing : '',
  };
}

/**
 * Grade whether a coding agent can answer one question from the given
 * (crawler-visible) docs content. On a malformed/failed model response
 * we conservatively return 'unanswerable' — if we can't tell, we don't
 * claim the docs are fine.
 */
export async function gradeAgentAnswer(
  question: string,
  docsContent: string,
  model: AnswerModelCall,
): Promise<QuestionResult> {
  if (docsContent.trim().length === 0) {
    return {
      question,
      verdict: 'unanswerable',
      answer: '',
      missing: 'The crawler received no readable content at all from this page.',
    };
  }
  let raw: string;
  try {
    raw = await model(buildPrompt(question, docsContent));
  } catch (err) {
    return {
      question,
      verdict: 'unanswerable',
      answer: '',
      missing: `Model call failed: ${err instanceof Error ? err.message : 'unknown error'}`,
    };
  }
  const parsed = parse(raw);
  if (parsed === null) {
    return {
      question,
      verdict: 'unanswerable',
      answer: '',
      missing: 'Grader returned no usable verdict.',
    };
  }
  return { question, verdict: parsed.verdict, answer: parsed.answer, missing: parsed.missing };
}
