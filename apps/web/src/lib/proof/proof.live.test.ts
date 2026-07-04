import { readFileSync } from 'node:fs';
import { loadHtml, runChecks } from '@answerfox/audit';
import { beforeAll, describe, expect, it } from 'vitest';

// Live Proof-of-Fix test: posts a real before/after score comment on
// the already-merged PR #3 of af-test-site. Scores are GENUINE — the
// real audit engine runs against the actual before/after HTML (the
// site isn't deployed, so we score the file content directly, which is
// exactly what the engine does with a fetched page). Gated behind
// RUN_PROOF_TEST=1.
const RUN = process.env.RUN_PROOF_TEST === '1';
const PEM_PATH = 'C:/Users/ojhaa/Downloads/answerfox.2026-07-04.private-key.pem';
const INSTALLATION_ID = 144414142;
const PR_NUMBER = 3;
const SITE_URL = 'https://af-test-site.example/';

const BEFORE_HTML = [
  '<!doctype html>',
  '<html>',
  '<head><meta charset="utf-8" /></head>',
  '<body><main><h1>Widgetly Docs</h1><p>Widgetly is a tiny library for building widgets.</p></main></body>',
  '</html>',
].join('\n');

async function scoreOf(html: string): Promise<number> {
  const dom = loadHtml(html);
  const report = await runChecks({ url: SITE_URL as never, html, dom });
  return report.score;
}

describe.skipIf(!RUN)('Proof-of-Fix (live comment on merged PR #3)', () => {
  beforeAll(() => {
    process.env.GITHUB_APP_ID = '4216145';
    process.env.GITHUB_APP_PRIVATE_KEY = readFileSync(PEM_PATH, 'utf8').trim();
  });

  it('re-audits and posts the real 61->74-style comment, sticky on re-run', async () => {
    const { getInstallationClient } = await import('@/lib/github/app-client');
    const { runProof } = await import('./run-proof');

    // Genuine before/after from the real engine.
    const before = await scoreOf(BEFORE_HTML);
    const afterHtml = (await (
      await getInstallationClient(INSTALLATION_ID)
    ).request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner: 'Anuj7411',
      repo: 'af-test-site',
      path: 'index.html',
    })) as { data: { content: string } };
    const mergedHtml = Buffer.from(afterHtml.data.content, 'base64').toString('utf8');
    const after = await scoreOf(mergedHtml);
    // eslint-disable-next-line no-console
    console.log(`\nGENUINE re-audit: ${before} -> ${after}`);
    expect(after).toBeGreaterThanOrEqual(before);

    const client = await getInstallationClient(INSTALLATION_ID);
    const audit = async () => ({ score: after });

    const first = await runProof(
      client,
      {
        owner: 'Anuj7411',
        repo: 'af-test-site',
        prNumber: PR_NUMBER,
        siteUrl: SITE_URL,
        checkId: 'C2',
        beforeScore: before,
      },
      audit,
    );
    expect(first.stage).toBe('commented');

    // Re-run must UPDATE the sticky comment, not stack a second one.
    const second = await runProof(
      client,
      {
        owner: 'Anuj7411',
        repo: 'af-test-site',
        prNumber: PR_NUMBER,
        siteUrl: SITE_URL,
        checkId: 'C2',
        beforeScore: before,
      },
      audit,
    );
    expect(second.stage).toBe('commented');

    const comments = (await client.request(
      'GET /repos/{owner}/{repo}/issues/{issue_number}/comments',
      { owner: 'Anuj7411', repo: 'af-test-site', issue_number: PR_NUMBER, per_page: 100 },
    )) as { data: Array<{ body?: string }> };
    const ours = comments.data.filter((c) => (c.body ?? '').includes('answerfox:proof-of-fix'));
    // eslint-disable-next-line no-console
    console.log(`sticky comments on PR #${PR_NUMBER}: ${ours.length} (expect exactly 1)`);
    expect(ours).toHaveLength(1);
    expect(ours[0]?.body).toContain(`${before} → ${after}`);
  }, 120_000);
});
