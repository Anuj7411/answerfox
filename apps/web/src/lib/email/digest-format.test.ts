import { describe, expect, it } from 'vitest';
import {
  type DigestSiteLine,
  type WeeklyDigestData,
  averageScore,
  formatScoreDelta,
  hasDigestContent,
  renderWeeklyDigestText,
  weeklyDigestSubject,
} from './digest-format';

function line(overrides: Partial<DigestSiteLine> = {}): DigestSiteLine {
  return {
    siteId: 'site-1',
    name: 'Acme Docs',
    url: 'https://docs.acme.com',
    currentScore: 72,
    band: 'strong',
    previousScore: 68,
    ...overrides,
  };
}

function data(overrides: Partial<WeeklyDigestData> = {}): WeeklyDigestData {
  return {
    userId: 'user-1',
    email: 'owner@acme.com',
    name: 'Dana',
    sites: [line()],
    fixesGenerated: 2,
    windowStart: new Date('2026-07-13T00:00:00Z'),
    windowEnd: new Date('2026-07-20T00:00:00Z'),
    appUrl: 'https://answerfox-web.vercel.app',
    ...overrides,
  };
}

describe('formatScoreDelta', () => {
  it('returns "new" when there is no baseline', () => {
    expect(formatScoreDelta(50, null)).toBe('new');
  });
  it('returns "even" when the score held', () => {
    expect(formatScoreDelta(70, 70)).toBe('even');
  });
  it('returns a signed positive delta when the score rose', () => {
    expect(formatScoreDelta(74, 70)).toBe('+4');
  });
  it('returns a signed negative delta when the score fell', () => {
    expect(formatScoreDelta(63, 70)).toBe('-7');
  });
});

describe('averageScore', () => {
  it('is 0 for no sites', () => {
    expect(averageScore([])).toBe(0);
  });
  it('rounds the mean of the current scores', () => {
    expect(averageScore([line({ currentScore: 70 }), line({ currentScore: 75 })])).toBe(73);
  });
});

describe('hasDigestContent', () => {
  it('is false when the user has no audited sites', () => {
    expect(hasDigestContent(data({ sites: [] }))).toBe(false);
  });
  it('is true when at least one site is present', () => {
    expect(hasDigestContent(data())).toBe(true);
  });
});

describe('weeklyDigestSubject', () => {
  it('pluralizes and includes the average', () => {
    const subject = weeklyDigestSubject(
      data({ sites: [line({ currentScore: 70 }), line({ currentScore: 80 })] }),
    );
    expect(subject).toBe('Answerfox · weekly digest: 2 sites, avg 75/100');
  });
  it('uses the singular for one site', () => {
    expect(weeklyDigestSubject(data())).toContain('1 site,');
  });
});

describe('renderWeeklyDigestText', () => {
  it('greets by name and lists each site with its delta and deep link', () => {
    const text = renderWeeklyDigestText(data());
    expect(text).toContain('Hi Dana,');
    expect(text).toContain('Acme Docs (https://docs.acme.com)');
    expect(text).toContain('72/100 · strong · +4 from last week');
    expect(text).toContain('https://answerfox-web.vercel.app/dashboard/sites/site-1');
    expect(text).toContain('AI fixes generated this week: 2 fixes.');
    expect(text).toContain('/dashboard/settings');
  });

  it('labels a first-week audit as such and handles a missing name', () => {
    const text = renderWeeklyDigestText(
      data({ name: null, sites: [line({ previousScore: null })], fixesGenerated: 1 }),
    );
    expect(text).toContain('Hi,');
    expect(text).toContain('first audit this week');
    expect(text).toContain('AI fixes generated this week: 1 fix.');
  });
});
