import { describe, expect, it } from 'vitest';
import { breathScale, emberVariants, grainBlend, orbitOffset, resolveOptions } from './engine';
import type { ResolvedBloomOpts } from './types';

describe('resolveOptions', () => {
  it('fills v3.4 defaults when nothing is passed', () => {
    const o = resolveOptions({});
    expect(o.base).toBe('#D6D2CB');
    expect(o.ember).toEqual([245, 145, 65]);
    expect(o.intensity).toBe(0.95);
    expect(o.orbitPeriod).toBe(26);
    expect(o.fps).toBe(30);
  });

  it('derives orbitPeriod2 as orbitPeriod * 1.37 when unset', () => {
    expect(resolveOptions({ orbitPeriod: 46 }).orbitPeriod2).toBeCloseTo(63.02, 5);
  });

  it('honors an explicit orbitPeriod2', () => {
    expect(resolveOptions({ orbitPeriod: 46, orbitPeriod2: 80 }).orbitPeriod2).toBe(80);
  });

  it('defaults core to ember and preserves passed values', () => {
    expect(resolveOptions({ ember: [10, 20, 30] }).core).toEqual([10, 20, 30]);
    expect(resolveOptions({ cx: 0.5, cy: 0.46 })).toMatchObject({ cx: 0.5, cy: 0.46 });
  });
});

describe('orbitOffset', () => {
  const o = resolveOptions({ orbitX: 0.4, orbitY: 0.3, orbitPeriod: 40, orbitPeriod2: 60 });

  it('starts at (orbitX, 0): cos(0)=1, sin(0)=0', () => {
    expect(orbitOffset(0, o)).toEqual({ px: 0.4, py: 0 });
  });

  it('stays within the orbit amplitude on both axes', () => {
    for (let t = 0; t < 200; t += 0.5) {
      const { px, py } = orbitOffset(t, o);
      expect(Math.abs(px)).toBeLessThanOrEqual(0.4 + 1e-9);
      expect(Math.abs(py)).toBeLessThanOrEqual(0.3 + 1e-9);
    }
  });

  it('x completes one full period at t = orbitPeriod', () => {
    expect(orbitOffset(40, o).px).toBeCloseTo(0.4, 9);
  });

  it('does not repeat at orbitPeriod because the y axis uses a different period', () => {
    // Same x as t=0, but y differs, so the figure-8 never exactly repeats.
    expect(orbitOffset(40, o).py).not.toBeCloseTo(orbitOffset(0, o).py, 3);
  });
});

describe('breathScale', () => {
  const o = resolveOptions({ breathAmp: 0.06, period: 22 });

  it('equals 1 - breathAmp at t=0 (sin 0 = 0)', () => {
    expect(breathScale(0, o)).toBeCloseTo(0.94, 9);
  });

  it('oscillates within [1 - 2*amp, 1] (radius breathes 88% to 100%)', () => {
    for (let t = 0; t < 100; t += 0.25) {
      const s = breathScale(t, o);
      expect(s).toBeGreaterThanOrEqual(1 - 2 * 0.06 - 1e-9);
      expect(s).toBeLessThanOrEqual(1 + 1e-9);
    }
  });
});

describe('grainBlend', () => {
  it('weights sum to 1 at every time', () => {
    for (let t = 0; t < 30; t += 0.13) {
      const { wA, wB } = grainBlend(t, 3.2, 6);
      expect(wA + wB).toBeCloseTo(1, 12);
    }
  });

  it('picks adjacent tiles and wraps the second index', () => {
    const atStart = grainBlend(0, 3.2, 6);
    expect(atStart).toMatchObject({ a: 0, b: 1 });
    // phase just under one full cycle of 6 tiles -> tile 5, wrapping to 0
    const nearWrap = grainBlend(3.2 * 6 - 0.001, 3.2, 6);
    expect(nearWrap).toMatchObject({ a: 5, b: 0 });
  });

  it('fully favors tile a at a tile boundary (cosine ease)', () => {
    expect(grainBlend(0, 3.2, 6).wA).toBeCloseTo(1, 9);
  });
});

describe('emberVariants', () => {
  it('keeps warm equal to the input and computes deep + hot', () => {
    const ember: ResolvedBloomOpts['ember'] = [248, 148, 68];
    const { warm, deep, hot } = emberVariants(ember);
    expect(warm).toBe(ember);
    expect(deep).toEqual([218, 92, 26]);
    expect(hot).toEqual([255, 188, 138]);
  });

  it('clamps hot channels at 255', () => {
    expect(emberVariants([250, 250, 250]).hot).toEqual([255, 255, 255]);
  });
});
