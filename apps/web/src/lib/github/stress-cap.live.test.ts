import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { MAX_OPEN_PRS } from './create-fix-pr';

// Live stress on the real repo: prove the 5-PR hygiene cap holds and
// that re-running the same finding is idempotent (no duplicate PR).
// Opens real PRs, then closes/cleans everything it created.
// Gated: RUN_STRESS=1.
const RUN = process.env.RUN_STRESS === '1';
const PEM_PATH = 'C:/Users/ojhaa/Downloads/answerfox.2026-07-04.private-key.pem';
const INSTALLATION_ID = 144414142;
const OWNER = 'Anuj7411';
const REPO = 'af-test-site';

// biome-ignore lint/suspicious/noExplicitAny: narrow client shape
let client: any;
const createdBranches: string[] = [];
const createdPrs: number[] = [];

// Fire a synthetic (non-Gemini) fix so the test isolates the GitHub-side
// cap/idempotency mechanics from the model's free-tier quota. Returns
// the createFixPr result normalized to the pipeline's stage shape.
async function fire(checkId: string, requestId: string) {
  const { createFixPr } = await import('./create-fix-pr');
  const content = `<!doctype html>\n<html><head><meta charset="utf-8" /><link rel="canonical" href="https://af-test-site.example/${requestId}" /></head><body><h1>Widgetly</h1></body></html>\n`;
  const editSet = {
    checkId,
    title: `fix: add canonical (${checkId})`,
    description: `Stress ${requestId}: add a canonical link.`,
    edits: [{ kind: 'create' as const, path: 'index.html', content }],
  };
  const result = await createFixPr(client, {
    owner: OWNER,
    repo: REPO,
    editSet,
    files: new Map([['index.html', content]]),
    requestId,
  });
  if (result.ok) {
    createdPrs.push(result.prNumber);
    createdBranches.push(result.branch);
    return { stage: 'pr-opened' as const, prNumber: result.prNumber, branch: result.branch };
  }
  return { stage: 'pr-failed' as const, reason: result.reason };
}

describe.skipIf(!RUN)('Live PR-cap + idempotency stress', () => {
  beforeAll(async () => {
    process.env.GITHUB_APP_ID = '4216145';
    process.env.GITHUB_APP_PRIVATE_KEY = readFileSync(PEM_PATH, 'utf8').trim();
    const { getInstallationClient } = await import('./app-client');
    client = await getInstallationClient(INSTALLATION_ID);
  });

  afterAll(async () => {
    // Close every PR we opened and delete its branch, leaving the repo
    // as we found it (exit-test PRs #1/#2 and merged #3 are untouched).
    for (const n of createdPrs) {
      try {
        await client.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
          owner: OWNER,
          repo: REPO,
          pull_number: n,
          state: 'closed',
        });
      } catch {
        /* best effort */
      }
    }
    for (const b of createdBranches) {
      try {
        await client.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
          owner: OWNER,
          repo: REPO,
          ref: `heads/${b}`,
        });
      } catch {
        /* best effort */
      }
    }
    // eslint-disable-next-line no-console
    console.log(
      `cleanup: closed ${createdPrs.length} PRs, deleted ${createdBranches.length} branches`,
    );
  });

  it('refuses to exceed the 5-open-PR cap on the real repo', async () => {
    // Fire distinct findings until the cap refuses. Bounded so a
    // give-up (no-valid-fix) or transient error can't loop forever.
    let refused = false;
    let openedThisRun = 0;
    for (let i = 0; i < 8 && !refused; i++) {
      const result = await fire('A4', `stress-cap-${i}-${INSTALLATION_ID}`);
      if (result.stage === 'pr-opened') openedThisRun += 1;
      if (result.stage === 'pr-failed' && result.reason.includes('PR cap')) refused = true;
      // eslint-disable-next-line no-console
      console.log(
        `  fire ${i}: ${result.stage}${result.stage === 'pr-failed' ? ` (${result.reason})` : ''}`,
      );
    }
    expect(refused).toBe(true);
    // eslint-disable-next-line no-console
    console.log(
      `cap held after opening ${openedThisRun} this run (max ${MAX_OPEN_PRS} total open)`,
    );
  }, 120_000);

  it('is idempotent: same requestId returns the same PR, not a duplicate', async () => {
    // Close one cap PR first so we have headroom under the cap.
    if (createdPrs.length > 0) {
      const n = createdPrs.pop();
      const b = createdBranches.pop();
      await client.request('PATCH /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: OWNER,
        repo: REPO,
        pull_number: n,
        state: 'closed',
      });
      if (b) {
        await client.request('DELETE /repos/{owner}/{repo}/git/refs/{ref}', {
          owner: OWNER,
          repo: REPO,
          ref: `heads/${b}`,
        });
      }
    }

    const rid = `stress-idem-${INSTALLATION_ID}`;
    const first = await fire('A4', rid);
    expect(first.stage).toBe('pr-opened');
    const second = await fire('A4', rid);
    // Same deterministic branch -> ref/PR reuse -> same PR number.
    if (first.stage === 'pr-opened' && second.stage === 'pr-opened') {
      expect(second.prNumber).toBe(first.prNumber);
      // eslint-disable-next-line no-console
      console.log(`idempotency: both calls returned PR #${first.prNumber}`);
    }
  }, 120_000);
});
