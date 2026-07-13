'use server';

import { createAnswerModel } from '@/lib/agent-answer/answer-model';
import { DEFAULT_DEVELOPER_QUESTIONS } from '@/lib/agent-answer/default-questions';
import { runAgentAnswerTest } from '@/lib/agent-answer/run-agent-answer-test';
import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import { validateScanUrl } from '@/lib/scan/validate-scan-url';
import { fetchCrawlerView } from '@/lib/xray/crawler-fetch';

/**
 * The free, no-login scanner (v1 growth loop): give any site a public
 * outcome score, then invite the visitor to sign in and ship the fixes
 * as PRs. Runs the same Agent Answer Simulation the dashboard does, so
 * the public number and the logged-in number are defined identically.
 *
 * Two guards keep a public server-side fetch safe and cheap:
 * - validateScanUrl blocks loopback/private/metadata hosts (SSRF).
 * - PUBLIC_QUESTIONS caps each scan to a small subset, bounding model
 *   spend per request.
 *
 * NOT YET SAFE FOR PUBLIC LAUNCH: this has no durable rate limiting or
 * bot protection. Add those (e.g. Upstash + a turnstile) before exposing
 * the route to the open internet, or a single actor can run up the model
 * bill. Tracked as a pre-launch requirement.
 */
const PUBLIC_QUESTIONS = DEFAULT_DEVELOPER_QUESTIONS.slice(0, 3);

export type PublicScanState =
  | { readonly status: 'idle' }
  | { readonly status: 'invalid'; readonly reason: string }
  | { readonly status: 'unavailable'; readonly reason: string }
  | { readonly status: 'succeeded'; readonly report: AgentAnswerReport }
  | { readonly status: 'failed'; readonly error: string };

export async function runPublicScanAction(rawUrl: string): Promise<PublicScanState> {
  const check = validateScanUrl(rawUrl);
  if (!check.ok) return { status: 'invalid', reason: check.reason };

  const model = createAnswerModel();
  if (model === null) {
    return { status: 'unavailable', reason: 'The scanner is not available right now.' };
  }

  try {
    const report = await runAgentAnswerTest(
      check.url,
      { crawlerFetch: fetchCrawlerView, model },
      PUBLIC_QUESTIONS,
    );
    return { status: 'succeeded', report };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : 'Scan failed.' };
  }
}
