import { detectProofTrigger } from '@/lib/github/proof-events';
import { describe, expect, it } from 'vitest';
import { runProof } from './run-proof';
import { formatProofComment, proofCommentMarker } from './score-comment';

describe('formatProofComment', () => {
  it('formats an improvement with the delta and badge', () => {
    const body = formatProofComment({ before: 61, after: 74, checkId: 'C2' });
    expect(body).toContain(proofCommentMarker());
    expect(body).toContain('agent-readiness 61 → 74');
    expect(body).toContain('+13');
    expect(body).toContain('61→74');
    expect(body).toContain('C2');
  });

  it('is honest about a regression instead of hiding it', () => {
    const body = formatProofComment({ before: 74, after: 70, checkId: 'A1' });
    expect(body).toContain('74 → 70');
    expect(body).toContain('(-4)');
  });

  it('handles a held score', () => {
    expect(formatProofComment({ before: 80, after: 80, checkId: 'A3' })).toContain('held at 80');
  });
});

describe('detectProofTrigger', () => {
  const base = {
    action: 'closed',
    installation: { id: 777 },
    repository: { full_name: 'acme/docs' },
    pull_request: { number: 12, merged: true, head: { ref: 'answerfox/fix-c2-abc123' } },
  };

  it('detects a merged answerfox PR and recovers the check id', () => {
    expect(detectProofTrigger('pull_request', base)).toEqual({
      installationId: 777,
      repoFullName: 'acme/docs',
      prNumber: 12,
      branch: 'answerfox/fix-c2-abc123',
      checkId: 'C2',
    });
  });

  it('ignores closed-but-not-merged PRs', () => {
    expect(
      detectProofTrigger('pull_request', {
        ...base,
        pull_request: { ...base.pull_request, merged: false },
      }),
    ).toBeNull();
  });

  it('ignores non-answerfox branches and other events', () => {
    expect(
      detectProofTrigger('pull_request', {
        ...base,
        pull_request: { ...base.pull_request, head: { ref: 'feature/x' } },
      }),
    ).toBeNull();
    expect(detectProofTrigger('push', base)).toBeNull();
    expect(detectProofTrigger('pull_request', null)).toBeNull();
  });
});

describe('runProof', () => {
  function client(comments: Array<{ id: number; body?: string }> = []) {
    const calls: Array<{ route: string; params?: Record<string, unknown> }> = [];
    return {
      calls,
      request: async (route: string, params?: Record<string, unknown>) => {
        calls.push({ route, params });
        if (route === 'GET /repos/{owner}/{repo}/issues/{issue_number}/comments') {
          return { data: comments };
        }
        return { data: { id: 1 } };
      },
    };
  }

  const input = {
    owner: 'acme',
    repo: 'docs',
    prNumber: 12,
    siteUrl: 'https://acme.dev',
    checkId: 'C2',
    beforeScore: 61,
  };

  it('audits, then posts a new comment when none exists', async () => {
    const c = client();
    const result = await runProof(c, input, async () => ({ score: 74 }));
    expect(result).toEqual({ stage: 'commented', before: 61, after: 74 });
    const post = c.calls.find((x) => x.route.startsWith('POST'));
    expect(String(post?.params?.body)).toContain('61 → 74');
  });

  it('updates the existing sticky comment instead of stacking', async () => {
    const c = client([{ id: 55, body: `${proofCommentMarker()} old` }]);
    await runProof(c, input, async () => ({ score: 80 }));
    const patch = c.calls.find((x) => x.route.startsWith('PATCH'));
    expect(patch?.params?.comment_id).toBe(55);
    expect(c.calls.some((x) => x.route.startsWith('POST'))).toBe(false);
  });

  it('reports audit-failed without commenting when the re-audit throws', async () => {
    const c = client();
    const result = await runProof(c, input, async () => {
      throw new Error('site unreachable');
    });
    expect(result.stage).toBe('audit-failed');
    expect(c.calls.some((x) => x.route.startsWith('POST') || x.route.startsWith('PATCH'))).toBe(
      false,
    );
  });
});
