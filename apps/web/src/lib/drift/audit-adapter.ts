import 'server-only';
import { audit } from '@answerfox/audit';
import type { DriftAuditFn } from './run-drift';

/**
 * Engine adapter for Drift Guard: full audit of the live URL, reduced
 * to the score plus the ids of currently-failing checks (what the
 * drift diff needs). Behind this seam so run-drift stays fake-testable.
 */
export const runDriftAudit: DriftAuditFn = async (siteUrl: string) => {
  const report = await audit(siteUrl);
  return {
    score: report.score,
    failedCheckIds: report.results.filter((r) => r.status === 'fail').map((r) => r.id),
  };
};
