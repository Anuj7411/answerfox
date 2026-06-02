/**
 * Types for the Slate Family bloom engine (ported from the v3.4 prototype
 * at prototype/landing/bloom-engine.js). See docs/internal/TRD-V1.md section 16.
 */

/** An [r, g, b] triplet, 0-255. */
export type Rgb = [number, number, number];

/** Optional cool drift opposite the ember, for parallax depth. */
export interface CounterBloom {
  rgb: Rgb;
  /** Peak alpha (defaults to 0.22). */
  a?: number;
}

/** Caller-facing bloom options. Every field is optional; see resolveOptions for defaults. */
export interface BloomOpts {
  /** Slate hex (e.g. '#D6D2CB') or 'transparent' to layer over a backdrop. */
  base?: string;
  ember?: Rgb;
  /** Reserved. The v3.4 passes derive everything from `ember`; kept for API parity. */
  core?: Rgb;
  intensity?: number;
  /** Fractional center, 0-1, of the canvas. */
  cx?: number;
  cy?: number;
  /** Bloom radius as a fraction of width. */
  radius?: number;
  orbitX?: number;
  orbitY?: number;
  orbitPeriod?: number;
  /** Second lissajous period. Defaults to orbitPeriod * 1.37 (non-repeating). */
  orbitPeriod2?: number;
  period?: number;
  breathAmp?: number;
  grainMul?: number;
  grainTime?: number;
  tonePeriod?: number;
  toneA?: string;
  toneB?: string;
  counterBloom?: CounterBloom | null;
  renderScale?: number;
  fps?: number;
  w?: number;
  h?: number;
}

/** BloomOpts with every default filled in. */
export interface ResolvedBloomOpts {
  base: string;
  ember: Rgb;
  core: Rgb;
  intensity: number;
  cx: number;
  cy: number;
  radius: number;
  orbitX: number;
  orbitY: number;
  orbitPeriod: number;
  orbitPeriod2: number;
  period: number;
  breathAmp: number;
  grainMul: number;
  grainTime: number;
  tonePeriod: number;
  toneA: string;
  toneB: string;
  counterBloom: CounterBloom | null;
  renderScale: number;
  fps: number;
  w?: number;
  h?: number;
}
