import type { ApplyResult, EditSet } from './types';

function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

/**
 * Apply an EditSet to a snapshot of repo files (path -> content).
 *
 * All-or-nothing: any edit that cannot apply cleanly rejects the whole
 * set — a half-applied fix must never become a PR. Rejections carry a
 * reason string that feeds the retry prompt back to the model and the
 * diagnostics trail in the dashboard.
 */
export function applyEditSet(
  repoFiles: ReadonlyMap<string, string>,
  editSet: EditSet,
): ApplyResult {
  if (editSet.edits.length === 0) {
    return { ok: false, reason: 'Edit set contains no edits.' };
  }

  const changed = new Map<string, string>();

  for (const edit of editSet.edits) {
    if (edit.path.startsWith('/') || edit.path.includes('..') || edit.path.includes('\\')) {
      return { ok: false, reason: `Unsafe path: ${edit.path}` };
    }

    if (edit.kind === 'create') {
      if (repoFiles.has(edit.path) || changed.has(edit.path)) {
        return { ok: false, reason: `Cannot create ${edit.path}: file already exists.` };
      }
      if (edit.content.length === 0) {
        return { ok: false, reason: `Cannot create ${edit.path}: empty content.` };
      }
      changed.set(edit.path, edit.content);
      continue;
    }

    // kind === 'edit': operate on the latest content (a prior edit in
    // the same set may already have touched this file).
    const current = changed.get(edit.path) ?? repoFiles.get(edit.path);
    if (current === undefined) {
      return { ok: false, reason: `Cannot edit ${edit.path}: file not found.` };
    }
    if (edit.search.length === 0) {
      return { ok: false, reason: `Cannot edit ${edit.path}: empty search text.` };
    }
    if (edit.search === edit.replace) {
      return { ok: false, reason: `No-op edit on ${edit.path}: search equals replace.` };
    }

    const occurrences = countOccurrences(current, edit.search);
    if (occurrences === 0) {
      return { ok: false, reason: `Search text not found in ${edit.path}.` };
    }
    if (occurrences > 1) {
      return {
        ok: false,
        reason: `Search text is ambiguous in ${edit.path} (${occurrences} matches).`,
      };
    }

    changed.set(edit.path, current.replace(edit.search, edit.replace));
  }

  return { ok: true, files: changed };
}
