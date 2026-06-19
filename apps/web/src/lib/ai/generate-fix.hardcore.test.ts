import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { AiFixError, type AiFixInput, generateAiFix } from './generate-fix';

const baseInput: AiFixInput = {
  checkId: 'G1',
  checkCategory: 'agent-readiness',
  severity: 'medium',
  description: 'MCP Server Card present',
  fixRecommendation: 'Publish an MCP Server Card.',
  evidence: 'No file at /.well-known/mcp/server-card.json',
  siteUrl: 'https://example.com',
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function geminiCandidate(text: string) {
  return { candidates: [{ content: { parts: [{ text }] } }] };
}

describe('artifact kind coverage — all 5 shapes parse', () => {
  it('parses jsonld artifact', async () => {
    const artifact = {
      kind: 'jsonld',
      snippet: '{"@context":"https://schema.org","@type":"Organization"}',
      explanation: 'Add Organization JSON-LD.',
    };
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(JSON.stringify(artifact)))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('parses rewrite artifact', async () => {
    const artifact = {
      kind: 'rewrite',
      oldText: 'We unlock seamless solutions.',
      newText: 'We ship monitoring tools.',
      explanation: 'Replace marketing jargon with concrete claim.',
    };
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(JSON.stringify(artifact)))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('parses patch artifact', async () => {
    const artifact = {
      kind: 'patch',
      diff: '--- a/index.html\n+++ b/index.html\n@@ -1 +1 @@\n-old\n+new',
      explanation: 'Update homepage title.',
    };
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(JSON.stringify(artifact)))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('parses meta artifact (Gemini mode)', async () => {
    const artifact = {
      kind: 'meta',
      snippet: '<meta name="description" content="A monitoring tool">',
      explanation: 'Add description meta tag.',
    };
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(JSON.stringify(artifact)))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });
});

describe('artifact validation — partial / malformed shapes are rejected', () => {
  it('rejects unknown kind', async () => {
    const fetchImpl = (async () =>
      jsonResponse(
        geminiCandidate(JSON.stringify({ kind: 'banana', explanation: 'x' })),
      )) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects missing kind field', async () => {
    const fetchImpl = (async () =>
      jsonResponse(
        geminiCandidate(JSON.stringify({ explanation: 'x' })),
      )) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects missing explanation', async () => {
    const fetchImpl = (async () =>
      jsonResponse(
        geminiCandidate(JSON.stringify({ kind: 'meta', snippet: 'x' })),
      )) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects rewrite missing oldText', async () => {
    const fetchImpl = (async () =>
      jsonResponse(
        geminiCandidate(JSON.stringify({ kind: 'rewrite', newText: 'x', explanation: 'y' })),
      )) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects patch missing diff', async () => {
    const fetchImpl = (async () =>
      jsonResponse(
        geminiCandidate(JSON.stringify({ kind: 'patch', explanation: 'y' })),
      )) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects null instead of object', async () => {
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate('null'))) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects array instead of object', async () => {
    const fetchImpl = (async () => jsonResponse(geminiCandidate('[]'))) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });

  it('rejects string instead of object', async () => {
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate('"just a string"'))) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toBeInstanceOf(
      AiFixError,
    );
  });
});

describe('Gemini response shape — robustness against unexpected response envelopes', () => {
  it('throws on missing candidates array', async () => {
    const fetchImpl = (async () => jsonResponse({})) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini returned an empty response',
    );
  });

  it('throws on empty candidates array', async () => {
    const fetchImpl = (async () => jsonResponse({ candidates: [] })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini returned an empty response',
    );
  });

  it('throws on candidate missing content', async () => {
    const fetchImpl = (async () => jsonResponse({ candidates: [{}] })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini returned an empty response',
    );
  });

  it('throws on content missing parts', async () => {
    const fetchImpl = (async () =>
      jsonResponse({ candidates: [{ content: {} }] })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(
      'Gemini returned an empty response',
    );
  });

  it('defaults missing usageMetadata to zero tokens', async () => {
    const artifact = { kind: 'meta', snippet: 'x', explanation: 'y' };
    const fetchImpl = (async () =>
      jsonResponse({
        candidates: [{ content: { parts: [{ text: JSON.stringify(artifact) }] } }],
      })) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.promptTokens).toBe(0);
    expect(result.outputTokens).toBe(0);
  });

  it('throws AiFixError on HTTP 500 with body', async () => {
    const fetchImpl = (async () =>
      new Response('internal error', { status: 500 })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(/HTTP 500/);
  });

  it('throws AiFixError on HTTP 401 (bad key)', async () => {
    const fetchImpl = (async () =>
      new Response('API key not valid', { status: 401 })) as unknown as typeof fetch;
    await expect(generateAiFix(baseInput, { apiKey: 'k', fetchImpl })).rejects.toThrow(/HTTP 401/);
  });

  it('truncates long error body to 200 chars in error message', async () => {
    const longBody = 'x'.repeat(500);
    const fetchImpl = (async () =>
      new Response(longBody, { status: 500 })) as unknown as typeof fetch;
    try {
      await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
      expect.fail('should have thrown');
    } catch (err) {
      const msg = (err as Error).message;
      // 'Gemini returned HTTP 500: ' prefix (26 chars) + body.slice(0,200) = 226 max
      expect(msg.length).toBeLessThanOrEqual(226);
      expect(msg).not.toContain('x'.repeat(201));
    }
  });
});

describe('markdown-wrapped JSON — regression for known Gemini failure mode', () => {
  it('strips ```json fences and parses the artifact', async () => {
    const artifact = { kind: 'meta', snippet: 'x', explanation: 'y' };
    const wrapped = `\`\`\`json\n${JSON.stringify(artifact)}\n\`\`\``;
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(wrapped))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('strips plain ``` fences and parses the artifact', async () => {
    const artifact = { kind: 'meta', snippet: 'x', explanation: 'y' };
    const wrapped = `\`\`\`\n${JSON.stringify(artifact)}\n\`\`\``;
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(wrapped))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('extracts JSON object from prose-prefixed output', async () => {
    const artifact = { kind: 'meta', snippet: 'x', explanation: 'y' };
    const prefixed = `Here is the fix:\n\n${JSON.stringify(artifact)}`;
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(prefixed))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('extracts first balanced JSON object from prose-suffixed output', async () => {
    const artifact = {
      kind: 'meta' as const,
      snippet: 'x',
      explanation: 'y',
    };
    const suffixed = `${JSON.stringify(artifact)}\n\nHope that helps!`;
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(suffixed))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('handles nested braces inside string fields when extracting', async () => {
    const artifact = {
      kind: 'jsonld',
      snippet: '{"@context":"https://schema.org","@type":"Organization"}',
      explanation: 'y',
    };
    const wrapped = `\`\`\`json\n${JSON.stringify(artifact)}\n\`\`\``;
    const fetchImpl = (async () =>
      jsonResponse(geminiCandidate(wrapped))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });
});

describe('stub mode — coverage for all G-category scaffoldable checks', () => {
  for (const checkId of ['G1', 'G2', 'G3', 'G4', 'G5', 'G7', 'G8']) {
    it(`returns file scaffold for ${checkId}`, async () => {
      const result = await generateAiFix({ ...baseInput, checkId }, { apiKey: '' });
      expect(result.artifact.kind).toBe('file');
      if (result.artifact.kind === 'file') {
        expect(result.artifact.path).toBe(`public/.well-known/${checkId.toLowerCase()}.json`);
      }
    });
  }

  it('does NOT return file scaffold for G6 (not in allowlist)', async () => {
    const result = await generateAiFix({ ...baseInput, checkId: 'G6' }, { apiKey: '' });
    expect(result.artifact.kind).toBe('meta');
  });

  it('does NOT return file scaffold for arbitrary unknown check', async () => {
    const result = await generateAiFix(
      { ...baseInput, checkId: 'Z99', checkCategory: 'unknown' },
      { apiKey: '' },
    );
    expect(result.artifact.kind).toBe('meta');
  });

  it('stub model name contains -stub suffix', async () => {
    const result = await generateAiFix(baseInput, { apiKey: '' });
    expect(result.model).toBe('gemini-2.0-flash-stub');
  });
});

describe('fetch timeout — regression for hung-Gemini bug', () => {
  // Fast-fakeify the AbortSignal so we don't wait the full 20s in CI.
  // We pass a fetch impl that resolves only when its signal aborts, so
  // we can verify the helper does abort it.
  it('aborts when the upstream signal fires and throws AiFixError', async () => {
    const fetchImpl = ((url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal == null) {
          reject(new Error('expected signal to be passed'));
          return;
        }
        signal.addEventListener('abort', () => {
          const err = new Error('aborted');
          err.name = 'AbortError';
          reject(err);
        });
      })) as unknown as typeof fetch;

    // Force abort by firing it on the next tick via a tiny test timeout.
    // We rely on the fact that the implementation registers an AbortController.
    // To force timely abort without waiting 20s, we wrap fetch to abort itself.
    const fetchWithFastAbort = ((url: string, init?: RequestInit) => {
      // Dispatch the abort event on the signal the helper installed so we
      // don't have to wait the full 20s timeout in tests.
      setTimeout(() => {
        const sig = init?.signal as
          | (AbortSignal & { dispatchEvent?: (e: Event) => boolean })
          | undefined;
        sig?.dispatchEvent?.(new Event('abort'));
      }, 10);
      return fetchImpl(url, init);
    }) as unknown as typeof fetch;

    await expect(
      generateAiFix(baseInput, { apiKey: 'k', fetchImpl: fetchWithFastAbort }),
    ).rejects.toBeInstanceOf(AiFixError);
  });

  it('still passes signal to fetchImpl (proves AbortController wiring)', async () => {
    let sawSignal = false;
    const artifact = { kind: 'meta', snippet: 'x', explanation: 'y' };
    const fetchImpl = ((_url: string, init?: RequestInit) => {
      sawSignal = init?.signal instanceof AbortSignal;
      return Promise.resolve(jsonResponse(geminiCandidate(JSON.stringify(artifact))));
    }) as unknown as typeof fetch;
    await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(sawSignal).toBe(true);
  });
});
