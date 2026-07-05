import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { eq } from 'drizzle-orm';

/**
 * Find the site already linked to a repo, if any. Onboarding uses this
 * to stay idempotent — re-running the flow for a repo that's already
 * linked returns the existing site instead of creating a duplicate
 * (two sites per repo would double-count entitlement and confuse
 * Proof-of-Fix / Drift Guard, which both resolve "the" site by repo).
 */
export async function findSiteByRepo(repoFullName: string) {
  const [row] = await getDb()
    .select()
    .from(sites)
    .where(eq(sites.repoFullName, repoFullName))
    .limit(1);
  return row ?? null;
}
