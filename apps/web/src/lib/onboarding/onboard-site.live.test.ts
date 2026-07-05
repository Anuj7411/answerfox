import { readFileSync } from 'node:fs';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import type { AuditReport } from '@answerfox/audit';
import { eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';

// Live onboarding test: create/link/audit against the real DB with an
// injected (fake) audit function, using a fixture repo name distinct
// from af-test-site so it doesn't collide with other live fixtures.
// Gated: RUN_STRESS=1.
const RUN = process.env.RUN_STRESS === '1';
const USER_ID = 'c9edd730-42a8-447b-aa2b-7a2b56addcda';
const FIXTURE_REPO = 'Anuj7411/af-onboarding-fixture';
const FIXTURE_URL = 'https://af-onboarding-fixture.example/';

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

const fakeReport: AuditReport = {
  // biome-ignore lint/suspicious/noExplicitAny: branded URL type, test fixture only
  url: FIXTURE_URL as any,
  fetchedAt: new Date().toISOString(),
  score: 42,
  band: 'weak',
  results: [],
  summary: { pass: 1, fail: 1, warn: 0, skip: 0 },
};

describe.skipIf(!RUN)('onboardSiteFromRepo (live DB)', () => {
  beforeAll(async () => {
    loadDotEnvLocal();
    // Clean slate: remove any leftover fixture site from a prior run
    // (cascades to its audits/findings via ON DELETE CASCADE).
    await getDb().delete(sites).where(eq(sites.repoFullName, FIXTURE_REPO));
  });

  it('creates, links, and audits a new site on first run', async () => {
    const { onboardSiteFromRepo } = await import('./onboard-site');
    const result = await onboardSiteFromRepo(
      {
        userId: USER_ID,
        installationId: 144414142,
        repoFullName: FIXTURE_REPO,
        siteUrl: FIXTURE_URL,
        siteName: 'Onboarding fixture',
      },
      async () => fakeReport,
    );
    // eslint-disable-next-line no-console
    console.log(`onboarded: ${JSON.stringify(result)}`);
    expect(result.alreadyLinked).toBe(false);
    expect(result.auditScore).toBe(42);
    expect(result.site.repoFullName).toBe(FIXTURE_REPO);
    expect(result.site.plan).toBe('free');
  }, 30_000);

  it('is idempotent: re-running for the same repo returns the existing site, no duplicate', async () => {
    const { onboardSiteFromRepo } = await import('./onboard-site');
    let auditCalled = false;
    const result = await onboardSiteFromRepo(
      {
        userId: USER_ID,
        installationId: 144414142,
        repoFullName: FIXTURE_REPO,
        siteUrl: FIXTURE_URL,
        siteName: 'Onboarding fixture (again)',
      },
      async () => {
        auditCalled = true;
        return fakeReport;
      },
    );
    expect(result.alreadyLinked).toBe(true);
    expect(auditCalled).toBe(false); // never re-audits on the idempotent path

    const rows = await getDb().select().from(sites).where(eq(sites.repoFullName, FIXTURE_REPO));
    expect(rows).toHaveLength(1); // no duplicate row
  }, 30_000);
});
