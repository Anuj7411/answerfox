import 'server-only';
import { applyEditSet } from '@/lib/edits/apply';
import { generateUnifiedDiff } from '@/lib/edits/diff';
import type { EditSet, FileEdit } from '@/lib/edits/types';
import { validateEditedFiles } from '@/lib/edits/validate';

/**
 * Week-2 retarget of AI fix generation: the model emits a search/replace
 * EditSet (never a diff), and this module only returns sets that
 * PROVABLY apply and parse. Failures are fed back to the model as a
 * correction, up to MAX_ATTEMPTS. If nothing validates, we return the
 * failure trail instead of a fix — a finding with no PR beats a PR
 * that does not apply (§10.5).
 */

const DEFAULT_MODEL = 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

export interface EditGenInput {
  readonly checkId: string;
  readonly description: string;
  readonly fixRecommendation: string | null;
  readonly evidence: string | null;
  readonly siteUrl: string;
  /** Repo-relative path -> current content, for files the fix may touch. */
  readonly repoFiles: ReadonlyMap<string, string>;
}

export interface ValidatedEditSet {
  readonly editSet: EditSet;
  readonly files: ReadonlyMap<string, string>;
  readonly diff: string;
  readonly attempts: number;
  readonly model: string;
}

export type EditGenResult =
  | ({ readonly ok: true } & ValidatedEditSet)
  | { readonly ok: false; readonly attempts: number; readonly reasons: readonly string[] };

/** One round-trip to the model: prompt in, raw text out. Injectable for tests. */
export type ModelCall = (prompt: string) => Promise<string>;

function buildPrompt(input: EditGenInput, previousFailure: string | null): string {
  const fileBlocks = [...input.repoFiles.entries()]
    .map(([path, content]) => `--- FILE: ${path} ---\n${content.slice(0, 12_000)}`)
    .join('\n\n');

  return [
    'You fix websites so AI crawlers can read them. Produce ONE minimal fix as strict JSON, no markdown fences, matching exactly:',
    '{"title": "fix: ...", "description": "...", "edits": [{"kind": "edit", "path": "...", "search": "...", "replace": "..."} | {"kind": "create", "path": "...", "content": "..."}]}',
    'Rules:',
    '- "search" must be copied VERBATIM from the file content below and must be unique within that file.',
    '- Touch as few lines as possible. One finding, one small fix.',
    '- "create" only for files that do not exist.',
    '',
    `Finding ${input.checkId} on ${input.siteUrl}: ${input.description}`,
    input.evidence ? `Evidence: ${input.evidence}` : '',
    input.fixRecommendation ? `Recommended direction: ${input.fixRecommendation}` : '',
    previousFailure
      ? `YOUR PREVIOUS ATTEMPT WAS REJECTED: ${previousFailure}\nFix that specific problem.`
      : '',
    '',
    fileBlocks,
  ]
    .filter((line) => line.length > 0)
    .join('\n');
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced?.[1] ?? text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end <= start) return candidate;
  return candidate.slice(start, end + 1);
}

function tryParse(raw: string): unknown {
  // We ask for responseMimeType application/json, so the raw text is
  // usually clean JSON. Parse it directly first — that avoids the
  // brace-slicing heuristic mangling edits whose own content contains
  // braces. Only fall back to fence/brace extraction if that fails.
  try {
    return JSON.parse(raw.trim());
  } catch {
    // fall through
  }
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return undefined;
  }
}

function parseEditSet(raw: string, checkId: string): EditSet | string {
  const parsed = tryParse(raw);
  if (parsed === undefined) {
    return 'Response was not valid JSON.';
  }
  if (typeof parsed !== 'object' || parsed === null) return 'Response JSON was not an object.';
  const p = parsed as { title?: unknown; description?: unknown; edits?: unknown };
  if (typeof p.title !== 'string' || p.title.length === 0) return 'Missing "title" string.';
  if (typeof p.description !== 'string') return 'Missing "description" string.';
  if (!Array.isArray(p.edits) || p.edits.length === 0) return 'Missing non-empty "edits" array.';

  const edits: FileEdit[] = [];
  for (const e of p.edits as Array<Record<string, unknown>>) {
    if (
      e.kind === 'edit' &&
      typeof e.path === 'string' &&
      typeof e.search === 'string' &&
      typeof e.replace === 'string'
    ) {
      edits.push({ kind: 'edit', path: e.path, search: e.search, replace: e.replace });
    } else if (e.kind === 'create' && typeof e.path === 'string' && typeof e.content === 'string') {
      edits.push({ kind: 'create', path: e.path, content: e.content });
    } else {
      return `Edit entry is malformed: ${JSON.stringify(e).slice(0, 120)}`;
    }
  }
  return { checkId, title: p.title, description: p.description, edits };
}

async function callGemini(
  prompt: string,
  apiKey: string,
  fetchImpl: typeof fetch,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 4000,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Gemini returned HTTP ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generate a validated EditSet for one finding. Loops model -> apply
 * -> parse-gate, feeding rejection reasons back, until success or
 * MAX_ATTEMPTS. Never throws for model-quality problems; only for
 * missing configuration when no injectable model is provided.
 */
export async function generateValidatedEditSet(
  input: EditGenInput,
  opts: {
    readonly modelCall?: ModelCall;
    readonly apiKey?: string;
    readonly fetchImpl?: typeof fetch;
  } = {},
): Promise<EditGenResult> {
  const apiKey = opts.apiKey ?? process.env.GEMINI_API_KEY ?? '';
  const modelCall: ModelCall =
    opts.modelCall ??
    ((prompt: string) => {
      if (apiKey.length === 0)
        throw new Error('GEMINI_API_KEY is not set and no modelCall injected.');
      return callGemini(prompt, apiKey, opts.fetchImpl ?? fetch);
    });

  const reasons: string[] = [];
  let previousFailure: string | null = null;
  // Track whether the most recent failure was a transient API error
  // (503/429/timeout). Those should trigger an Inngest step retry, not
  // a permanent give-up — the model isn't wrong, it's momentarily down.
  let lastWasTransient = false;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let raw: string;
    try {
      raw = await modelCall(buildPrompt(input, previousFailure));
      lastWasTransient = false;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Model call failed.';
      reasons.push(`attempt ${attempt}: ${message}`);
      lastWasTransient = isTransient(message);
      // Don't feed an API/transport error back as a content correction.
      previousFailure = null;
      continue;
    }
    const parsed = parseEditSet(raw, input.checkId);
    if (typeof parsed === 'string') {
      reasons.push(`attempt ${attempt}: ${parsed}`);
      previousFailure = parsed;
      continue;
    }
    const applied = applyEditSet(input.repoFiles, parsed);
    if (!applied.ok) {
      reasons.push(`attempt ${attempt}: ${applied.reason}`);
      previousFailure = applied.reason;
      continue;
    }
    const failures = validateEditedFiles(applied.files);
    if (failures.length > 0) {
      const reason = failures.map((f) => `${f.path}: ${f.reason}`).join('; ');
      reasons.push(`attempt ${attempt}: ${reason}`);
      previousFailure = reason;
      continue;
    }
    return {
      ok: true,
      editSet: parsed,
      files: applied.files,
      diff: generateUnifiedDiff(input.repoFiles, applied.files, parsed),
      attempts: attempt,
      model: opts.modelCall ? 'injected' : DEFAULT_MODEL,
    };
  }

  // Exhausted attempts. If the failures were transient API outages,
  // throw a retryable error so the Inngest step retries later with
  // backoff. If they were content failures (unfixable), give up cleanly
  // so we don't burn retries on a fix that will never validate.
  if (lastWasTransient) {
    throw new Error(`Fix generation failed after transient model errors: ${reasons.join(' | ')}`);
  }
  return { ok: false, attempts: MAX_ATTEMPTS, reasons };
}

/** Classify an error message as a transient (retryable) API/transport error. */
function isTransient(message: string): boolean {
  return /HTTP (?:429|500|502|503|504)|timed out|failed before it reached|fetch failed|network|ECONNRESET|ETIMEDOUT/i.test(
    message,
  );
}
