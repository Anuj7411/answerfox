import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { and, desc, eq } from 'drizzle-orm';

/**
 * List sites owned by a given user. Newest first.
 *
 * `server-only` import at the top throws at build time if a client
 * component ever tries to import this, which would leak the DB
 * connection string into the browser bundle.
 *
 * RLS in Postgres already restricts each user to their own rows,
 * but we still filter by user_id here so a service-role caller
 * (Edge Function running audit jobs) gets the same result shape
 * a user-scoped caller would.
 */
export async function listSitesForUser(userId: string) {
  return getDb()
    .select()
    .from(sites)
    .where(eq(sites.userId, userId))
    .orderBy(desc(sites.createdAt));
}

/**
 * Fetch one site by id, scoped to the user. Returns `null` if the
 * site doesn't exist or belongs to someone else. Used by the
 * detail page + the audit Server Action to verify ownership
 * before doing expensive work (HTTP fetch + DB writes).
 */
export async function getSiteForUser(siteId: string, userId: string) {
  const [row] = await getDb()
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), eq(sites.userId, userId)))
    .limit(1);
  return row ?? null;
}
