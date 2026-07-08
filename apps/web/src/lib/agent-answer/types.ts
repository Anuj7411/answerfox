/**
 * Agent Answer Simulation.
 *
 * The research-sharpened core: developers now evaluate libraries through
 * AI coding agents (Cursor, Claude Code, Codex). When an agent can't
 * answer "how do I use library X" from the docs it can actually read,
 * the developer picks a competitor whose docs it COULD read.
 *
 * Every other tool in this space scores markup (does the page have
 * JSON-LD, a title, an llms.txt). This instead simulates the actual
 * outcome: feed a coding agent ONLY what an AI crawler receives from
 * the docs (no JavaScript), ask it real developer questions, and grade
 * whether it could give a correct, usable answer. A page can pass every
 * markup check and still leave the agent unable to answer — and vice
 * versa. This measures the thing the money is actually about.
 */

export type AnswerVerdict = 'answerable' | 'partial' | 'unanswerable';

export interface QuestionResult {
  /** The developer question the agent was asked. */
  readonly question: string;
  /** The agent's verdict on whether the docs let it answer. */
  readonly verdict: AnswerVerdict;
  /** The answer the agent produced from crawler-visible content only. */
  readonly answer: string;
  /** What content was missing/insufficient (empty when answerable). */
  readonly missing: string;
}

export interface AgentAnswerReport {
  readonly url: string;
  /** 0-100: how well an AI coding agent can answer real dev questions. */
  readonly answerabilityScore: number;
  readonly results: readonly QuestionResult[];
  /** Questions the agent could NOT fully answer — the fixable gaps. */
  readonly gaps: readonly QuestionResult[];
}
