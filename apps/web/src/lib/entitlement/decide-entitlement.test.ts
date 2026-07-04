import { describe, expect, it } from 'vitest';
import { decideFixEntitlement } from './decide-entitlement';

describe('decideFixEntitlement', () => {
  it('always allows public repos, regardless of plan or prior usage', () => {
    expect(
      decideFixEntitlement({ repoIsPrivate: false, plan: 'free', freeLoopConsumedAt: new Date() }),
    ).toEqual({ allowed: true, consumesFreeLoop: false });
    expect(
      decideFixEntitlement({ repoIsPrivate: false, plan: 'paid', freeLoopConsumedAt: null }),
    ).toEqual({ allowed: true, consumesFreeLoop: false });
  });

  it('always allows a paid private repo, and never re-consumes the free loop', () => {
    expect(
      decideFixEntitlement({ repoIsPrivate: true, plan: 'paid', freeLoopConsumedAt: null }),
    ).toEqual({ allowed: true, consumesFreeLoop: false });
  });

  it('allows exactly one free loop on a private repo', () => {
    expect(
      decideFixEntitlement({ repoIsPrivate: true, plan: 'free', freeLoopConsumedAt: null }),
    ).toEqual({ allowed: true, consumesFreeLoop: true });
  });

  it('blocks a private free repo once the loop is consumed', () => {
    const result = decideFixEntitlement({
      repoIsPrivate: true,
      plan: 'free',
      freeLoopConsumedAt: new Date('2026-01-01'),
    });
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toContain('Upgrade');
  });
});
