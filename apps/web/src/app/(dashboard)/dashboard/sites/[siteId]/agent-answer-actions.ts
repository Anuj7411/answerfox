'use server';

import { createAnswerModel } from '@/lib/agent-answer/answer-model';
import { runAgentAnswerTest } from '@/lib/agent-answer/run-agent-answer-test';
import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { fetchCrawlerView } from '@/lib/xray/crawler-fetch';

/**
 * Run the Agent Answer Simulation for a site and return the report to
 * the panel that triggered it. Discriminated on `status` so the UI can
 * render the score, the "set a key" notice, or the error without
 * narrowing acrobatics (same contract style as ai-fix-actions).
 *
 * Deliberately does not persist yet. Wiring the orphaned engine to a
 * real user-triggerable path is v0.9; the task-success-over-time table
 * is v1 Move 4 and lands with the trendline UI that reads it.
 */
export type RunAgentAnswerState =
  | { readonly status: 'idle' }
  | { readonly status: 'succeeded'; readonly report: AgentAnswerReport }
  | { readonly status: 'unavailable'; readonly reason: string }
  | { readonly status: 'failed'; readonly error: string };

export async function runAgentAnswerAction(siteId: string): Promise<RunAgentAnswerState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'failed', error: 'Sign in to run the simulation.' };

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) return { status: 'failed', error: 'Site not found.' };

  const model = createAnswerModel();
  if (model === null) {
    return {
      status: 'unavailable',
      reason: 'Set GEMINI_API_KEY in apps/web/.env.local to run the Agent Answer Simulation.',
    };
  }

  try {
    const report = await runAgentAnswerTest(site.url, {
      crawlerFetch: fetchCrawlerView,
      model,
    });
    return { status: 'succeeded', report };
  } catch (err) {
    return {
      status: 'failed',
      error: err instanceof Error ? err.message : 'Simulation failed.',
    };
  }
}
