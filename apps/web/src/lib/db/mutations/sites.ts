import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';

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
