import 'server-only';
import { getDb } from '@/lib/db/client';
import { annotations } from '@/lib/db/schema/annotations';
import { sites } from '@/lib/db/schema/sites';
import { and, eq } from 'drizzle-orm';

/**
 * All of a site's annotations as a `checkId -> body` map, scoped to the
 * owner. Used by the Findings page to show which checks carry a note
 * and to seed each row's editor. One round-trip; the map is tiny
 * (bounded by the number of checks that have a note).
 */
export async function getAnnotationsForSite(
  siteId: string,
  userId: string,
): Promise<Record<string, string>> {
  const rows = await getDb()
    .select({ checkId: annotations.checkId, body: annotations.body })
    .from(annotations)
    .innerJoin(sites, eq(sites.id, annotations.siteId))
    .where(and(eq(annotations.siteId, siteId), eq(sites.userId, userId)));

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.checkId] = row.body;
  }
  return map;
}
