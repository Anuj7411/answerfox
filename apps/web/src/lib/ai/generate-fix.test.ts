import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { AiFixError, type AiFixInput, generateAiFix } from './generate-fix';

const baseInput: AiFixInput = {
  checkId: 'G1',
  checkCategory: 'agent-readiness',
  severity: 'medium',
  description: 'MCP Server Card present at /.well-known/mcp/server-card.json',
  fixRecommendation: 'Publish an MCP Server Card.',
  evidence: 'No file at https://example.com/.well-known/mcp/server-card.json',
  siteUrl: 'https://example.com',
};

describe('generateAiFix — stub mode (no API key)', () => {
  it('returns a file scaffold for scaffoldable G-category checks', async () => {
    const result = await generateAiFix(baseInput, { apiKey: '' });
    expect(result.model).toContain('stub');
    expect(result.artifact.kind).toBe('file');
    if (result.artifact.kind === 'file') {
      expect(result.artifact.path).toContain('.well-known');
      expect(result.artifact.explanation).toContain('GEMINI_API_KEY');
    }
  });

  it('returns a meta stub for non-scaffoldable checks', async () => {
    const result = await generateAiFix(
      { ...baseInput, checkId: 'A1', checkCategory: 'meta-and-technical' },
      { apiKey: '' },
    );
    expect(result.artifact.kind).toBe('meta');
  });
});

describe('generateAiFix — Gemini mode', () => {
  it('sends a prompt and parses a valid JSON file artifact', async () => {
    const artifact = {
      kind: 'file',
      path: 'public/.well-known/mcp/server-card.json',
      body: '{"name":"example"}',
      explanation: 'Publish the MCP Server Card.',
    };
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        candidates: [{ content: { parts: [{ text: JSON.stringify(artifact) }] } }],
        usageMetadata: { promptTokenCount: 120, candidatesTokenCount: 80 },
      }),
    ) as unknown as typeof fetch;

    const result = await generateAiFix(baseInput, { apiKey: 'test-key', fetchImpl });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url, init] = (fetchImpl as unknown as { mock: { calls: [string, RequestInit][] } }).mock
      .calls[0];
    expect(url).toContain('gemini-2.0-flash');
    expect(url).toContain('key=test-key');
    expect(init?.method).toBe('POST');

    expect(result.artifact).toEqual(artifact);
    expect(result.promptTokens).toBe(120);
    expect(result.outputTokens).toBe(80);
    expect(result.model).toBe('gemini-2.0-flash');
  });

  it('throws AiFixError on HTTP non-2xx', async () => {
    const fetchImpl = (async () =>
      new Response('rate limited', { status: 429 })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('throws AiFixError on invalid JSON output', async () => {
    const fetchImpl = (async () =>
      jsonResponse({
        candidates: [{ content: { parts: [{ text: 'not valid json' }] } }],
      })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini response was not a valid AiFixArtifact JSON',
    );
  });

  it('throws AiFixError when artifact is missing required fields', async () => {
    const fetchImpl = (async () =>
      jsonResponse({
        candidates: [
          { content: { parts: [{ text: JSON.stringify({ kind: 'file', explanation: 'x' }) }] } },
        ],
      })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow();
  });

  it('throws AiFixError on empty Gemini response', async () => {
    const fetchImpl = (async () =>
      jsonResponse({
        candidates: [{ content: { parts: [{ text: '' }] } }],
      })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini returned an empty response',
    );
  });

  it('wraps network errors', async () => {
    const fetchImpl = (async () => {
      throw new Error('ECONNREFUSED');
    }) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });
});

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
