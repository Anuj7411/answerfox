import { describe, expect, it } from 'vitest';
import { generateValidatedEditSet } from './generate-edits';

const HTML = '<html><head><title>Docs</title></head><body>Hi</body></html>';

function input(overrides: Partial<Parameters<typeof generateValidatedEditSet>[0]> = {}) {
  return {
    checkId: 'A1',
    description: 'Title too short',
    fixRecommendation: 'Lengthen the title',
    evidence: null,
    siteUrl: 'https://acme.dev',
    repoFiles: new Map([['src/layout.html', HTML]]),
    ...overrides,
  };
}

const GOOD_RESPONSE = JSON.stringify({
  title: 'fix: descriptive title',
  description: 'Makes the title meaningful.',
  edits: [
    {
      kind: 'edit',
      path: 'src/layout.html',
      search: '<title>Docs</title>',
      replace: '<title>Acme Docs, the fastest widget API</title>',
    },
  ],
});

describe('generateValidatedEditSet', () => {
  it('returns a validated set with diff on first-attempt success', async () => {
    const result = await generateValidatedEditSet(input(), {
      modelCall: async () => GOOD_RESPONSE,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.attempts).toBe(1);
      expect(result.diff).toContain(
        '+<html><head><title>Acme Docs, the fastest widget API</title>',
      );
      expect(result.files.get('src/layout.html')).toContain('fastest widget API');
    }
  });

  it('feeds apply-rejections back to the model and succeeds on retry', async () => {
    const prompts: string[] = [];
    let call = 0;
    const result = await generateValidatedEditSet(input(), {
      modelCall: async (prompt) => {
        prompts.push(prompt);
        call += 1;
        if (call === 1) {
          return JSON.stringify({
            title: 'fix: t',
            description: 'd',
            edits: [
              {
                kind: 'edit',
                path: 'src/layout.html',
                search: '<title>WRONG</title>',
                replace: 'x',
              },
            ],
          });
        }
        return GOOD_RESPONSE;
      },
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.attempts).toBe(2);
    expect(prompts[1]).toContain('PREVIOUS ATTEMPT WAS REJECTED');
    expect(prompts[1]).toContain('Search text not found');
  });

  it('rejects sets that apply but fail the parse gate, then gives up with the trail', async () => {
    const result = await generateValidatedEditSet(
      input({ repoFiles: new Map([['data.json', '{"a": 1}']]) }),
      {
        modelCall: async () =>
          JSON.stringify({
            title: 'fix: t',
            description: 'd',
            edits: [{ kind: 'edit', path: 'data.json', search: '{"a": 1}', replace: '{"a": }' }],
          }),
      },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attempts).toBe(3);
      expect(result.reasons).toHaveLength(3);
      expect(result.reasons[0]).toContain('data.json');
    }
  });

  it('handles fenced JSON and garbage responses', async () => {
    const fenced = `\`\`\`json\n${GOOD_RESPONSE}\n\`\`\``;
    const ok = await generateValidatedEditSet(input(), { modelCall: async () => fenced });
    expect(ok.ok).toBe(true);

    const garbage = await generateValidatedEditSet(input(), {
      modelCall: async () => 'not json at all',
    });
    expect(garbage.ok).toBe(false);
    if (!garbage.ok) expect(garbage.reasons[0]).toContain('not valid JSON');
  });
});
