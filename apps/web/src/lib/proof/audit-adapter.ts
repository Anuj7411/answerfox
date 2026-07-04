import 'server-only';
import { audit } from '@answerfox/audit';
import type { AuditFn } from './run-proof';

/**
 * Thin adapter from the shared audit engine to the Proof-of-Fix
 * orchestrator's injected `AuditFn`. Runs a full 50-check audit of the
 * live URL and returns just the score the comment needs. Kept behind
 * this seam so run-proof stays unit-testable with a fake.
 */
export const runAudit: AuditFn = async (siteUrl: string) => {
  const report = await audit(siteUrl);
  return { score: report.score };
};
