'use server';

import {
  initiateSiteVerification,
  markSiteVerificationFailed,
  markSiteVerified,
} from '@/lib/db/mutations/verification';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { verifySiteOwnership } from '@/lib/verification/verify-site-ownership';
import { revalidatePath } from 'next/cache';

/**
 * Returned state for both actions. The dashboard renders this to give
 * the user concrete feedback ("we tried these methods, here's what we
 * saw") rather than a generic toast.
 */
export interface VerificationActionState {
  readonly status: 'idle' | 'pending' | 'verified' | 'failed';
  readonly token?: string;
  readonly method?: 'meta' | 'file' | 'dns';
  readonly attempts?: ReadonlyArray<{
    readonly method: 'meta' | 'file' | 'dns';
    readonly outcome: 'not-found' | 'error';
    readonly detail: string;
  }>;
  readonly error?: string;
}

/**
 * Issue a fresh token and put the site into `pending`. The page revalidates
 * so the verification panel re-renders with the new token + instructions.
 */
export async function initiateVerificationAction(siteId: string): Promise<VerificationActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'idle', error: 'Sign in to verify a site.' };

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) return { status: 'idle', error: 'Site not found.' };

  const { token } = await initiateSiteVerification({ siteId, userId: user.id });
  revalidatePath(`/dashboard/sites/${siteId}`);
  return { status: 'pending', token };
}

/**
 * Attempt all three methods against the site URL and update the row.
 * Returns the user-facing state for `useActionState` to render.
 */
export async function checkVerificationAction(siteId: string): Promise<VerificationActionState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'idle', error: 'Sign in to verify a site.' };

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) return { status: 'idle', error: 'Site not found.' };

  const token = site.verificationToken;
  if (token === null || site.verificationStatusValue === 'unverified') {
    return {
      status: 'idle',
      error: 'No verification in progress. Initiate one first.',
    };
  }

  const result = await verifySiteOwnership(site.url, token);
  if (result.ok) {
    await markSiteVerified({
      siteId,
      userId: user.id,
      method: result.method,
      verifiedAt: new Date(),
    });
    revalidatePath(`/dashboard/sites/${siteId}`);
    revalidatePath('/dashboard/sites');
    return { status: 'verified', method: result.method };
  }

  await markSiteVerificationFailed({ siteId, userId: user.id });
  revalidatePath(`/dashboard/sites/${siteId}`);
  return { status: 'failed', attempts: result.attempts };
}
