/**
 * Pure validation/normalization for a finding annotation body.
 *
 * No DB, no network — cheap to unit-test. The server action calls this
 * before touching the DB: a blank body means "clear the note" (delete),
 * a non-blank body is trimmed and length-capped.
 */

export const ANNOTATION_MAX_LEN = 2000;

export type NormalizedAnnotation =
  | { readonly ok: true; readonly action: 'delete' }
  | { readonly ok: true; readonly action: 'upsert'; readonly body: string }
  | { readonly ok: false; readonly error: string };

export function normalizeAnnotationBody(raw: string): NormalizedAnnotation {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return { ok: true, action: 'delete' };
  }
  if (trimmed.length > ANNOTATION_MAX_LEN) {
    return { ok: false, error: `Note must be under ${ANNOTATION_MAX_LEN} characters.` };
  }
  return { ok: true, action: 'upsert', body: trimmed };
}
