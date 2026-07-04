import { describe, expect, it } from 'vitest';
import { applyEditSet } from './apply';
import { generateUnifiedDiff } from './diff';
import type { EditSet } from './types';
import { validateEditedFiles } from './validate';

const LAYOUT = '<html><head><title>Docs</title></head><body>Hello</body></html>';

function repo(files: Record<string, string>): Map<string, string> {
  return new Map(Object.entries(files));
}

function editSet(edits: EditSet['edits']): EditSet {
  return { checkId: 'C2', title: 'fix: test', description: 'test', edits };
}

describe('applyEditSet', () => {
  it('applies a single unambiguous edit', () => {
    const result = applyEditSet(
      repo({ 'src/layout.html': LAYOUT }),
      editSet([
        {
          kind: 'edit',
          path: 'src/layout.html',
          search: '<title>Docs</title>',
          replace: '<title>Acme Docs by Acme</title>',
        },
      ]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.files.get('src/layout.html')).toContain('Acme Docs by Acme');
    }
  });

  it('rejects when search text is missing (model hallucinated context)', () => {
    const result = applyEditSet(
      repo({ 'a.html': LAYOUT }),
      editSet([{ kind: 'edit', path: 'a.html', search: '<title>Nope</title>', replace: 'x' }]),
    );
    expect(result).toEqual({ ok: false, reason: 'Search text not found in a.html.' });
  });

  it('rejects ambiguous matches instead of guessing', () => {
    const result = applyEditSet(
      repo({ 'a.html': '<p>x</p><p>x</p>' }),
      editSet([{ kind: 'edit', path: 'a.html', search: '<p>x</p>', replace: '<p>y</p>' }]),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain('ambiguous');
  });

  it('rejects edits to missing files, empty sets, no-ops, and unsafe paths', () => {
    expect(applyEditSet(repo({}), editSet([])).ok).toBe(false);
    expect(
      applyEditSet(
        repo({}),
        editSet([{ kind: 'edit', path: 'gone.html', search: 'a', replace: 'b' }]),
      ).ok,
    ).toBe(false);
    expect(
      applyEditSet(
        repo({ 'a.html': 'x' }),
        editSet([{ kind: 'edit', path: 'a.html', search: 'x', replace: 'x' }]),
      ).ok,
    ).toBe(false);
    expect(
      applyEditSet(repo({}), editSet([{ kind: 'create', path: '../evil.txt', content: 'x' }])).ok,
    ).toBe(false);
  });

  it('creates new files but never overwrites existing ones', () => {
    const ok = applyEditSet(
      repo({}),
      editSet([
        { kind: 'create', path: 'public/robots.txt', content: 'User-agent: *\nAllow: /\n' },
      ]),
    );
    expect(ok.ok).toBe(true);
    const clash = applyEditSet(
      repo({ 'public/robots.txt': 'existing' }),
      editSet([{ kind: 'create', path: 'public/robots.txt', content: 'new' }]),
    );
    expect(clash.ok).toBe(false);
  });

  it('chains multiple edits to the same file within one set', () => {
    const result = applyEditSet(
      repo({ 'a.html': '<head></head><body>Text</body>' }),
      editSet([
        {
          kind: 'edit',
          path: 'a.html',
          search: '<head>',
          replace: '<head><meta name="description" content="d">',
        },
        { kind: 'edit', path: 'a.html', search: 'Text', replace: 'Better text' },
      ]),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      const content = result.files.get('a.html') ?? '';
      expect(content).toContain('meta name="description"');
      expect(content).toContain('Better text');
    }
  });
});

describe('validateEditedFiles', () => {
  it('passes valid JSON, JSON-LD, and robots.txt', () => {
    const failures = validateEditedFiles(
      repo({
        'data.json': '{"a": 1}',
        'page.html': '<script type="application/ld+json">{"@type":"Organization"}</script>',
        'public/robots.txt': '# comment\nUser-agent: GPTBot\nAllow: /\n',
      }),
    );
    expect(failures).toEqual([]);
  });

  it('fails broken JSON and broken JSON-LD inside HTML', () => {
    const failures = validateEditedFiles(
      repo({
        'data.json': '{"a": }',
        'page.html': '<script type="application/ld+json">{not json}</script>',
      }),
    );
    expect(failures.map((f) => f.path).sort()).toEqual(['data.json', 'page.html']);
  });

  it('fails malformed robots.txt directives', () => {
    const failures = validateEditedFiles(repo({ 'robots.txt': 'User-agent GPTBot' }));
    expect(failures).toHaveLength(1);
    expect(failures[0]?.reason).toContain('line 1');
  });
});

describe('generateUnifiedDiff', () => {
  it('produces a deterministic unified diff with the edited hunk', () => {
    const before = repo({ 'a.html': LAYOUT });
    const set = editSet([
      {
        kind: 'edit',
        path: 'a.html',
        search: '<title>Docs</title>',
        replace: '<title>Better</title>',
      },
    ]);
    const applied = applyEditSet(before, set);
    expect(applied.ok).toBe(true);
    if (!applied.ok) return;
    const diff = generateUnifiedDiff(before, applied.files, set);
    expect(diff).toContain('a/a.html');
    expect(diff).toContain('b/a.html');
    expect(diff).toContain('-<html><head><title>Docs</title>');
    expect(diff).toContain('+<html><head><title>Better</title>');
    // Deterministic: same inputs, identical output.
    expect(generateUnifiedDiff(before, applied.files, set)).toBe(diff);
  });

  it('marks created files against /dev/null', () => {
    const set = editSet([{ kind: 'create', path: 'robots.txt', content: 'User-agent: *\n' }]);
    const applied = applyEditSet(repo({}), set);
    if (!applied.ok) throw new Error('apply failed');
    const diff = generateUnifiedDiff(repo({}), applied.files, set);
    expect(diff).toContain('/dev/null');
    expect(diff).toContain('+User-agent: *');
  });
});
