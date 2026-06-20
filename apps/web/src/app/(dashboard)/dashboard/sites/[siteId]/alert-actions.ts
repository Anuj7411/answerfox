'use server';

import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Set or clear the score-drop alert threshold for a site the caller
 * owns. Pass a number 0..100 to arm, or `null` to disarm. Invalid
 * inputs are rejected with a stable error string the form can show.
 *
 * No threshold change ever fires an alert directly — the next audit
 * does, via `processScoreDropAlert`.
 */
export async function updateAlertThreshold(
  siteId: string,
  threshold: number | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (threshold !== null) {
    if (!Number.isInteger(threshold) || threshold < 0 || threshold > 100) {
      return { ok: false, error: 'Threshold must be a whole number between 0 and 100.' };
    }
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const db = getDb();
  const [owned] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
    .limit(1);
  if (owned === undefined) {
    return { ok: false, error: 'Site not found.' };
  }

  await db.update(sites).set({ alertThreshold: threshold }).where(eq(sites.id, siteId));
  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: true };
}
