/**
 * Pure display + ranking helpers for the public leaderboard. No DB, no
 * network — cheap to unit-test. The query gathers latest-audit rows for
 * public sites and hands them here to sort, cap, and rank.
 */

export interface LeaderboardEntry {
  readonly rank: number;
  readonly domain: string;
  readonly score: number;
  readonly band: string;
}

export interface LeaderboardRow {
  readonly domain: string;
  readonly score: number;
  readonly band: string;
  /** ms since epoch of the latest audit — used only as a tiebreak. */
  readonly fetchedAtMs: number;
}

/**
 * Bare display domain from a site URL: hostname, lowercased, without a
 * leading `www.`, protocol, or path. Falls back to a best-effort strip
 * for inputs that don't parse as a URL.
 */
export function toDisplayDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return url
      .replace(/^[a-z]+:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .toLowerCase();
  }
}

/**
 * Rank rows by score (desc), breaking ties by most-recent audit then
 * domain (for a stable order), cap to `limit`, and assign 1-based ranks.
 */
export function rankEntries(rows: readonly LeaderboardRow[], limit = 100): LeaderboardEntry[] {
  return [...rows]
    .sort(
      (a, b) =>
        b.score - a.score || b.fetchedAtMs - a.fetchedAtMs || a.domain.localeCompare(b.domain),
    )
    .slice(0, limit)
    .map((r, i) => ({ rank: i + 1, domain: r.domain, score: r.score, band: r.band }));
}
