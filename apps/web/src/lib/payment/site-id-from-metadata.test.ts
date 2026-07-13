import { describe, expect, it } from 'vitest';
import { siteIdFromMetadata } from './site-id-from-metadata';

describe('siteIdFromMetadata', () => {
  it('returns the site_id when it is a non-empty string', () => {
    expect(siteIdFromMetadata({ site_id: 'abc123' })).toBe('abc123');
  });

  it('returns null when site_id is missing', () => {
    expect(siteIdFromMetadata({})).toBeNull();
    expect(siteIdFromMetadata(null)).toBeNull();
    expect(siteIdFromMetadata(undefined)).toBeNull();
  });

  it('rejects non-string or empty values (metadata can be number/bool)', () => {
    expect(siteIdFromMetadata({ site_id: 42 })).toBeNull();
    expect(siteIdFromMetadata({ site_id: true })).toBeNull();
    expect(siteIdFromMetadata({ site_id: '' })).toBeNull();
  });
});
