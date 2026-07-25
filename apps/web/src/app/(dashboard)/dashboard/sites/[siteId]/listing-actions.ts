'use server';

import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Opt a site into (or out of) the public leaderboard.
 *
 * Guardrails:
 * - Requires an authenticated owner of the site.
 * - Listing a site publicly (isPublic = true) requires the site to be
 *   verified — you can't put a domain you haven't proven you control on
 *   a public board. Un-listing is always allowed.
 */
export async function updateSitePublicListing(
  siteId: string,
  isPublic: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const db = getDb();
  const [owned] = await db
    .select({ id: sites.id, verification: sites.verificationStatusValue })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
    .limit(1);
  if (owned === undefined) {
    return { ok: false, error: 'Site not found.' };
  }

  if (isPublic && owned.verification !== 'verified') {
    return { ok: false, error: 'Verify ownership before listing this site publicly.' };
  }

  await db.update(sites).set({ isPublic }).where(eq(sites.id, siteId));
  revalidatePath(`/dashboard/sites/${siteId}/settings`);
  revalidatePath('/leaderboard');
  return { ok: true };
}
