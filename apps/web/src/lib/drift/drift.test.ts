import { detectDriftTrigger } from '@/lib/github/drift-events';
import { describe, expect, it } from 'vitest';
import { type FixRequest, driftRequestId, runDrift } from './run-drift';

describe('detectDriftTrigger', () => {
  const installation = { id: 777 };
  const repository = { full_name: 'acme/docs', default_branch: 'main' };

  it('fires on a successful deployment_status', () => {
    expect(
      detectDriftTrigger('deployment_status', {
        installation,
        repository,
        deployment_status: { state: 'success' },
      }),
    ).toEqual({ installationId: 777, repoFullName: 'acme/docs', source: 'deployment' });
  });

  it('ignores failed/pending deployments', () => {
    for (const state of ['failure', 'pending', 'error']) {
      expect(
        detectDriftTrigger('deployment_status', {
          installation,
          repository,
          deployment_status: { state },
        }),
      ).toBeNull();
    }
  });

  it('fires on a push to the default branch only', () => {
    expect(
      detectDriftTrigger('push', { installation, repository, ref: 'refs/heads/main' }),
    ).toEqual({ installationId: 777, repoFullName: 'acme/docs', source: 'push' });
    expect(
      detectDriftTrigger('push', { installation, repository, ref: 'refs/heads/feature-x' }),
    ).toBeNull();
    expect(
      detectDriftTrigger('push', {
        installation,
        repository,
        ref: 'refs/heads/answerfox/fix-c2-abc',
      }),
    ).toBeNull();
  });

  it('ignores other events and malformed payloads', () => {
    expect(detectDriftTrigger('pull_request', { installation, repository })).toBeNull();
    expect(detectDriftTrigger('push', null)).toBeNull();
    expect(detectDriftTrigger('push', { repository, ref: 'refs/heads/main' })).toBeNull();
  });
});

describe('runDrift', () => {
  const input = {
    repoFullName: 'acme/docs',
    siteUrl: 'https://acme.dev',
    priorScore: 74,
    priorFailedCheckIds: ['D1', 'D2'],
    source: 'deployment' as const,
  };

  it('detects new failures and enqueues one fix per regression', async () => {
    const enqueued: FixRequest[] = [];
    const result = await runDrift(
      input,
      async () => ({ score: 58, failedCheckIds: ['D1', 'D2', 'C2', 'A1'] }),
      async (r) => {
        enqueued.push(r);
      },
    );
    expect(result).toEqual({
      stage: 'drift-detected',
      before: 74,
      after: 58,
      newFailures: ['C2', 'A1'],
      enqueued: 2,
    });
    // Already-failing checks (D1, D2) are NOT re-enqueued.
    expect(enqueued.map((r) => r.checkId)).toEqual(['C2', 'A1']);
    // Deterministic requestIds so re-checks converge on the same PR.
    expect(enqueued[0]?.requestId).toBe(driftRequestId('acme/docs', 'C2'));
  });

  it('reports no-drift when failures are unchanged or improved', async () => {
    const result = await runDrift(
      input,
      async () => ({ score: 80, failedCheckIds: ['D1'] }),
      async () => {
        throw new Error('must not enqueue');
      },
    );
    expect(result).toEqual({ stage: 'no-drift', before: 74, after: 80 });
  });

  it('returns audit-failed cleanly when the site is unreachable', async () => {
    const result = await runDrift(
      input,
      async () => {
        throw new Error('ECONNREFUSED');
      },
      async () => {},
    );
    expect(result.stage).toBe('audit-failed');
  });

  it('driftRequestId is deterministic and branch-safe', () => {
    expect(driftRequestId('acme/docs', 'C2')).toBe(driftRequestId('acme/docs', 'C2'));
    expect(driftRequestId('acme/docs', 'C2')).toMatch(/^[a-zA-Z0-9]+$/);
  });
});
