import 'server-only';

/**
 * Gemini-backed AI fix generator.
 *
 * One responsibility: given a failing audit check and the page
 * context around it, return a structured fix the user can apply.
 *
 * We use Gemini 2.0 Flash by default — it sits in Google's free
 * tier (1500 requests / day) and gives clean structured JSON when
 * asked. If `GEMINI_API_KEY` isn't set we short-circuit to a stub
 * so local dev keeps working without forcing an API key dependency.
 *
 * Output schema is a discriminated union so the UI can render the
 * right artifact:
 *  - 'meta'   — string of HTML/JSX to drop in the page <head>
 *  - 'jsonld' — a JSON-LD block
 *  - 'file'   — a file scaffold (path + body) for manifests
 *  - 'rewrite'— old/new pair for content rewrites
 *  - 'patch'  — unified diff for code-level changes
 */

export type AiFixArtifact =
  | { readonly kind: 'meta'; readonly snippet: string; readonly explanation: string }
  | { readonly kind: 'jsonld'; readonly snippet: string; readonly explanation: string }
  | {
      readonly kind: 'file';
      readonly path: string;
      readonly body: string;
      readonly explanation: string;
    }
  | {
      readonly kind: 'rewrite';
      readonly oldText: string;
      readonly newText: string;
      readonly explanation: string;
    }
  | { readonly kind: 'patch'; readonly diff: string; readonly explanation: string };

export interface AiFixInput {
  readonly checkId: string;
  readonly checkCategory: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly description?: string;
  readonly fixRecommendation: string | null;
  readonly evidence: string | null;
  readonly siteUrl: string;
  /** Optional small HTML excerpt around the offending element. */
  readonly htmlExcerpt?: string;
}

export interface AiFixOutput {
  readonly model: string;
  readonly artifact: AiFixArtifact;
  readonly rawOutput: string;
  readonly promptTokens: number;
  readonly outputTokens: number;
}

export class AiFixError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'AiFixError';
  }
}

const DEFAULT_MODEL = 'gemini-2.0-flash';
const SCAFFOLDABLE_CHECKS = new Set(['G1', 'G2', 'G3', 'G4', 'G5', 'G7', 'G8']);
const REQUEST_TIMEOUT_MS = 20_000;

/**
 * Generate a fix for a failing finding.
 *
 * @param input  finding context the runner persisted
 * @param opts   optional fetch + env overrides for tests
 */
export async function generateAiFix(
  input: AiFixInput,
  opts: { readonly fetchImpl?: typeof fetch; readonly apiKey?: string } = {},
): Promise<AiFixOutput> {
  const apiKey = opts.apiKey ?? process.env.GEMINI_API_KEY ?? '';

  if (apiKey.length === 0) {
    return stubFix(input);
  }

  const fetchImpl = opts.fetchImpl ?? fetch;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${apiKey}`;
  const prompt = buildPrompt(input);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1200,
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new AiFixError(`Gemini request timed out after ${REQUEST_TIMEOUT_MS}ms`, err);
    }
    throw new AiFixError('Gemini request failed before it reached the API', err);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new AiFixError(`Gemini returned HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  if (text.length === 0) {
    throw new AiFixError('Gemini returned an empty response');
  }

  let artifact: AiFixArtifact;
  try {
    const parsed = JSON.parse(extractJson(text)) as AiFixArtifact;
    artifact = validateArtifact(parsed);
  } catch (err) {
    throw new AiFixError('Gemini response was not a valid AiFixArtifact JSON', err);
  }

  return {
    model: DEFAULT_MODEL,
    artifact,
    rawOutput: text,
    promptTokens: data.usageMetadata?.promptTokenCount ?? 0,
    outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
  };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
}

function buildPrompt(input: AiFixInput): string {
  const shape =
    'Return ONLY a JSON object matching one of these shapes (no markdown, no prose, no leading whitespace): ' +
    '{"kind":"meta","snippet":"<meta ...>","explanation":"..."} | ' +
    '{"kind":"jsonld","snippet":"{...JSON...}","explanation":"..."} | ' +
    '{"kind":"file","path":"public/.well-known/...","body":"...","explanation":"..."} | ' +
    '{"kind":"rewrite","oldText":"...","newText":"...","explanation":"..."} | ' +
    '{"kind":"patch","diff":"--- a/file\\n+++ b/file\\n@@ ...","explanation":"..."}';

  return `You are an expert technical SEO and Agent Readiness fixer. Generate a fix for one failing audit check.

Site URL: ${input.siteUrl}
Check ID: ${input.checkId} (${input.checkCategory}, severity ${input.severity})
Check description: ${input.description ?? '(not stored separately; see fix recommendation)'}
Evidence: ${input.evidence ?? '(none captured)'}
Recommended fix: ${input.fixRecommendation ?? '(none)'}

Pick the artifact shape that matches the check:
- meta tags or OpenGraph → kind: "meta"
- JSON-LD missing → kind: "jsonld"
- Well-known manifest missing (G category checks) → kind: "file"
- Content quality issues → kind: "rewrite"
- Anything else that needs a code change → kind: "patch"

Be concrete. Reference the site's actual URL in any URLs you produce. Keep explanations under 40 words.

${shape}`;
}

// Gemini sometimes ignores responseMimeType and wraps JSON in ```json fences
// or prefixes with prose ("Here is the fix: {...}"). Pull out the first
// balanced {...} block so the downstream JSON.parse sees clean input.
function extractJson(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf('{');
  if (start === -1) return candidate;
  let depth = 0;
  let inString = false;
  let isEscaped = false;
  for (let i = start; i < candidate.length; i += 1) {
    const ch = candidate[i];
    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (ch === '\\') {
      isEscaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }
  return candidate.slice(start);
}

function validateArtifact(value: unknown): AiFixArtifact {
  if (typeof value !== 'object' || value === null) {
    throw new Error('not an object');
  }
  const v = value as Record<string, unknown>;
  if (typeof v.kind !== 'string') throw new Error('missing kind');
  if (typeof v.explanation !== 'string') throw new Error('missing explanation');
  switch (v.kind) {
    case 'meta':
    case 'jsonld':
      if (typeof v.snippet !== 'string') throw new Error(`missing snippet for ${v.kind}`);
      return v as AiFixArtifact;
    case 'file':
      if (typeof v.path !== 'string' || typeof v.body !== 'string') {
        throw new Error('missing file fields');
      }
      return v as AiFixArtifact;
    case 'rewrite':
      if (typeof v.oldText !== 'string' || typeof v.newText !== 'string') {
        throw new Error('missing rewrite fields');
      }
      return v as AiFixArtifact;
    case 'patch':
      if (typeof v.diff !== 'string') throw new Error('missing diff');
      return v as AiFixArtifact;
    default:
      throw new Error(`unknown kind: ${String(v.kind)}`);
  }
}

/**
 * Deterministic local stub used when no API key is set. Returns the
 * manifest scaffold for G-category checks, or a generic explanation
 * for others. Keeps the dashboard usable in local dev.
 */
function stubFix(input: AiFixInput): AiFixOutput {
  const isScaffoldable = SCAFFOLDABLE_CHECKS.has(input.checkId);
  const artifact: AiFixArtifact = isScaffoldable
    ? {
        kind: 'file',
        path: `public/.well-known/${input.checkId.toLowerCase()}.json`,
        body: `{\n  "todo": "local-dev stub for ${input.checkId}; set GEMINI_API_KEY for real fix"\n}\n`,
        explanation: `Local-dev stub. Set GEMINI_API_KEY in apps/web/.env.local to get a real ${input.checkId} fix.`,
      }
    : {
        kind: 'meta',
        snippet: `<!-- Local-dev stub for ${input.checkId}. Set GEMINI_API_KEY to enable. -->`,
        explanation:
          'Stub fix. Real fix generation requires a Gemini API key in apps/web/.env.local.',
      };
  return {
    model: `${DEFAULT_MODEL}-stub`,
    artifact,
    rawOutput: JSON.stringify(artifact),
    promptTokens: 0,
    outputTokens: 0,
  };
}
