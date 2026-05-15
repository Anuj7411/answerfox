import { type Fs, joinPath } from './fs.js';

export interface NextProjectInfo {
  readonly hasNext: boolean;
  readonly hasAppDir: boolean;
  readonly projectName?: string | undefined;
}

/**
 * Inspect a directory and report whether it looks like a Next.js
 * App Router project. Used by `init` and `add` to exit early with a
 * helpful error before any prompts fire.
 *
 * We accept either `dependencies.next` or `devDependencies.next` —
 * `create-next-app` puts it in dependencies, but some teams move it
 * to dev deps.
 */
export function detectNextProject(cwd: string, fs: Fs): NextProjectInfo {
  const pkgPath = joinPath(cwd, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    return { hasNext: false, hasAppDir: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch {
    return { hasNext: false, hasAppDir: false };
  }
  if (!isPlainObject(parsed)) {
    return { hasNext: false, hasAppDir: false };
  }

  const deps = isPlainObject(parsed.dependencies) ? parsed.dependencies : undefined;
  const devDeps = isPlainObject(parsed.devDependencies) ? parsed.devDependencies : undefined;
  const hasNext =
    (deps !== undefined && 'next' in deps) || (devDeps !== undefined && 'next' in devDeps);

  const hasAppDir = fs.existsSync(joinPath(cwd, 'app'));
  const projectName = typeof parsed.name === 'string' ? parsed.name : undefined;

  return {
    hasNext,
    hasAppDir,
    ...(projectName !== undefined && { projectName }),
  };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
