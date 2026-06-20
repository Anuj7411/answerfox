import { describe, expect, it } from 'vitest';
import { shouldFireScoreDropAlert } from './should-alert';

describe('shouldFireScoreDropAlert', () => {
  it('does not fire when no threshold is set', () => {
    expect(shouldFireScoreDropAlert({ threshold: null, previousScore: 90, currentScore: 50 })).toBe(
      false,
    );
  });

  it('does not fire on the very first audit (no previous score)', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: null, currentScore: 40 })).toBe(
      false,
    );
  });

  it('fires when crossing from above-threshold to below', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 75, currentScore: 65 })).toBe(
      true,
    );
  });

  it('fires when previous was exactly at threshold and current dipped below', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 70, currentScore: 69 })).toBe(
      true,
    );
  });

  it('does not fire when both runs are below threshold (edge already passed)', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 60, currentScore: 50 })).toBe(
      false,
    );
  });

  it('does not fire when both runs are at or above threshold', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 80, currentScore: 75 })).toBe(
      false,
    );
  });

  it('does not fire when the current run equals the threshold exactly', () => {
    // "below threshold" is strictly less than — a score at the threshold
    // is still acceptable.
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 80, currentScore: 70 })).toBe(
      false,
    );
  });

  it('does not fire on improvement (current > previous, but previous was below)', () => {
    expect(shouldFireScoreDropAlert({ threshold: 70, previousScore: 55, currentScore: 65 })).toBe(
      false,
    );
  });
});
