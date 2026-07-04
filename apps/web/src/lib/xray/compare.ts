import { extractVisibleText, tokenizeWords } from './extract-text';

/**
 * The X-Ray verdict for one page: how much of what a human sees does
 * the crawler actually receive? Built on multiset word coverage, so a
 * nav bar that appears in both views cancels out and what remains is
 * genuinely missing content.
 */
export interface XrayComparison {
  /** Words a human's rendered page contains. */
  readonly renderedWordCount: number;
  /** Words the crawler's raw fetch contains. */
  readonly crawlerWordCount: number;
  /** 0-100: % of rendered words also present in the crawler view. */
  readonly coveragePercent: number;
  /** Longest runs of consecutive rendered words missing from the crawler view. */
  readonly missingSamples: readonly string[];
}

const SAMPLE_COUNT = 5;
const SAMPLE_MIN_RUN = 8;
const SAMPLE_MAX_WORDS = 40;

export function compareViews(crawlerHtml: string, renderedHtml: string): XrayComparison {
  const renderedText = extractVisibleText(renderedHtml);
  const renderedWords = tokenizeWords(renderedText);
  const crawlerWords = tokenizeWords(extractVisibleText(crawlerHtml));

  // Multiset containment: each crawler word can only cover one
  // rendered occurrence, so repeated rendered content must really
  // be there repeatedly to count.
  const budget = new Map<string, number>();
  for (const w of crawlerWords) budget.set(w, (budget.get(w) ?? 0) + 1);

  let covered = 0;
  const missingFlags: boolean[] = new Array(renderedWords.length).fill(false);
  renderedWords.forEach((w, i) => {
    const remaining = budget.get(w) ?? 0;
    if (remaining > 0) {
      budget.set(w, remaining - 1);
      covered += 1;
    } else {
      missingFlags[i] = true;
    }
  });

  // Collect the longest consecutive missing runs as human-readable
  // evidence ("here is the paragraph GPTBot never received").
  const runs: Array<{ start: number; length: number }> = [];
  let runStart = -1;
  for (let i = 0; i <= renderedWords.length; i++) {
    if (i < renderedWords.length && missingFlags[i]) {
      if (runStart === -1) runStart = i;
    } else if (runStart !== -1) {
      runs.push({ start: runStart, length: i - runStart });
      runStart = -1;
    }
  }
  const missingSamples = runs
    .filter((r) => r.length >= SAMPLE_MIN_RUN)
    .sort((a, b) => b.length - a.length)
    .slice(0, SAMPLE_COUNT)
    .map((r) =>
      renderedWords.slice(r.start, r.start + Math.min(r.length, SAMPLE_MAX_WORDS)).join(' '),
    );

  return {
    renderedWordCount: renderedWords.length,
    crawlerWordCount: crawlerWords.length,
    coveragePercent:
      renderedWords.length === 0 ? 100 : Math.round((covered / renderedWords.length) * 100),
    missingSamples,
  };
}
