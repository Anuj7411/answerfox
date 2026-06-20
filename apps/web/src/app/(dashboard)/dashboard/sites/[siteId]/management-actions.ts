'use server';

import { deleteSiteForUser, renameSiteForUser } from '@/lib/db/mutations/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const NAME_MIN_LEN = 1;
const NAME_MAX_LEN = 120;

/**
 * Rename a site the caller owns. Trims whitespace and enforces a
 * 120-char ceiling so the sidebar layout doesn't explode on huge names.
 */
export async function renameSite(
  siteId: string,
  rawName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = rawName.trim();
  if (name.length < NAME_MIN_LEN) {
    return { ok: false, error: 'Name cannot be empty.' };
  }
  if (name.length > NAME_MAX_LEN) {
    return { ok: false, error: `Name must be under ${NAME_MAX_LEN} characters.` };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const updated = await renameSiteForUser({ userId: user.id, siteId, name });
  if (!updated) {
    return { ok: false, error: 'Site not found.' };
  }

  revalidatePath(`/dashboard/sites/${siteId}`);
  revalidatePath('/dashboard/sites');
  revalidatePath('/dashboard');
  return { ok: true };
}

/**
 * Delete a site the caller owns. Confirmation is enforced at the UI
 * layer via a typed-name double-check; server enforces ownership.
 * On success, sends the user back to /dashboard/sites — there's
 * nothing useful left at /dashboard/sites/<deletedId>.
 */
export async function deleteSite(siteId: string): Promise<{ ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const deleted = await deleteSiteForUser({ userId: user.id, siteId });
  if (!deleted) {
    return { ok: false, error: 'Site not found.' };
  }

  revalidatePath('/dashboard/sites');
  revalidatePath('/dashboard');
  redirect('/dashboard/sites');
}
