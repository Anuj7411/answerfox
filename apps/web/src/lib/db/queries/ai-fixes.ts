import 'server-only';
import { getDb } from '@/lib/db/client';
import { aiFixes } from '@/lib/db/schema/ai-fixes';
import { audits } from '@/lib/db/schema/audits';
import { findings } from '@/lib/db/schema/findings';
import { and, count, desc, eq, gte } from 'drizzle-orm';

export const MONTHLY_AI_FIX_QUOTA_PRO = 90;

/**
 * Count succeeded AI fixes for the user since the start of the
 * current calendar month UTC. Used to enforce the Pro tier 90/month
 * quota and to render the "X of 90 used this month" badge.
 *
 * Failed attempts are excluded so users aren't penalised for our
 * errors (rate limits, transient Gemini outages, invalid JSON).
 */
export async function listMonthlyAiFixUsage(userId: string): Promise<{
  readonly used: number;
  readonly remaining: number;
  readonly quota: number;
  readonly resetAt: Date;
}> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));

  const [row] = await getDb()
    .select({ used: count() })
    .from(aiFixes)
    .where(
      and(
        eq(aiFixes.userId, userId),
        eq(aiFixes.status, 'succeeded'),
        gte(aiFixes.createdAt, monthStart),
      ),
    );

  const used = row?.used ?? 0;
  return {
    used,
    remaining: Math.max(0, MONTHLY_AI_FIX_QUOTA_PRO - used),
    quota: MONTHLY_AI_FIX_QUOTA_PRO,
    resetAt: monthEnd,
  };
}

/**
 * Latest succeeded fix for a finding, or null. The UI renders the
 * persisted output instead of forcing the user to regenerate every
 * time they revisit the page.
 */
export async function getLatestSuccessfulAiFixForFinding(input: {
  readonly findingId: string;
  readonly userId: string;
}): Promise<{
  readonly id: string;
  readonly output: string;
  readonly createdAt: Date;
  readonly model: string;
} | null> {
  const [row] = await getDb()
    .select({
      id: aiFixes.id,
      output: aiFixes.output,
      createdAt: aiFixes.createdAt,
      model: aiFixes.model,
    })
    .from(aiFixes)
    .where(
      and(
        eq(aiFixes.findingId, input.findingId),
        eq(aiFixes.userId, input.userId),
        eq(aiFixes.status, 'succeeded'),
      ),
    )
    .orderBy(desc(aiFixes.createdAt))
    .limit(1);
  if (row === undefined || row.output === null) return null;
  return {
    id: row.id,
    output: row.output,
    createdAt: row.createdAt,
    model: row.model,
  };
}

export interface SiteAiFixRow {
  readonly id: string;
  readonly status: 'pending' | 'succeeded' | 'failed';
  readonly model: string;
  readonly createdAt: Date;
  readonly errorMessage: string | null;
  readonly checkId: string;
  readonly category: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly evidence: string | null;
  readonly findingId: string;
}

/**
 * All AI-fix generations for one site, newest first. Joins through
 * `findings → audits` to scope by site, and filters on `ai_fixes.user_id`
 * so a caller only ever sees fixes they generated (belt-and-braces over
 * Postgres RLS — the ownership check on the write side is already gated
 * by `generateAIFixAction`).
 *
 * There is no PR-tracking table today; the fix-PR loop's actual PR
 * numbers/URLs are only known to the GitHub webhook side. So this is
 * the honest timeline of what the AI produced (or tried to produce)
 * — the raw material every PR is generated from.
 */
export async function listAiFixesForSite(input: {
  readonly siteId: string;
  readonly userId: string;
  readonly limit?: number;
}): Promise<ReadonlyArray<SiteAiFixRow>> {
  const limit = input.limit ?? 50;
  const rows = await getDb()
    .select({
      id: aiFixes.id,
      status: aiFixes.status,
      model: aiFixes.model,
      createdAt: aiFixes.createdAt,
      errorMessage: aiFixes.errorMessage,
      checkId: findings.checkId,
      category: findings.category,
      severity: findings.severity,
      evidence: findings.evidence,
      findingId: findings.id,
    })
    .from(aiFixes)
    .innerJoin(findings, eq(findings.id, aiFixes.findingId))
    .innerJoin(audits, eq(audits.id, findings.auditId))
    .where(and(eq(audits.siteId, input.siteId), eq(aiFixes.userId, input.userId)))
    .orderBy(desc(aiFixes.createdAt))
    .limit(limit);
  return rows;
}
