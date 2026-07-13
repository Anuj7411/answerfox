import 'server-only';
import { getDb } from '@/lib/db/client';
import { sites } from '@/lib/db/schema/sites';
import { and, eq, isNull } from 'drizzle-orm';

/**
 * Atomically mark a site's one free loop as used. The `WHERE ... IS
 * NULL` guard makes this a compare-and-set: if two requests race to
 * consume the same site's free loop, only the first UPDATE affects a
 * row — the second returns false, so its caller re-decides as blocked
 * rather than granting a second free PR.
 */
export async function consumeFreeLoopIfAvailable(siteId: string): Promise<boolean> {
  const rows = await getDb()
    .update(sites)
    .set({ freeLoopConsumedAt: new Date() })
    .where(and(eq(sites.id, siteId), isNull(sites.freeLoopConsumedAt)))
    .returning({ id: sites.id });
  return rows.length > 0;
}

/**
 * Set a site to the paid plan. Called by the Polar `order.paid` webhook
 * once the `site_id` round-trips through the checkout metadata.
 */
export async function markSitePaid(siteId: string): Promise<boolean> {
  const rows = await getDb()
    .update(sites)
    .set({ plan: 'paid' })
    .where(eq(sites.id, siteId))
    .returning({ id: sites.id });
  return rows.length > 0;
}

/**
 * Return a site to the free plan. Called by the Polar
 * `subscription.canceled` / `subscription.revoked` webhooks so a lapsed
 * subscription re-gates the fix loop.
 */
export async function markSiteFree(siteId: string): Promise<boolean> {
  const rows = await getDb()
    .update(sites)
    .set({ plan: 'free' })
    .where(eq(sites.id, siteId))
    .returning({ id: sites.id });
  return rows.length > 0;
}
