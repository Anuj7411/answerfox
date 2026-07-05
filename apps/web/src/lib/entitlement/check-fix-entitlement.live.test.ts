import { readFileSync } from 'node:fs';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';

// Live entitlement test: the real DB + real GitHub visibility check
// against af-test-site (private=true, linked, plan=free). Proves the
// free-loop-once rule end to end: first call allowed + consumes,
// second call blocked, and the atomic consume can't double-grant under
// concurrent requests. Gated: RUN_STRESS=1.
const RUN = process.env.RUN_STRESS === '1';
const PEM_PATH = 'C:/Users/ojhaa/Downloads/answerfox.2026-07-04.private-key.pem';
const INSTALLATION_ID = 144414142;
const REPO_FULL_NAME = 'Anuj7411/af-test-site';

function loadDotEnvLocal(): void {
  const lines = readFileSync('.env.local', 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const key = line.slice(0, i).trim();
    const value = line
      .slice(i + 1)
      .trim()
      .replace(/^"|"$/g, '');
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

describe.skipIf(!RUN)('checkFixEntitlement (live DB + GitHub)', () => {
  beforeAll(async () => {
    loadDotEnvLocal();
    process.env.GITHUB_APP_ID = '4216145';
    process.env.GITHUB_APP_PRIVATE_KEY = readFileSync(PEM_PATH, 'utf8').trim();
    // Reset af-test-site to a clean free/unconsumed state before the run.
    await getDb()
      .update(sites)
      .set({ plan: 'free', freeLoopConsumedAt: null })
      .where(and(eq(sites.repoFullName, REPO_FULL_NAME)));
  });

  it('allows and consumes the first free loop, then blocks the second', async () => {
    const { getInstallationClient } = await import('@/lib/github/app-client');
    const { checkFixEntitlement } = await import('./check-fix-entitlement');
    const client = await getInstallationClient(INSTALLATION_ID);
    const [owner, repo] = REPO_FULL_NAME.split('/') as [string, string];

    const first = await checkFixEntitlement(client, owner, repo);
    // eslint-disable-next-line no-console
    console.log(`first call: ${JSON.stringify(first)}`);
    expect(first).toEqual({ allowed: true, consumesFreeLoop: true });

    const second = await checkFixEntitlement(client, owner, repo);
    // eslint-disable-next-line no-console
    console.log(`second call (expect blocked): ${JSON.stringify(second)}`);
    expect(second.allowed).toBe(false);

    // Confirm the DB actually reflects consumption, not just the
    // in-memory decision.
    const [row] = await getDb()
      .select({ freeLoopConsumedAt: sites.freeLoopConsumedAt })
      .from(sites)
      .where(eq(sites.repoFullName, REPO_FULL_NAME));
    expect(row?.freeLoopConsumedAt).not.toBeNull();
  }, 30_000);

  it('never lets a concurrent burst consume the free loop twice', async () => {
    // Reset again for this test's own clean baseline.
    await getDb()
      .update(sites)
      .set({ plan: 'free', freeLoopConsumedAt: null })
      .where(and(eq(sites.repoFullName, REPO_FULL_NAME)));

    const { getInstallationClient } = await import('@/lib/github/app-client');
    const { checkFixEntitlement } = await import('./check-fix-entitlement');
    const client = await getInstallationClient(INSTALLATION_ID);
    const [owner, repo] = REPO_FULL_NAME.split('/') as [string, string];

    const results = await Promise.all(
      Array.from({ length: 5 }, () => checkFixEntitlement(client, owner, repo)),
    );
    const allowedCount = results.filter((r) => r.allowed).length;
    // eslint-disable-next-line no-console
    console.log(`concurrent burst of 5: ${allowedCount} allowed (expect exactly 1)`);
    expect(allowedCount).toBe(1);
  }, 30_000);
});
