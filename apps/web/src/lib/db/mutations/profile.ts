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
