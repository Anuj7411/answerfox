import { describe, expect, it } from 'vitest';
import { type LeaderboardRow, rankEntries, toDisplayDomain } from './rank';

describe('toDisplayDomain', () => {
  it('strips protocol, www, and path', () => {
    expect(toDisplayDomain('https://www.sottogames.com/')).toBe('sottogames.com');
    expect(toDisplayDomain('http://docs.acme.com/guide')).toBe('docs.acme.com');
  });
  it('lowercases the host', () => {
    expect(toDisplayDomain('https://EXAMPLE.com')).toBe('example.com');
  });
  it('falls back gracefully for non-URL input', () => {
    expect(toDisplayDomain('www.example.com/foo')).toBe('example.com');
  });
});

function row(overrides: Partial<LeaderboardRow> = {}): LeaderboardRow {
  return { domain: 'a.com', score: 50, band: 'average', fetchedAtMs: 1000, ...overrides };
}

describe('rankEntries', () => {
  it('ranks by score descending with 1-based ranks', () => {
    const out = rankEntries([
      row({ domain: 'low.com', score: 20 }),
      row({ domain: 'high.com', score: 90 }),
      row({ domain: 'mid.com', score: 55 }),
    ]);
    expect(out.map((e) => `${e.rank}:${e.domain}`)).toEqual([
      '1:high.com',
      '2:mid.com',
      '3:low.com',
    ]);
  });

  it('breaks score ties by most recent audit', () => {
    const out = rankEntries([
      row({ domain: 'older.com', score: 70, fetchedAtMs: 1000 }),
      row({ domain: 'newer.com', score: 70, fetchedAtMs: 5000 }),
    ]);
    expect(out[0].domain).toBe('newer.com');
  });

  it('caps to the limit', () => {
    const rows = Array.from({ length: 10 }, (_, i) => row({ domain: `s${i}.com`, score: i }));
    expect(rankEntries(rows, 3)).toHaveLength(3);
  });

  it('returns an empty list for no rows', () => {
    expect(rankEntries([])).toEqual([]);
  });
});
