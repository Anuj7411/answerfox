import 'server-only';
import { getDb } from '@/lib/db/client';
import { annotations } from '@/lib/db/schema/annotations';
import { and, eq } from 'drizzle-orm';

/**
 * Create or replace the note for one (site, check). Relies on the
 * UNIQUE (site_id, check_id) constraint to upsert: on conflict we
 * overwrite the body and bump updatedAt. Ownership is enforced by the
 * caller (the server action verifies the site belongs to the user).
 */
export async function upsertAnnotation(input: {
  siteId: string;
  userId: string;
  checkId: string;
  body: string;
}): Promise<void> {
  await getDb()
    .insert(annotations)
    .values({
      siteId: input.siteId,
      userId: input.userId,
      checkId: input.checkId,
      body: input.body,
    })
    .onConflictDoUpdate({
      target: [annotations.siteId, annotations.checkId],
      set: { body: input.body, updatedAt: new Date() },
    });
}

/**
 * Remove the note for one (site, check). No-op if none exists.
 */
export async function deleteAnnotation(input: {
  siteId: string;
  checkId: string;
}): Promise<void> {
  await getDb()
    .delete(annotations)
    .where(and(eq(annotations.siteId, input.siteId), eq(annotations.checkId, input.checkId)));
}
