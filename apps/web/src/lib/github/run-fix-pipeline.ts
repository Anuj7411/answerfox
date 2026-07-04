import 'server-only';
import { type EditGenInput, generateValidatedEditSet } from '@/lib/ai/generate-edits';
import { type CreateFixPrResult, type GitHubClient, createFixPr } from './create-fix-pr';

/**
 * One finding, end to end: read the target file from the repo, ask the
 * model for a validated EditSet, and open the fix-PR. This is the glue
 * the Inngest queue step runs. Every dependency is injected so the
 * whole path is unit-testable before a live installation exists.
 */

export interface FixPipelineInput {
  readonly owner: string;
  readonly repo: string;
  /** Repo-relative file the fix targets (from stack detection / audit). */
  readonly targetPath: string;
  readonly checkId: string;
  readonly description: string;
  readonly fixRecommendation: string | null;
  readonly evidence: string | null;
  readonly siteUrl: string;
  readonly requestId: string;
}

export type FixPipelineResult =
  | ({ readonly stage: 'pr-opened' } & Extract<CreateFixPrResult, { ok: true }>)
  | { readonly stage: 'no-file'; readonly reason: string }
  | { readonly stage: 'no-valid-fix'; readonly reasons: readonly string[] }
  | { readonly stage: 'pr-failed'; readonly reason: string };

async function readFile(
  client: GitHubClient,
  owner: string,
  repo: string,
  path: string,
): Promise<string | null> {
  try {
    const res = (await client.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo,
      path,
    })) as { data: { content?: string; encoding?: string } };
    const { content, encoding } = res.data;
    if (typeof content !== 'string') return null;
    return encoding === 'base64' ? Buffer.from(content, 'base64').toString('utf8') : content;
  } catch {
    return null;
  }
}

export async function runFixPipeline(
  client: GitHubClient,
  input: FixPipelineInput,
  opts: { readonly generate?: typeof generateValidatedEditSet } = {},
): Promise<FixPipelineResult> {
  const generate = opts.generate ?? generateValidatedEditSet;

  const current = await readFile(client, input.owner, input.repo, input.targetPath);
  if (current === null) {
    return {
      stage: 'no-file',
      reason: `Could not read ${input.targetPath} from ${input.owner}/${input.repo}.`,
    };
  }

  const genInput: EditGenInput = {
    checkId: input.checkId,
    description: input.description,
    fixRecommendation: input.fixRecommendation,
    evidence: input.evidence,
    siteUrl: input.siteUrl,
    repoFiles: new Map([[input.targetPath, current]]),
  };
  const generated = await generate(genInput);
  if (!generated.ok) {
    return { stage: 'no-valid-fix', reasons: generated.reasons };
  }

  const pr = await createFixPr(client, {
    owner: input.owner,
    repo: input.repo,
    editSet: generated.editSet,
    files: generated.files,
    requestId: input.requestId,
  });
  if (!pr.ok) {
    return { stage: 'pr-failed', reason: pr.reason };
  }
  return { stage: 'pr-opened', ...pr };
}
