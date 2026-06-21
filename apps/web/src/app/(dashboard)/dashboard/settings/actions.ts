'use server';

import { updateProfileName } from '@/lib/db/mutations/profile';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { revalidatePath } from 'next/cache';

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
