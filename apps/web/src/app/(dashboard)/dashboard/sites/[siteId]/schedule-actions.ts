'use server';

import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type AuditScheduleValue = 'off' | 'daily' | 'weekly';

const ALLOWED_VALUES: ReadonlySet<AuditScheduleValue> = new Set(['off', 'daily', 'weekly']);

/**
 * Update the continuous-audit schedule for a site the caller owns.
 *
 * - Validates input against the enum.
 * - Verifies the caller owns the site (belt-and-braces over Postgres RLS).
 * - Computes `next_scheduled_audit_at` based on the new cadence and the
 *   site's existing `lastAuditedAt` (or `createdAt` if never audited).
 *   The cron sweep in a follow-up PR will pick rows whose
 *   `next_scheduled_audit_at` has passed.
 */
export async function updateAuditSchedule(
  siteId: string,
  schedule: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ALLOWED_VALUES.has(schedule as AuditScheduleValue)) {
    return { ok: false, error: 'Invalid schedule value.' };
  }
  const value = schedule as AuditScheduleValue;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return { ok: false, error: 'Not signed in.' };
  }

  const db = getDb();
  const [site] = await db
    .select({ id: sites.id, lastAuditedAt: sites.lastAuditedAt, createdAt: sites.createdAt })
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, user.id)))
    .limit(1);

  if (site === undefined) {
    return { ok: false, error: 'Site not found.' };
  }

  const nextAt = computeNextScheduledAt(value, site.lastAuditedAt ?? site.createdAt);

  await db
    .update(sites)
    .set({ auditSchedule: value, nextScheduledAuditAt: nextAt })
    .where(eq(sites.id, siteId));

  revalidatePath(`/dashboard/sites/${siteId}`);
  return { ok: true };
}

function computeNextScheduledAt(schedule: AuditScheduleValue, anchor: Date): Date | null {
  if (schedule === 'off') return null;
  const ms = schedule === 'daily' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const base = anchor.getTime();
  const next = new Date(base + ms);
  // If the anchor was so long ago the next slot is already past, fire
  // on the next cron sweep (~1 minute from now).
  const now = Date.now();
  if (next.getTime() <= now) {
    return new Date(now + 60 * 1000);
  }
  return next;
}
