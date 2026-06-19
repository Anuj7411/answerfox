'use server';

import { processScoreDropAlert } from '@/lib/audit/process-score-drop';
import { createAuditWithFindings } from '@/lib/db/mutations/audits';
import { createSiteForUser } from '@/lib/db/mutations/sites';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { audit } from '@answerfox/audit';
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

/**
 * Form state returned by runAuditAction. `errors.general` carries a
 * human-readable failure reason (fetch timeout, parse error, DB
 * write error). Empty when the audit succeeded — by then we've
 * already redirected to the detail page.
 */
export interface RunAuditFormState {
  readonly errors?: {
    readonly general?: string;
  };
}

/**
 * Server Action: run a fresh audit for one of the user's sites,
 * persist the report + findings, redirect to the audit detail page.
 *
 * Synchronous on purpose for Day 8 MVP. A real audit takes 2-8s
 * which is on the edge of acceptable for an inline button click;
 * Day 10+ moves this to a background queue with optimistic UI.
 *
 * Ownership is checked twice: once before the expensive HTTP fetch
 * to avoid running an audit for someone else's site, once implicitly
 * via the createAuditWithFindings transaction (siteId is trusted at
 * that point).
 */
export async function runAuditAction(
  _prev: RunAuditFormState,
  formData: FormData,
): Promise<RunAuditFormState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    return { errors: { general: 'You must be signed in to run an audit.' } };
  }

  const siteId = (formData.get('siteId') ?? '').toString();
  if (siteId.length === 0) {
    return { errors: { general: 'Missing site id.' } };
  }

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) {
    return { errors: { general: 'Site not found.' } };
  }

  try {
    const report = await audit(site.url);
    const newAudit = await createAuditWithFindings({ siteId: site.id, report });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    await processScoreDropAlert({
      siteId: site.id,
      currentAuditId: newAudit.id,
      currentScore: newAudit.score,
      siteDetailUrl: `${appUrl}/dashboard/sites/${site.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Audit failed.';
    return { errors: { general: message } };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/sites');
  revalidatePath(`/dashboard/sites/${site.id}`);
  redirect(`/dashboard/sites/${site.id}`);
}
