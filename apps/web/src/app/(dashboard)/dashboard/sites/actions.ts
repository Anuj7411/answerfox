'use server';

import { createSiteForUser } from '@/lib/db/mutations/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { parseAbsoluteUrl } from '@answerfox/core';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Form state returned by addSiteAction. Lets the client surface
 * field-level errors without throwing. Empty string when no error.
 */
export interface AddSiteFormState {
  readonly errors?: {
    readonly url?: string;
    readonly name?: string;
    readonly general?: string;
  };
}

/**
 * Server Action: validate input, insert a `sites` row for the
 * authenticated user, redirect to /dashboard/sites.
 *
 * URL validation goes through @answerfox/core's parseAbsoluteUrl,
 * which enforces absolute http/https URLs (same rule the CLI uses).
 * Keeps the SaaS and the OSS in lockstep on what "a valid URL" means.
 */
export async function addSiteAction(
  _prev: AddSiteFormState,
  formData: FormData,
): Promise<AddSiteFormState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return { errors: { general: 'You must be signed in to add a site.' } };
  }

  const rawUrl = (formData.get('url') ?? '').toString().trim();
  const rawName = (formData.get('name') ?? '').toString().trim();

  const errors: { url?: string; name?: string } = {};
  if (rawUrl.length === 0) {
    errors.url = 'URL is required.';
  } else {
    try {
      parseAbsoluteUrl(rawUrl);
    } catch {
      errors.url = 'Enter a valid absolute URL (e.g. https://your-site.com).';
    }
  }
  if (rawName.length === 0) {
    errors.name = 'Name is required.';
  } else if (rawName.length > 80) {
    errors.name = 'Name must be 80 characters or fewer.';
  }

  if (errors.url !== undefined || errors.name !== undefined) {
    return { errors };
  }

  try {
    await createSiteForUser({ userId: user.id, url: rawUrl, name: rawName });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add site.';
    return { errors: { general: message } };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/sites');
  redirect('/dashboard/sites');
}
