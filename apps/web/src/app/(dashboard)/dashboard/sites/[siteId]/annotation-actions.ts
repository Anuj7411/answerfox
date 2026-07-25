'use server';

import { normalizeAnnotationBody } from '@/lib/annotations/normalize';
import { deleteAnnotation, upsertAnnotation } from '@/lib/db/mutations/annotations';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { revalidatePath } from 'next/cache';

export type SaveAnnotationState =
  | { readonly status: 'saved'; readonly hasNote: boolean }
  | { readonly status: 'error'; readonly error: string };

/**
 * Save (or clear) the owner's note for one check on one site.
 *
 * 1. Require an authenticated user.
 * 2. Verify the site belongs to them (RLS also enforces, but explicit).
 * 3. Normalize: a blank body deletes the note, otherwise upsert.
 *
 * Returns a discriminated state for `useActionState` so the row can show
 * a saved/cleared confirmation or the error inline.
 */
export async function saveAnnotationAction(input: {
  siteId: string;
  checkId: string;
  body: string;
}): Promise<SaveAnnotationState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'error', error: 'Sign in to save a note.' };

  const site = await getSiteForUser(input.siteId, user.id);
  if (site === null) return { status: 'error', error: 'Site not found or not yours.' };

  const checkId = input.checkId.trim();
  if (checkId.length === 0) return { status: 'error', error: 'Missing check.' };

  const normalized = normalizeAnnotationBody(input.body);
  if (!normalized.ok) return { status: 'error', error: normalized.error };

  if (normalized.action === 'delete') {
    await deleteAnnotation({ siteId: input.siteId, checkId });
    revalidatePath(`/dashboard/sites/${input.siteId}/findings`);
    return { status: 'saved', hasNote: false };
  }

  await upsertAnnotation({
    siteId: input.siteId,
    userId: user.id,
    checkId,
    body: normalized.body,
  });
  revalidatePath(`/dashboard/sites/${input.siteId}/findings`);
  return { status: 'saved', hasNote: true };
}
