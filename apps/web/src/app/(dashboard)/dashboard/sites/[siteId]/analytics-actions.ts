'use server';

import { randomBytes } from 'node:crypto';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Mint a fresh ingest token for a site the caller owns. Overwrites
 * any existing token — there is intentionally no "view current token"
 * action, because tokens are sensitive and copying-on-mint is the
 * only safe disclosure.
 *
 * Returns the new token in plaintext so the caller's UI can show it
 * once for the user to paste into their integration. We never expose
 * it through any other code path.
 */
export async function rotateIngestToken(
  siteId: string,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
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

  const token = `afi_${randomBytes(24).toString('base64url')}`;
  await db.update(sites).set({ ingestToken: token }).where(eq(sites.id, siteId));

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: true, token };
}
