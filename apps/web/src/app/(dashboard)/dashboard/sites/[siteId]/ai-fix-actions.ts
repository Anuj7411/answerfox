'use server';

import { type AiFixArtifact, AiFixError, generateAiFix } from '@/lib/ai/generate-fix';
import { getDb } from '@/lib/db/client';
import { createAiFixFailure, createAiFixSuccess } from '@/lib/db/mutations/ai-fixes';
import { MONTHLY_AI_FIX_QUOTA_PRO, listMonthlyAiFixUsage } from '@/lib/db/queries/ai-fixes';
import { audits } from '@/lib/db/schema/audits';
import { findings } from '@/lib/db/schema/findings';
import { sites } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Returned to `useActionState` on the panel that triggered the
 * generation. Discriminated on `status` so the UI can render the
 * artifact, the quota notice, or the error without conditional
 * narrowing acrobatics.
 */
export type GenerateAiFixState =
  | { readonly status: 'idle' }
  | {
      readonly status: 'succeeded';
      readonly artifact: AiFixArtifact;
      readonly used: number;
      readonly remaining: number;
    }
  | { readonly status: 'quota-exceeded'; readonly used: number; readonly quota: number }
  | { readonly status: 'failed'; readonly error: string };

/**
 * Generate an AI fix for one finding.
 *
 * 1. Require an authenticated user.
 * 2. Verify the finding belongs to a site the user owns (RLS
 *    would block at the DB level too, but explicit is better).
 * 3. Check monthly quota. Free tier has zero by default — Pro tier
 *    will lift the gate once billing lands (3d). Until then, the
 *    UI label says "Pro feature" and the gate is the quota.
 * 4. Call Gemini (or the local stub if GEMINI_API_KEY is unset).
 * 5. Persist success or failure. Successes count against quota,
 *    failures don't.
 */
export async function generateAIFixAction(findingId: string): Promise<GenerateAiFixState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'failed', error: 'Sign in to generate a fix.' };

  // Verify ownership + pull the context the helper needs.
  const [row] = await getDb()
    .select({
      checkId: findings.checkId,
      checkCategory: findings.category,
      severity: findings.severity,
      fixRecommendation: findings.fixRecommendation,
      evidence: findings.evidence,
      siteUrl: sites.url,
      siteId: sites.id,
    })
    .from(findings)
    .innerJoin(audits, eq(findings.auditId, audits.id))
    .innerJoin(sites, eq(audits.siteId, sites.id))
    .where(and(eq(findings.id, findingId), eq(sites.userId, user.id)))
    .limit(1);

  if (row === undefined) {
    return { status: 'failed', error: 'Finding not found or not yours.' };
  }

  const usage = await listMonthlyAiFixUsage(user.id);
  if (usage.remaining <= 0) {
    return {
      status: 'quota-exceeded',
      used: usage.used,
      quota: MONTHLY_AI_FIX_QUOTA_PRO,
    };
  }

  try {
    const result = await generateAiFix({
      checkId: row.checkId,
      checkCategory: row.checkCategory,
      severity: row.severity as 'critical' | 'high' | 'medium' | 'low',
      fixRecommendation: row.fixRecommendation,
      evidence: row.evidence,
      siteUrl: row.siteUrl,
    });

    await createAiFixSuccess({
      userId: user.id,
      findingId,
      model: result.model,
      promptTokens: result.promptTokens,
      outputTokens: result.outputTokens,
      output: result.rawOutput,
    });

    revalidatePath(`/dashboard/sites/${row.siteId}`);

    return {
      status: 'succeeded',
      artifact: result.artifact,
      used: usage.used + 1,
      remaining: usage.remaining - 1,
    };
  } catch (err) {
    const message =
      err instanceof AiFixError ? err.message : err instanceof Error ? err.message : String(err);
    await createAiFixFailure({
      userId: user.id,
      findingId,
      model: 'gemini-2.0-flash',
      errorMessage: message,
    });
    return { status: 'failed', error: message };
  }
}
