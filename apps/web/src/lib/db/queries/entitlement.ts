import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { eq } from 'drizzle-orm';

export interface SiteEntitlementState {
  readonly siteId: string;
  readonly plan: 'free' | 'paid';
  readonly freeLoopConsumedAt: Date | null;
}

/** Read the billing state of the site linked to a repo, or null if unlinked. */
export async function getSiteEntitlementState(
  repoFullName: string,
): Promise<SiteEntitlementState | null> {
  const [row] = await getDb()
    .select({ siteId: sites.id, plan: sites.plan, freeLoopConsumedAt: sites.freeLoopConsumedAt })
    .from(sites)
    .where(eq(sites.repoFullName, repoFullName))
    .limit(1);
  return row ?? null;
}
