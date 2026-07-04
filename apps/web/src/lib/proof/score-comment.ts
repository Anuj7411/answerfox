/**
 * Proof-of-Fix comment (hero H3).
 *
 * On merge we re-audit the live site and comment the before/after
 * agent-readiness score on the PR. Every merged fix becomes evidence
 * the subscription pays for itself, and the badge line seeds the §7
 * badge loop — it sits in front of every future reviewer on the repo.
 * Nobody else closes this loop.
 */

export interface ProofScores {
  readonly before: number;
  readonly after: number;
  /** The check this PR fixed, e.g. "C2". */
  readonly checkId: string;
}

const MARKER = '<!-- answerfox:proof-of-fix:v1 -->';

/** Sticky-comment marker so re-posts update in place instead of stacking. */
export function proofCommentMarker(): string {
  return MARKER;
}

export function formatProofComment(scores: ProofScores): string {
  const { before, after, checkId } = scores;
  const delta = after - before;

  let headline: string;
  if (delta > 0) {
    headline = `**Re-audit complete: agent-readiness ${before} → ${after}** (+${delta})`;
  } else if (delta < 0) {
    // Honest: never dress up a regression. This should be rare (the fix
    // was validated), but if merging moved the score down, say so.
    headline = `**Re-audit complete: agent-readiness ${before} → ${after}** (${delta})`;
  } else {
    headline = `**Re-audit complete: agent-readiness held at ${after}**`;
  }

  const badge = `[audited by AnswerFox · ${before}→${after}](https://answerfox.dev)`;

  return [
    MARKER,
    headline,
    '',
    `This merge fixed \`${checkId}\`. The score above is what AI crawlers now see on your live site.`,
    '',
    badge,
  ].join('\n');
}
