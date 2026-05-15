import { describe, expect, it } from 'vitest';
import { InMemoryFs, dirname, joinPath } from './fs.js';

describe('joinPath', () => {
  it('joins parts with forward slashes', () => {
    expect(joinPath('a', 'b', 'c')).toBe('a/b/c');
  });

  it('normalizes back-slashes to forward-slashes', () => {
    expect(joinPath('a\\b', 'c\\d')).toBe('a/b/c/d');
  });

  it('collapses duplicated separators', () => {
    expect(joinPath('a/', '/b', '//c')).toBe('a/b/c');
  });

  it('drops a trailing slash so two spellings hash to the same key', () => {
    expect(joinPath('a/b/')).toBe('a/b');
  });
});

describe('dirname', () => {
  it('returns the parent of a file path', () => {
    expect(dirname('/a/b/c.txt')).toBe('/a/b');
  });

  it('returns the empty string for a top-level path', () => {
    expect(dirname('a')).toBe('');
  });

  it('strips one segment at a time', () => {
    expect(dirname('a/b/c/d')).toBe('a/b/c');
  });
});

describe('InMemoryFs', () => {
  it('round-trips a written file through readFileSync', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/app/page.tsx', 'export default function Page() {}');
    expect(fs.existsSync('/proj/app/page.tsx')).toBe(true);
    expect(fs.readFileSync('/proj/app/page.tsx', 'utf8')).toBe('export default function Page() {}');
  });

  it('throws ENOENT-like error on readFileSync of a missing file', () => {
    const fs = new InMemoryFs();
    expect(() => fs.readFileSync('/missing.txt', 'utf8')).toThrow(/ENOENT/);
  });

  it('records implicit parent directories on write', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/app/nested/deep/file.tsx', 'x');
    expect(fs.existsSync('/proj/app/nested')).toBe(true);
    expect(fs.existsSync('/proj/app/nested/deep')).toBe(true);
  });

  it('treats explicit mkdirSync recursive as creating the chain', () => {
    const fs = new InMemoryFs();
    fs.mkdirSync('/a/b/c', { recursive: true });
    expect(fs.existsSync('/a')).toBe(true);
    expect(fs.existsSync('/a/b')).toBe(true);
    expect(fs.existsSync('/a/b/c')).toBe(true);
  });

  it('normalizes back-slash paths to forward-slash internally', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('C:\\proj\\app\\page.tsx', 'x');
    // Both spellings resolve to the same file.
    expect(fs.existsSync('C:\\proj\\app\\page.tsx')).toBe(true);
    expect(fs.existsSync('C:/proj/app/page.tsx')).toBe(true);
  });

  it('listFiles returns every file path sorted', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/b.txt', 'b');
    fs.writeFileSync('/proj/a.txt', 'a');
    fs.writeFileSync('/proj/c.txt', 'c');
    expect(fs.listFiles()).toEqual(['/proj/a.txt', '/proj/b.txt', '/proj/c.txt']);
  });
});
