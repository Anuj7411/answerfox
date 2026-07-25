'use server';

import {
  deleteProfileForUser,
  setWeeklyDigestOptIn,
  updateProfileName,
} from '@/lib/db/mutations/profile';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const NAME_MAX_LEN = 80;

/**
 * Update the caller's display name. An empty string clears the name
 * (null in DB) so the dashboard falls back to email everywhere it
 * shows the name.
 */
export async function updateDisplayName(
  rawName: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = rawName.trim();
  if (trimmed.length > NAME_MAX_LEN) {
    return { ok: false, error: `Name must be under ${NAME_MAX_LEN} characters.` };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const updated = await updateProfileName({
    userId: user.id,
    name: trimmed.length === 0 ? null : trimmed,
  });
  if (!updated) {
    return { ok: false, error: 'Profile not found.' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard');
  return { ok: true };
}

/**
 * Turn the weekly readiness digest email on or off for the caller.
 */
export async function updateWeeklyDigestOptIn(
  optIn: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const updated = await setWeeklyDigestOptIn({ userId: user.id, optIn });
  if (!updated) {
    return { ok: false, error: 'Profile not found.' };
  }

  revalidatePath('/dashboard/settings');
  return { ok: true };
}

/**
 * Permanently delete the caller's account. Removes the profile row,
 * which cascades to sites, audits, findings, ai_fixes, and agent
 * visits. Signs out the Supabase session and redirects to /.
 *
 * On success this function never returns (redirect throws). The
 * return type covers only the failure paths.
 */
export async function deleteAccountAction(): Promise<{ ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const deleted = await deleteProfileForUser(user.id);
  if (!deleted) {
    return { ok: false, error: 'Account not found.' };
  }

  await supabase.auth.signOut();
  redirect('/');
}
