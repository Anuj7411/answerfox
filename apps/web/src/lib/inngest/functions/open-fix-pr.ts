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
 * Week-1 scope: the queue semantics and a simulated PR step, so the
 * exit test (synthetic burst serializes, no 403 conditions possible)
 * is provable before the App has API credentials. Week 2 replaces
 * `simulate-pr` with the real branch+commit+PR steps via Octokit.
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
    const { installationId, repoFullName, checkId, requestId } = event.data;

    const result = await step.run('simulate-pr', async () => {
      // Placeholder for week 2: create branch, apply validated
      // search/replace edits, open the PR via Octokit. The delay
      // stands in for the real API round-trips so queue serialization
      // is observable end to end.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        installationId,
        repoFullName,
        checkId,
        requestId,
        simulatedAt: new Date().toISOString(),
      };
    });

    return result;
  },
);
