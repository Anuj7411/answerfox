/**
 * The §3 promise as a pure decision, no I/O: "the first fix is free,
 * staying fixed is $9." Public repos never need entitlement — being
 * readable by AI crawlers is a public good, and the badge loop (§7)
 * depends on public-repo PRs being unconditionally free. Private repos
 * get exactly one loop, then need `plan === 'paid'`.
 */

export interface EntitlementInput {
  readonly repoIsPrivate: boolean;
  readonly plan: 'free' | 'paid';
  readonly freeLoopConsumedAt: Date | null;
}

export type EntitlementDecision =
  | { readonly allowed: true; readonly consumesFreeLoop: boolean }
  | { readonly allowed: false; readonly reason: string };

export function decideFixEntitlement(input: EntitlementInput): EntitlementDecision {
  if (!input.repoIsPrivate) {
    return { allowed: true, consumesFreeLoop: false };
  }
  if (input.plan === 'paid') {
    return { allowed: true, consumesFreeLoop: false };
  }
  if (input.freeLoopConsumedAt === null) {
    return { allowed: true, consumesFreeLoop: true };
  }
  return {
    allowed: false,
    reason:
      'Free loop already used on this private repo. Upgrade at $9/mo or $90/yr to keep fix-PRs and Drift Guard active.',
  };
}
