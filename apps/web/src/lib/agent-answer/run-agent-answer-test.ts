import { extractVisibleText } from '@/lib/xray/extract-text';
import { DEFAULT_DEVELOPER_QUESTIONS } from './default-questions';
import { type AnswerModelCall, gradeAgentAnswer } from './grade-answer';
import type { AgentAnswerReport, AnswerVerdict, QuestionResult } from './types';

/**
 * Run the full Agent Answer Simulation for one docs URL: fetch what the
 * crawler actually receives, then ask a coding agent every developer
 * question against that (and only that) content. Produces an
 * answerability score plus the specific gaps — each of which maps to a
 * fix-PR downstream (add a code example, expose JS-only content, etc).
 *
 * Reuses the X-Ray crawler-fetch + text extraction so "what the agent
 * sees" is defined identically everywhere in the product.
 */

const VERDICT_POINTS: Record<AnswerVerdict, number> = {
  answerable: 2,
  partial: 1,
  unanswerable: 0,
};

export interface AgentAnswerDeps {
  /** Fetch the raw crawler-view HTML of the URL (no JS). */
  readonly crawlerFetch: (url: string) => Promise<string>;
  /** The model that plays the coding agent. */
  readonly model: AnswerModelCall;
}

export async function runAgentAnswerTest(
  url: string,
  deps: AgentAnswerDeps,
  questions: readonly string[] = DEFAULT_DEVELOPER_QUESTIONS,
): Promise<AgentAnswerReport> {
  let docsContent: string;
  try {
    const html = await deps.crawlerFetch(url);
    docsContent = extractVisibleText(html);
  } catch {
    docsContent = '';
  }

  const results: QuestionResult[] = [];
  for (const question of questions) {
    results.push(await gradeAgentAnswer(question, docsContent, deps.model));
  }

  const maxPoints = results.length * VERDICT_POINTS.answerable;
  const earned = results.reduce((sum, r) => sum + VERDICT_POINTS[r.verdict], 0);
  const answerabilityScore = maxPoints === 0 ? 0 : Math.round((earned / maxPoints) * 100);
  const gaps = results.filter((r) => r.verdict !== 'answerable');

  return { url, answerabilityScore, results, gaps };
}
