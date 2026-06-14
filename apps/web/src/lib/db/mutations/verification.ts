import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { generateVerificationToken } from '@/lib/verification/verify-site-ownership';
import { and, eq } from 'drizzle-orm';

/**
 * Issue a fresh verification token for a site and put it in `pending`.
 *
 * Always overwrites any existing token, even if there's an in-flight
 * pending verification — letting the user "re-initiate" if they lost
 * their token. The 7-day window restarts on each initiation.
 *
 * Returns the fresh token so the caller can show it to the user.
 *
 * RLS on `sites` rejects writes where user_id != auth.uid(), so
 * passing `userId` from the authenticated session keeps everything
 * scoped to the owner.
 */
export async function initiateSiteVerification(input: {
  readonly siteId: string;
  readonly userId: string;
}): Promise<{ readonly token: string; readonly initiatedAt: Date }> {
  const token = generateVerificationToken();
  const initiatedAt = new Date();
  await getDb()
    .update(sites)
    .set({
      verificationToken: token,
      verificationStatusValue: 'pending',
      verificationInitiatedAt: initiatedAt,
      verifiedAt: null,
      verificationMethodValue: null,
    })
    .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)));
  return { token, initiatedAt };
}

/**
 * Mark a site as verified, recording which method matched and when.
 * Idempotent — calling twice on an already-verified row leaves the
 * earlier `verifiedAt` in place by not overwriting it.
 */
export async function markSiteVerified(input: {
  readonly siteId: string;
  readonly userId: string;
  readonly method: 'meta' | 'file' | 'dns';
  readonly verifiedAt: Date;
}): Promise<void> {
  await getDb()
    .update(sites)
    .set({
      verificationStatusValue: 'verified',
      verifiedAt: input.verifiedAt,
      verificationMethodValue: input.method,
    })
    .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)));
}

/**
 * Mark the most recent verification attempt as `failed`. The token
 * stays so the user can try again with the same one — they shouldn't
 * have to re-deploy a new token every time their DNS is slow.
 */
export async function markSiteVerificationFailed(input: {
  readonly siteId: string;
  readonly userId: string;
}): Promise<void> {
  await getDb()
    .update(sites)
    .set({ verificationStatusValue: 'failed' })
    .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)));
}
