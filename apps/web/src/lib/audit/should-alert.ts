interface ShouldAlertArgs {
  readonly threshold: number | null;
  readonly previousScore: number | null;
  readonly currentScore: number;
}

/**
 * Decide whether a score-drop alert should fire after an audit completes.
 *
 * Rules:
 * - No alert if the site has no threshold configured.
 * - No alert on the first-ever audit (nothing to compare against).
 * - Alert fires when the latest run dropped **below** the threshold AND
 *   the previous run was at or above it. This is an edge-trigger so
 *   the user gets one email when a site crosses the line, not one
 *   per consecutive failing audit.
 *
 * Pure function — no DB, no network. Cheap to unit-test.
 */
export function shouldFireScoreDropAlert(args: ShouldAlertArgs): boolean {
  const { threshold, previousScore, currentScore } = args;
  if (threshold === null) return false;
  if (previousScore === null) return false;
  return previousScore >= threshold && currentScore < threshold;
}
