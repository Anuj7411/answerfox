import { getInstallationClient } from '@/lib/github/app-client';
import { inngest, proofRequested } from '@/lib/inngest/client';
import { runAudit } from '@/lib/proof/audit-adapter';
import { runProof } from '@/lib/proof/run-proof';

/**
 * Proof-of-Fix queue consumer: a merged fix-PR triggers a re-audit of
 * the live site and posts the before/after score comment. Same
 * per-installation serialization + throttle as the fix-PR queue so we
 * never trip GitHub's secondary limits.
 */
export const postProof = inngest.createFunction(
  {
    id: 'post-proof',
    triggers: [proofRequested],
    concurrency: [{ key: 'event.data.installationId', limit: 1 }],
    throttle: { key: 'event.data.installationId', limit: 20, period: '1m' },
    retries: 3,
  },
  async ({ event, step }) => {
    const { installationId, repoFullName, prNumber, siteUrl, checkId, beforeScore } = event.data;
    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
      return { stage: 'audit-failed', reason: `Malformed repoFullName: ${repoFullName}` } as const;
    }

    return step.run('post-proof', async () => {
      const client = await getInstallationClient(installationId);
      return runProof(client, { owner, repo, prNumber, siteUrl, checkId, beforeScore }, runAudit);
    });
  },
);
