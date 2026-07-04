import { runDriftAudit } from '@/lib/drift/audit-adapter';
import { runDrift } from '@/lib/drift/run-drift';
import { getInstallationClient } from '@/lib/github/app-client';
import { resolveTargetPath } from '@/lib/github/resolve-target-path';
import { driftCheckRequested, fixPrRequested, inngest } from '@/lib/inngest/client';

/**
 * Drift Guard queue consumer: a deploy landed on a linked repo, so
 * re-audit the live site and, for every check that regressed, enqueue
 * a fix-PR through the same throttled pipeline as everything else.
 * Every alert arrives with its fix — the fix-PR queue's cap and
 * idempotent branch reuse prevent PR spam even if drift fires
 * repeatedly for the same regression.
 *
 * Debounce collapses deploy bursts: five pushes in three minutes on
 * the same repo produce ONE drift check, run after things settle.
 */
export const checkDrift = inngest.createFunction(
  {
    id: 'check-drift',
    triggers: [driftCheckRequested],
    debounce: { key: 'event.data.repoFullName', period: '3m' },
    concurrency: [{ key: 'event.data.installationId', limit: 1 }],
    retries: 3,
  },
  async ({ event, step }) => {
    const { installationId, repoFullName, siteUrl, priorScore, priorFailedCheckIds, source } =
      event.data;
    const [owner, repo] = repoFullName.split('/');

    // Resolved once per drift check (not per regressed check) since
    // it's the same repo either way — real stack detection instead of
    // a hardcoded file guess.
    const targetPath = await step.run('resolve-target-path', async () => {
      if (!owner || !repo) return 'index.html';
      const client = await getInstallationClient(installationId);
      return resolveTargetPath(client, owner, repo);
    });

    const outcome = await step.run('run-drift', async () =>
      runDrift(
        { repoFullName, siteUrl, priorScore, priorFailedCheckIds, source },
        runDriftAudit,
        async ({ checkId, requestId }) => {
          await inngest.send(
            fixPrRequested.create({
              installationId,
              repoFullName,
              targetPath,
              checkId,
              description: `Drift Guard: check ${checkId} passed before the latest ${source} and fails now.`,
              fixRecommendation: null,
              evidence: null,
              siteUrl,
              requestId,
            }),
          );
        },
      ),
    );

    return outcome;
  },
);
