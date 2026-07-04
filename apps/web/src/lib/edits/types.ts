/**
 * The validated-edit contract (relaunch week 2).
 *
 * LLMs are unreliable at unified-diff syntax, so the model NEVER
 * produces diffs. It produces search/replace edits (the Aider /
 * Claude Code lesson); code applies them, code validates the result,
 * and code generates the diff deterministically. "Validated fix"
 * is a code guarantee, not a model behavior.
 */

/** One search/replace edit against one existing file. */
export interface SearchReplaceEdit {
  readonly kind: 'edit';
  /** Repo-relative path, forward slashes, e.g. "src/app/layout.tsx". */
  readonly path: string;
  /**
   * Exact text to find. Must occur EXACTLY ONCE in the file —
   * zero matches means the model hallucinated context, two or more
   * means the edit is ambiguous. Both reject the whole set.
   */
  readonly search: string;
  /** Replacement text. May be empty (deletion). */
  readonly replace: string;
}

/** Creation of a file that must not already exist. */
export interface CreateFileEdit {
  readonly kind: 'create';
  readonly path: string;
  readonly content: string;
}

export type FileEdit = SearchReplaceEdit | CreateFileEdit;

/**
 * Everything needed to open one fix-PR. One finding = one EditSet =
 * one PR (§10.5: never bundle findings).
 */
export interface EditSet {
  /** Audit check that produced the finding, e.g. "C2". */
  readonly checkId: string;
  /** PR title, e.g. "fix: add Organization JSON-LD to layout". */
  readonly title: string;
  /** PR body: what was broken, what this changes, evidence. */
  readonly description: string;
  readonly edits: readonly FileEdit[];
}

/** Result of applying an EditSet to a snapshot of repo files. */
export type ApplyResult =
  | {
      readonly ok: true;
      /** Full post-edit content for every file the set touched. */
      readonly files: ReadonlyMap<string, string>;
    }
  | {
      readonly ok: false;
      /** Machine-readable reason, safe to log and store. */
      readonly reason: string;
    };
