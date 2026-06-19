import { describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
import { type AiFixInput, generateAiFix } from './generate-fix';

const baseInput: AiFixInput = {
  checkId: 'G1',
  checkCategory: 'agent-readiness',
  severity: 'medium',
  description: 'x',
  fixRecommendation: 'x',
  evidence: 'x',
  siteUrl: 'https://example.com',
};

function geminiResponse(text: string): Response {
  return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// These probe `extractJson`'s balanced-brace + escape-aware parser.
// If we accidentally count braces inside strings, escape backslashes
// wrong, or short-circuit on the first }, these tests catch it.
describe('extractJson — JSON-strings-with-embedded-braces edge cases', () => {
  it('handles snippet with literal { } inside a string field', async () => {
    const artifact = {
      kind: 'meta',
      snippet: '<style>.foo { color: red; }</style>',
      explanation: 'add style block with braces inside the string',
    };
    const fetchImpl = (async () =>
      geminiResponse(JSON.stringify(artifact))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('handles snippet with escaped quotes inside a string field', async () => {
    const artifact = {
      kind: 'meta',
      snippet: '<meta name="description" content="They said \\"hi\\"">',
      explanation: "escaped quotes shouldn't fool the parser",
    };
    const fetchImpl = (async () =>
      geminiResponse(JSON.stringify(artifact))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact.kind).toBe('meta');
  });

  it('handles file artifact whose body contains nested JSON braces', async () => {
    const artifact = {
      kind: 'file',
      path: 'public/.well-known/mcp/server-card.json',
      body: '{"name":"example","capabilities":{"tools":["search","fetch"]}}',
      explanation: 'nested braces in body field',
    };
    const fetchImpl = (async () =>
      geminiResponse(JSON.stringify(artifact))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('handles ```json fence wrapping content with nested braces', async () => {
    const artifact = {
      kind: 'jsonld',
      snippet:
        '{"@context":"https://schema.org","@type":"Organization","contactPoint":{"@type":"ContactPoint"}}',
      explanation: 'jsonld with nested @ schema',
    };
    const wrapped = `\`\`\`json\n${JSON.stringify(artifact)}\n\`\`\``;
    const fetchImpl = (async () => geminiResponse(wrapped)) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('handles rewrite artifact with multi-line strings containing braces and quotes', async () => {
    const artifact = {
      kind: 'rewrite',
      oldText: 'function foo() {\n  return "{ hi }";\n}',
      newText: 'function foo() {\n  return "{ bye }";\n}',
      explanation: 'multi-line code with braces inside strings',
    };
    const fetchImpl = (async () =>
      geminiResponse(JSON.stringify(artifact))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });

  it('handles patch artifact with diff containing braces', async () => {
    const artifact = {
      kind: 'patch',
      diff: '--- a/file.ts\n+++ b/file.ts\n@@ -1,3 +1,3 @@\n-const x = { a: 1 };\n+const x = { a: 2, b: 3 };\n',
      explanation: 'unified diff with braces',
    };
    const fetchImpl = (async () =>
      geminiResponse(JSON.stringify(artifact))) as unknown as typeof fetch;
    const result = await generateAiFix(baseInput, { apiKey: 'k', fetchImpl });
    expect(result.artifact).toEqual(artifact);
  });
});
