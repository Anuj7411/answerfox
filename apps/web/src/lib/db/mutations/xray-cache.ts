import 'server-only';
import { getDb } from '@/lib/db/client';
import { xrayCache } from '@/lib/db/schema/xray-cache';
import type { XrayCacheEntry } from '@/lib/xray/run-xray';

/** Upsert the cached X-Ray entry for a URL (insert or refresh in place). */
export async function setXrayCache(url: string, entry: XrayCacheEntry): Promise<void> {
  await getDb()
    .insert(xrayCache)
    .values({ url, hash: entry.hash, comparison: entry.comparison })
    .onConflictDoUpdate({
      target: xrayCache.url,
      set: { hash: entry.hash, comparison: entry.comparison, updatedAt: new Date() },
    });
}
