import { describe, expect, it } from 'vitest';
import { InMemoryFs } from './fs.js';
import { detectNextProject } from './project.js';

function setupNextProject(fs: InMemoryFs, cwd: string, opts: { withApp?: boolean } = {}) {
  fs.writeFileSync(
    `${cwd}/package.json`,
    JSON.stringify({
      name: 'my-app',
      dependencies: { next: '^15.0.0', react: '^19.0.0' },
    }),
  );
  if (opts.withApp ?? true) {
    fs.mkdirSync(`${cwd}/app`, { recursive: true });
  }
}

describe('detectNextProject', () => {
  it('reports hasNext + hasAppDir on a standard Next.js App Router project', () => {
    const fs = new InMemoryFs();
    setupNextProject(fs, '/proj');
    const info = detectNextProject('/proj', fs);
    expect(info.hasNext).toBe(true);
    expect(info.hasAppDir).toBe(true);
    expect(info.projectName).toBe('my-app');
  });

  it('returns hasNext=false when package.json is missing', () => {
    const fs = new InMemoryFs();
    const info = detectNextProject('/proj', fs);
    expect(info.hasNext).toBe(false);
    expect(info.hasAppDir).toBe(false);
  });

  it('returns hasNext=false when package.json is malformed JSON', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', '{ not json');
    expect(detectNextProject('/proj', fs).hasNext).toBe(false);
  });

  it('returns hasNext=false when neither dependencies nor devDependencies has next', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync(
      '/proj/package.json',
      JSON.stringify({ name: 'x', dependencies: { react: '^19' } }),
    );
    fs.mkdirSync('/proj/app', { recursive: true });
    expect(detectNextProject('/proj', fs).hasNext).toBe(false);
  });

  it('accepts next listed under devDependencies', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync(
      '/proj/package.json',
      JSON.stringify({ name: 'x', devDependencies: { next: '^15' } }),
    );
    fs.mkdirSync('/proj/app', { recursive: true });
    expect(detectNextProject('/proj', fs).hasNext).toBe(true);
  });

  it('reports hasAppDir=false when app/ directory is missing', () => {
    const fs = new InMemoryFs();
    setupNextProject(fs, '/proj', { withApp: false });
    const info = detectNextProject('/proj', fs);
    expect(info.hasNext).toBe(true);
    expect(info.hasAppDir).toBe(false);
  });

  it('returns projectName as undefined when package.json has no name field', () => {
    const fs = new InMemoryFs();
    fs.writeFileSync('/proj/package.json', JSON.stringify({ dependencies: { next: '^15' } }));
    fs.mkdirSync('/proj/app', { recursive: true });
    expect(detectNextProject('/proj', fs).projectName).toBeUndefined();
  });
});
