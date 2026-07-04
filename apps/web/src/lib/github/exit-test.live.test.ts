import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';

// Live Week-2 exit test: opens REAL PRs on Anuj7411/af-test-site using
// the installed GitHub App + real Gemini. Skipped unless RUN_EXIT_TEST=1
// so it never runs in CI or a normal `pnpm test`.
const RUN = process.env.RUN_EXIT_TEST === '1';
const PEM_PATH = 'C:/Users/ojhaa/Downloads/answerfox.2026-07-04.private-key.pem';
const INSTALLATION_ID = 144414142;

const FINDINGS = [
  {
    checkId: 'A1',
    description: 'The page has no <title> element, so AI crawlers have no headline for it.',
    fixRecommendation: 'Add a descriptive <title> in <head> (30-60 chars).',
  },
  {
    checkId: 'A3',
    description: 'No <meta name="description">, so crawlers have no summary of the page.',
    fixRecommendation: 'Add a <meta name="description"> (120-160 chars) in <head>.',
  },
  {
    checkId: 'C2',
    description: 'No Organization JSON-LD, so AI cannot identify who owns this site.',
    fixRecommendation:
      'Add a schema.org Organization <script type="application/ld+json"> in <head>.',
  },
];

describe.skipIf(!RUN)('Week-2 exit test (live PRs on af-test-site)', () => {
  beforeAll(() => {
    process.env.GITHUB_APP_ID = '4216145';
    process.env.GITHUB_APP_PRIVATE_KEY = readFileSync(PEM_PATH, 'utf8').trim();
  });

  it('opens a clean single-purpose PR for each finding', async () => {
    const { getInstallationClient } = await import('./app-client');
    const { runFixPipeline } = await import('./run-fix-pipeline');
    const client = await getInstallationClient(INSTALLATION_ID);

    const opened: Array<{ checkId: string; prNumber: number; prUrl: string; branch: string }> = [];
    for (const f of FINDINGS) {
      const result = await runFixPipeline(client, {
        owner: 'Anuj7411',
        repo: 'af-test-site',
        targetPath: 'index.html',
        checkId: f.checkId,
        description: f.description,
        fixRecommendation: f.fixRecommendation,
        evidence: null,
        siteUrl: 'https://af-test-site.example/',
        requestId: `exit-${f.checkId}-${INSTALLATION_ID}`,
      });
      // eslint-disable-next-line no-console
      console.log(`\n[${f.checkId}] stage=${result.stage}`, JSON.stringify(result));
      expect(result.stage).toBe('pr-opened');
      if (result.stage === 'pr-opened') {
        opened.push({ checkId: f.checkId, ...result });
      }
    }

    // Verify each PR on GitHub: open, exactly one changed file, mergeable.
    for (const pr of opened) {
      const detail = (await client.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: 'Anuj7411',
        repo: 'af-test-site',
        pull_number: pr.prNumber,
      })) as { data: { state: string; changed_files: number; title: string } };
      const files = (await client.request('GET /repos/{owner}/{repo}/pulls/{pull_number}/files', {
        owner: 'Anuj7411',
        repo: 'af-test-site',
        pull_number: pr.prNumber,
      })) as { data: Array<{ filename: string }> };
      // eslint-disable-next-line no-console
      console.log(
        `  PR #${pr.prNumber} ${pr.prUrl} state=${detail.data.state} files=${detail.data.changed_files} (${files.data.map((x) => x.filename).join(',')})`,
      );
      expect(detail.data.state).toBe('open');
      expect(detail.data.changed_files).toBe(1);
      expect(files.data[0]?.filename).toBe('index.html');
    }

    // eslint-disable-next-line no-console
    console.log(`\n=== EXIT TEST: ${opened.length} clean PRs opened ===`);
    expect(opened.length).toBe(FINDINGS.length);
  }, 120_000);
});
