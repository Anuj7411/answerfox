import { type Fs, dirname, joinPath } from './fs.js';
import type { Prompter } from './prompter.js';

export interface InstallableFile {
  /** Path relative to the project root, e.g. `app/about/page.tsx`. */
  readonly filename: string;
  /** Fully-rendered content (no tokens remaining). */
  readonly content: string;
}

export interface InstallResult {
  readonly filename: string;
  readonly status: 'written' | 'skipped';
}

/**
 * Write `file.content` to `${cwd}/${file.filename}`, creating parent
 * directories as needed. If the target file already exists, prompt
 * for overwrite; user declining yields `{ status: 'skipped' }`.
 *
 * Pure function over the injected `Fs` and `Prompter` — tests pass
 * `InMemoryFs` + `ScriptedPrompter`.
 */
export async function installFile(
  file: InstallableFile,
  cwd: string,
  fs: Fs,
  prompter: Prompter,
): Promise<InstallResult> {
  const target = joinPath(cwd, file.filename);

  if (fs.existsSync(target)) {
    const overwrite = await prompter.confirm({
      message: `${file.filename} already exists. Overwrite?`,
      defaultValue: false,
    });
    if (!overwrite) {
      return { filename: file.filename, status: 'skipped' };
    }
  }

  const parent = dirname(target);
  if (parent.length > 0) {
    fs.mkdirSync(parent, { recursive: true });
  }
  fs.writeFileSync(target, file.content);
  return { filename: file.filename, status: 'written' };
}
