import { readFileSync } from 'node:fs';
import { loadHtml, runChecks } from '@answerfox/audit';
import { and, eq } from 'drizzle-orm';
import { beforeAll, describe, expect, it } from 'vitest';
import { getDb } from './client';
import { createAuditWithFindings } from './mutations/audits';
import { createSiteForUser, linkSiteToRepo } from './mutations/sites';
import { getRepoAuditContext } from './queries/repo-context';
import { sites } from './schema/sites';

// Load .env.local manually: vitest doesn't auto-read it, and getDb()
// reads DATABASE_URL lazily at first call, so this only needs to run
// before the test body executes.
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

// Live wiring test: create/link a real site row for af-test-site,
// persist a genuine audit via the real engine, and confirm
// getRepoAuditContext resolves it end to end against Supabase.
// Gated: RUN_STRESS=1 (reuses the stress gate; hits the real DB).
const RUN = process.env.RUN_STRESS === '1';
const USER_ID = 'c9edd730-42a8-447b-aa2b-7a2b56addcda';
const REPO_FULL_NAME = 'Anuj7411/af-test-site';
const INSTALLATION_ID = 144414142;
const SITE_URL = 'https://af-test-site.example/';

describe.skipIf(!RUN)('repo<->site linking (live DB)', () => {
  beforeAll(() => {
    loadDotEnvLocal();
  });

  it('links a site to the test repo and resolves its audit context', async () => {
    const db = getDb();
    const existing = await db
      .select()
      .from(sites)
      .where(and(eq(sites.userId, USER_ID), eq(sites.repoFullName, REPO_FULL_NAME)))
      .limit(1);

    let site = existing[0];
    if (site === undefined) {
      site = await createSiteForUser({
        userId: USER_ID,
        url: SITE_URL,
        name: 'af-test-site (stress)',
      });
      const linked = await linkSiteToRepo({
        userId: USER_ID,
        siteId: site.id,
        repoFullName: REPO_FULL_NAME,
        installationId: INSTALLATION_ID,
      });
      expect(linked).toBe(true);
    }

    const html = [
      '<!doctype html>',
      '<html><head><meta charset="utf-8" /></head>',
      '<body><main><h1>Widgetly Docs</h1><p>Widgetly is a tiny library for building widgets.</p></main></body>',
      '</html>',
    ].join('\n');
    const dom = loadHtml(html);
    // biome-ignore lint/suspicious/noExplicitAny: test-only branded-URL cast
    const report = await runChecks({ url: SITE_URL as any, html, dom });
    const auditRow = await createAuditWithFindings({ siteId: site.id, report });
    // eslint-disable-next-line no-console
    console.log(`persisted audit: score=${auditRow.score} band=${auditRow.band}`);
    expect(auditRow.score).toBeGreaterThanOrEqual(0);

    const ctx = await getRepoAuditContext(REPO_FULL_NAME);
    // eslint-disable-next-line no-console
    console.log(`getRepoAuditContext -> ${JSON.stringify(ctx)}`);
    expect(ctx).not.toBeNull();
    expect(ctx?.siteUrl).toBe(SITE_URL);
    expect(ctx?.beforeScore).toBe(auditRow.score);
    expect(ctx?.priorFailedCheckIds.length).toBeGreaterThan(0);

    // Unknown repo must still resolve to null (no false positives).
    expect(await getRepoAuditContext('someone-else/unrelated-repo')).toBeNull();
  }, 30_000);
});
