import 'server-only';
import { getDb } from '@/lib/db/client';
import { agentVisits } from '@/lib/db/schema/agent-visits';
import { audits } from '@/lib/db/schema/audits';
import { profiles } from '@/lib/db/schema/profiles';
import { sites } from '@/lib/db/schema/sites';
import { eq, sql } from 'drizzle-orm';

export interface ProfileWithStats {
  readonly id: string;
  readonly email: string;
  readonly name: string | null;
  readonly createdAt: Date;
  readonly siteCount: number;
  readonly auditCount: number;
  readonly visitCount: number;
}

/**
 * Profile + headline usage stats for the account settings page.
 * Returns null if the profile row doesn't exist (lazy creation hasn't
 * fired yet — the settings page handles that by redirecting back to
 * /dashboard, where the trigger will create it).
 */
export async function getProfileWithStats(userId: string): Promise<ProfileWithStats | null> {
  const db = getDb();

  const [profile] = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      name: profiles.name,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  if (profile === undefined) return null;

  const [siteCountRow, auditCountRow, visitCountRow] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(sites).where(eq(sites.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(audits)
      .innerJoin(sites, eq(sites.id, audits.siteId))
      .where(eq(sites.userId, userId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(agentVisits)
      .innerJoin(sites, eq(sites.id, agentVisits.siteId))
      .where(eq(sites.userId, userId)),
  ]);

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    createdAt: profile.createdAt,
    siteCount: siteCountRow[0]?.count ?? 0,
    auditCount: auditCountRow[0]?.count ?? 0,
    visitCount: visitCountRow[0]?.count ?? 0,
  };
}
