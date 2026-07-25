import { describe, expect, it } from 'vitest';
import { ANNOTATION_MAX_LEN, normalizeAnnotationBody } from './normalize';

describe('normalizeAnnotationBody', () => {
  it('treats blank input as a delete', () => {
    expect(normalizeAnnotationBody('')).toEqual({ ok: true, action: 'delete' });
    expect(normalizeAnnotationBody('   \n\t ')).toEqual({ ok: true, action: 'delete' });
  });

  it('trims and upserts a normal note', () => {
    expect(normalizeAnnotationBody('  false positive, static export  ')).toEqual({
      ok: true,
      action: 'upsert',
      body: 'false positive, static export',
    });
  });

  it('accepts a note exactly at the length cap', () => {
    const body = 'x'.repeat(ANNOTATION_MAX_LEN);
    expect(normalizeAnnotationBody(body)).toEqual({ ok: true, action: 'upsert', body });
  });

  it('rejects a note over the length cap', () => {
    const res = normalizeAnnotationBody('x'.repeat(ANNOTATION_MAX_LEN + 1));
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain(String(ANNOTATION_MAX_LEN));
  });
});
