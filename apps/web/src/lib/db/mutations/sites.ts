import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { and, eq } from 'drizzle-orm';

export interface CreateSiteInput {
  readonly userId: string;
  readonly url: string;
  readonly name: string;
}

/**
 * Insert a new site row owned by the given user. Returns the row that
 * was inserted (with id + createdAt populated by the DB defaults).
 *
 * RLS on `sites` will reject inserts where `user_id != auth.uid()`,
 * but we're calling with the service role here (via the pooled
 * DATABASE_URL), so RLS is bypassed. Caller is responsible for
 * ensuring `input.userId` matches the authenticated session.
 */
export async function createSiteForUser(input: CreateSiteInput) {
  const [row] = await getDb()
    .insert(sites)
    .values({
      userId: input.userId,
      url: input.url,
      name: input.name,
    })
    .returning();
  if (row === undefined) {
    throw new Error('Insert returned no row');
  }
  return row;
}

/**
 * Rename a site the user owns. The userId guard is belt-and-braces
 * over the higher-layer ownership check in the server action.
 * Returns true if a row was updated, false if nothing matched.
 */
export async function renameSiteForUser(input: {
  userId: string;
  siteId: string;
  name: string;
}): Promise<boolean> {
  const rows = await getDb()
    .update(sites)
    .set({ name: input.name })
    .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)))
    .returning({ id: sites.id });
  return rows.length > 0;
}

/**
 * Delete a site (and all dependent rows via ON DELETE CASCADE on the
 * audits / findings / agent_visits / ai_fixes foreign keys).
 */
export async function deleteSiteForUser(input: {
  userId: string;
  siteId: string;
}): Promise<boolean> {
  const rows = await getDb()
    .delete(sites)
    .where(and(eq(sites.id, input.siteId), eq(sites.userId, input.userId)))
    .returning({ id: sites.id });
  return rows.length > 0;
}
