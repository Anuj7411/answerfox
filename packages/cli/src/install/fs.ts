import * as nodeFs from 'node:fs';

/**
 * Tiny filesystem abstraction shared by `init` and `add`. The
 * production implementation (`NodeFs`) delegates to `node:fs`;
 * `InMemoryFs` is a test seam so command tests never touch the real
 * disk.
 *
 * Paths are stored with forward slashes regardless of platform — the
 * `joinPath` / `dirname` helpers normalize on entry so Windows hosts
 * and POSIX hosts produce the same in-memory layout.
 */
export interface Fs {
  existsSync(path: string): boolean;
  readFileSync(path: string, encoding: 'utf8'): string;
  writeFileSync(path: string, content: string): void;
  mkdirSync(path: string, opts: { readonly recursive: true }): void;
}

export class NodeFs implements Fs {
  existsSync(p: string): boolean {
    return nodeFs.existsSync(p);
  }
  readFileSync(p: string, encoding: 'utf8'): string {
    return nodeFs.readFileSync(p, encoding);
  }
  writeFileSync(p: string, content: string): void {
    nodeFs.writeFileSync(p, content, 'utf8');
  }
  mkdirSync(p: string, opts: { readonly recursive: true }): void {
    nodeFs.mkdirSync(p, opts);
  }
}

/**
 * In-memory filesystem for command tests. Paths are normalized to
 * forward-slash form; trailing slashes are stripped; consecutive
 * slashes collapsed.
 */
export class InMemoryFs implements Fs {
  private readonly files = new Map<string, string>();
  private readonly dirs = new Set<string>();

  existsSync(p: string): boolean {
    const norm = normalize(p);
    return this.files.has(norm) || this.dirs.has(norm);
  }

  readFileSync(p: string, _encoding: 'utf8'): string {
    const norm = normalize(p);
    const content = this.files.get(norm);
    if (content === undefined) {
      throw new Error(`ENOENT: no such file or directory, open '${p}'`);
    }
    return content;
  }

  writeFileSync(p: string, content: string): void {
    const norm = normalize(p);
    this.files.set(norm, content);
    // Implicitly create parent dirs (matches node:fs writeFile under existing dir).
    this.recordParents(norm);
  }

  mkdirSync(p: string, opts: { readonly recursive: true }): void {
    const norm = normalize(p);
    if (!opts.recursive && !this.parentExists(norm)) {
      throw new Error(`ENOENT: parent directory missing for '${p}'`);
    }
    this.recordParents(norm);
    this.dirs.add(norm);
  }

  /** Test helper — returns the contents of a written file or `undefined`. */
  readFile(p: string): string | undefined {
    return this.files.get(normalize(p));
  }

  /** Test helper — returns every file path written, sorted. */
  listFiles(): readonly string[] {
    return [...this.files.keys()].sort();
  }

  private recordParents(path: string): void {
    const parts = path.split('/').filter((p) => p.length > 0);
    let acc = path.startsWith('/') ? '' : '';
    for (let i = 0; i < parts.length - 1; i++) {
      acc = `${acc}/${parts[i]}`;
      this.dirs.add(acc);
    }
  }

  private parentExists(path: string): boolean {
    const parent = dirname(path);
    return parent === '' || this.dirs.has(parent);
  }
}

/**
 * Forward-slash path join. Collapses doubled separators and converts
 * any back-slash to forward-slash. Trailing slashes are dropped so two
 * spellings of the same path hash to the same key.
 */
export function joinPath(...parts: string[]): string {
  return normalize(parts.join('/'));
}

export function dirname(p: string): string {
  const norm = normalize(p);
  const idx = norm.lastIndexOf('/');
  return idx > 0 ? norm.slice(0, idx) : '';
}

function normalize(p: string): string {
  let out = p.replace(/\\/g, '/').replace(/\/+/g, '/');
  if (out.length > 1 && out.endsWith('/')) {
    out = out.slice(0, -1);
  }
  return out;
}
