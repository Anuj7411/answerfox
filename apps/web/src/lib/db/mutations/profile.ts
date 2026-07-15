import 'server-only';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema/profiles';
import { eq } from 'drizzle-orm';

/**
 * Update the display name on a user's profile. Returns true if a row
 * was updated, false if no profile exists for the user yet.
 */
export async function updateProfileName(input: {
  userId: string;
  name: string | null;
}): Promise<boolean> {
  const rows = await getDb()
    .update(profiles)
    .set({ name: input.name, updatedAt: new Date() })
    .where(eq(profiles.id, input.userId))
    .returning({ id: profiles.id });
  return rows.length > 0;
}

/**
 * Delete a user's profile row. Sites cascade via ON DELETE CASCADE,
 * which in turn cascades audits, findings, ai_fixes, and agent_visits.
 */
export async function deleteProfileForUser(userId: string): Promise<boolean> {
  const rows = await getDb()
    .delete(profiles)
    .where(eq(profiles.id, userId))
    .returning({ id: profiles.id });
  return rows.length > 0;
}
