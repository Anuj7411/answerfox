import 'server-only';
import { getDb } from '@/lib/db/client';
import { xrayCache } from '@/lib/db/schema/xray-cache';
import type { XrayComparison } from '@/lib/xray/compare';
import type { XrayCacheEntry } from '@/lib/xray/run-xray';
import { eq } from 'drizzle-orm';

/** The cached X-Ray entry for a URL, or null on a miss. */
export async function getXrayCache(url: string): Promise<XrayCacheEntry | null> {
  const [row] = await getDb()
    .select({ hash: xrayCache.hash, comparison: xrayCache.comparison })
    .from(xrayCache)
    .where(eq(xrayCache.url, url))
    .limit(1);
  if (row === undefined) return null;
  return { hash: row.hash, comparison: row.comparison as XrayComparison };
}
