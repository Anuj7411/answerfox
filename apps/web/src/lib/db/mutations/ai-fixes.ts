import 'server-only';
import { getDb } from '@/lib/db/client';
import { aiFixes } from '@/lib/db/schema/ai-fixes';

/**
 * Persist a successful Gemini generation. Caller passes the parsed
 * artifact's raw text as `output` so we can re-render later without
 * paying the API again.
 */
export async function createAiFixSuccess(input: {
  readonly userId: string;
  readonly findingId: string;
  readonly model: string;
  readonly promptTokens: number;
  readonly outputTokens: number;
  readonly output: string;
}): Promise<{ readonly id: string }> {
  const [row] = await getDb()
    .insert(aiFixes)
    .values({
      userId: input.userId,
      findingId: input.findingId,
      status: 'succeeded',
      model: input.model,
      promptTokens: input.promptTokens,
      outputTokens: input.outputTokens,
      output: input.output,
    })
    .returning({ id: aiFixes.id });
  if (row === undefined) {
    throw new Error('createAiFixSuccess: insert returned no row');
  }
  return { id: row.id };
}

/**
 * Persist a failed attempt. We log it so the quota check can give
 * accurate "this is your N-th try" feedback without billing the user.
 *
 * Failures do NOT count against quota — `listMonthlyAiFixUsage` only
 * counts `status = 'succeeded'`. We persist so support can debug
 * specific errors without needing to dig through logs.
 */
export async function createAiFixFailure(input: {
  readonly userId: string;
  readonly findingId: string;
  readonly model: string;
  readonly errorMessage: string;
}): Promise<void> {
  await getDb().insert(aiFixes).values({
    userId: input.userId,
    findingId: input.findingId,
    status: 'failed',
    model: input.model,
    errorMessage: input.errorMessage,
  });
}
