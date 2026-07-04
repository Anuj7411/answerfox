import { getInstallationClient } from '@/lib/github/app-client';
import { runFixPipeline } from '@/lib/github/run-fix-pipeline';
import { fixPrRequested, inngest } from '@/lib/inngest/client';

/**
 * The per-installation PR queue — built week 1, never bolted on.
 *
 * GitHub's secondary rate limits allow roughly 80 content-generating
 * requests per minute per App and punish concurrency hard (403s with
 * retry-after). The Renovate lesson: serialize writes per installation
 * and pace them, and the limits never trigger. Hence:
 *
 * - `concurrency` limit 1 keyed on installationId: at most one PR is
 *   being opened per installation at any moment; a burst of findings
 *   queues instead of stampeding.
 * - `throttle` 20/min per installation: even sequential PRs are paced
 *   well under the write budget, leaving headroom for other App calls.
 *
 * The step runs the real pipeline: authenticate as the installation,
 * read the target file, generate a validated EditSet, and open the
 * capped fix-PR. `createFixPr` is idempotent (ref/PR reuse on 422), so
 * the `retries: 3` here is safe against partial-run replays.
 */
export const openFixPr = inngest.createFunction(
  {
    id: 'open-fix-pr',
    triggers: [fixPrRequested],
    concurrency: [{ key: 'event.data.installationId', limit: 1 }],
    throttle: {
      key: 'event.data.installationId',
      limit: 20,
      period: '1m',
    },
    retries: 3,
  },
  async ({ event, step }) => {
    const {
      installationId,
      repoFullName,
      targetPath,
      checkId,
      description,
      fixRecommendation,
      evidence,
      siteUrl,
      requestId,
    } = event.data;

    const [owner, repo] = repoFullName.split('/');
    if (!owner || !repo) {
      return { stage: 'no-file', reason: `Malformed repoFullName: ${repoFullName}` } as const;
    }

    return step.run('open-fix-pr', async () => {
      const client = await getInstallationClient(installationId);
      return runFixPipeline(client, {
        owner,
        repo,
        targetPath,
        checkId,
        description,
        fixRecommendation,
        evidence,
        siteUrl,
        requestId,
      });
    });
  },
);
