/**
 * Slate Family bloom engine, v3.4. TypeScript ESM port of
 * prototype/landing/bloom-engine.js. The render is a 5-pass warm bloom over
 * a slate base, with a slowly drifting lissajous orbit, a breathing radius,
 * a rotating tonal gradient, and a crossfading film grain. No white pinpoint
 * (removed permanently in v3.2 so the ember reads as glow, not a sun).
 *
 *   PASS A  atmospheric haze   PASS B  body      PASS C  soft-light halo
 *   PASS D  multiply hot core  (PASS E pinpoint stays removed)
 *
 * The pure math (orbit, breath, grain crossfade, ember variants, defaults) is
 * exported separately so it can be unit-tested without a canvas. All browser
 * APIs (document, canvas, requestAnimationFrame) live in mountBloom and its
 * helpers, and nothing touches the DOM at module load.
 */

import type { BloomOpts, ResolvedBloomOpts, Rgb } from './types';

const GRAIN_TILE_COUNT = 6;
const GRAIN_TILE_SIZE = 256;
const GRAIN_TILE_BIAS = 18;
const ORBIT_PERIOD_RATIO = 1.37;
const TWO_PI = Math.PI * 2;

// ============================================================
// Pure, deterministic helpers (no DOM — unit tested in engine.test.ts)
// ============================================================

/** Fill every unset option with its v3.4 default. */
export function resolveOptions(opts: BloomOpts): ResolvedBloomOpts {
  const ember: Rgb = opts.ember ?? [245, 145, 65];
  const orbitPeriod = opts.orbitPeriod ?? 26;
  return {
    base: opts.base ?? '#D6D2CB',
    ember,
    core: opts.core ?? ember,
    intensity: opts.intensity ?? 0.95,
    cx: opts.cx ?? 0.78,
    cy: opts.cy ?? 0.28,
    radius: opts.radius ?? 0.52,
    orbitX: opts.orbitX ?? 0.14,
    orbitY: opts.orbitY ?? 0.09,
    orbitPeriod,
    orbitPeriod2: opts.orbitPeriod2 ?? orbitPeriod * ORBIT_PERIOD_RATIO,
    period: opts.period ?? 22,
    breathAmp: opts.breathAmp ?? 0.06,
    grainMul: opts.grainMul ?? 0.14,
    grainTime: opts.grainTime ?? 3.2,
    tonePeriod: opts.tonePeriod ?? 38,
    toneA: opts.toneA ?? 'rgba(217,212,204,0.30)',
    toneB: opts.toneB ?? 'rgba(196,190,182,0.38)',
    counterBloom: opts.counterBloom ?? null,
    renderScale: opts.renderScale ?? 0.62,
    fps: opts.fps ?? 30,
    w: opts.w,
    h: opts.h,
  };
}

/** Lissajous offset (fraction of canvas) at time t, using two distinct periods. */
export function orbitOffset(t: number, o: ResolvedBloomOpts): { px: number; py: number } {
  return {
    px: Math.cos((t / o.orbitPeriod) * TWO_PI) * o.orbitX,
    py: Math.sin((t / o.orbitPeriod2) * TWO_PI) * o.orbitY,
  };
}

/** Breathing radius multiplier at time t (oscillates around 1 by breathAmp). */
export function breathScale(t: number, o: ResolvedBloomOpts): number {
  return 1 - o.breathAmp + Math.sin(t * (TWO_PI / o.period)) * o.breathAmp;
}

/**
 * Grain crossfade state at time t: which two tiles are active and their
 * cosine-eased weights (wA + wB === 1). The smooth weighting is what stops
 * the grain from strobing between tiles.
 */
export function grainBlend(
  t: number,
  tileSeconds: number,
  len: number = GRAIN_TILE_COUNT,
): { a: number; b: number; wA: number; wB: number } {
  const phase = (((t / tileSeconds) % len) + len) % len;
  const a = Math.floor(phase);
  const b = (a + 1) % len;
  const blend = phase - a;
  const wA = 0.5 + 0.5 * Math.cos(blend * Math.PI);
  return { a, b, wA, wB: 1 - wA };
}

/** Warm / deep / hot color variants for the bloom passes. */
export function emberVariants(ember: Rgb): { warm: Rgb; deep: Rgb; hot: Rgb } {
  return {
    warm: ember,
    deep: [Math.round(ember[0] * 0.88), Math.round(ember[1] * 0.62), Math.round(ember[2] * 0.38)],
    hot: [Math.min(255, ember[0] + 10), Math.min(255, ember[1] + 40), Math.min(255, ember[2] + 70)],
  };
}

function rgba(rgb: Rgb, a: number): string {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

// ============================================================
// Browser-only rendering (canvas + RAF). Not imported by tests.
// ============================================================

function makeNoiseTile(size: number, bias: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  if (!ctx) return c;
  const id = ctx.createImageData(size, size);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.max(0, Math.min(255, ((Math.random() * 255) | 0) + bias));
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  ctx.putImageData(id, 0, 0);
  return c;
}

function drawGrain(
  ctx: CanvasRenderingContext2D,
  tiles: HTMLCanvasElement[],
  w: number,
  h: number,
  baseAlpha: number,
  mode: GlobalCompositeOperation,
  t: number,
  tileSeconds: number,
): void {
  const { a, b, wA, wB } = grainBlend(t, tileSeconds, tiles.length);
  const paint = (tile: HTMLCanvasElement, alpha: number) => {
    const pattern = ctx.createPattern(tile, 'repeat');
    if (!pattern) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.globalCompositeOperation = mode;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w + 600, h + 600);
    ctx.restore();
  };
  if (tiles[a]) paint(tiles[a], baseAlpha * wA);
  if (tiles[b]) paint(tiles[b], baseAlpha * wB);
}

type RenderFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;

function makeRenderer(o: ResolvedBloomOpts, tiles: HTMLCanvasElement[]): RenderFn {
  const I = o.intensity;
  const { warm, deep, hot } = emberVariants(o.ember);

  return (ctx, W, H, t) => {
    // 1) slate base, or clear for layered overlays (e.g. Fix Studio panel)
    if (o.base === 'transparent') {
      ctx.clearRect(0, 0, W, H);
    } else {
      ctx.fillStyle = o.base;
      ctx.fillRect(0, 0, W, H);
    }

    // 2) slow tonal rotation
    const angle = (t / o.tonePeriod) * TWO_PI;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const cxC = W / 2;
    const cyC = H / 2;
    const half = Math.max(W, H);
    const tone = ctx.createLinearGradient(
      cxC - cosA * half,
      cyC - sinA * half,
      cxC + cosA * half,
      cyC + sinA * half,
    );
    tone.addColorStop(0, o.toneA);
    tone.addColorStop(1, o.toneB);
    ctx.fillStyle = tone;
    ctx.fillRect(0, 0, W, H);

    // 3) orbital bloom position (lissajous) + breathing radius
    const { px, py } = orbitOffset(t, o);
    const cx = W * (o.cx + px);
    const cy = H * (o.cy + py);
    const r = W * o.radius * breathScale(t, o);
    const hx = cx - 18;
    const hy = cy + 6;

    // PASS A — atmospheric haze
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.2);
    haze.addColorStop(0.0, rgba(warm, 0.22 * I));
    haze.addColorStop(0.3, rgba(warm, 0.14 * I));
    haze.addColorStop(0.6, rgba(warm, 0.06 * I));
    haze.addColorStop(1.0, rgba(warm, 0));
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // PASS B — body
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.88);
    body.addColorStop(0.0, rgba(warm, 0.72 * I));
    body.addColorStop(0.1, rgba(warm, 0.62 * I));
    body.addColorStop(0.25, rgba(warm, 0.46 * I));
    body.addColorStop(0.45, rgba(warm, 0.28 * I));
    body.addColorStop(0.7, rgba(warm, 0.1 * I));
    body.addColorStop(1.0, rgba(warm, 0));
    ctx.fillStyle = body;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // PASS C — soft-light halo
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.58);
    halo.addColorStop(0.0, rgba(hot, 0.65 * I));
    halo.addColorStop(0.25, rgba(hot, 0.48 * I));
    halo.addColorStop(0.55, rgba(warm, 0.22 * I));
    halo.addColorStop(1.0, rgba(warm, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // PASS D — multiply hot core (gentle chiaroscuro, never a dark hole)
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    const coreGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.3);
    coreGrad.addColorStop(0.0, rgba(deep, 0.32 * I));
    coreGrad.addColorStop(0.45, rgba(deep, 0.18 * I));
    coreGrad.addColorStop(1.0, rgba(warm, 0));
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // optional counter-bloom (cool drift opposite the ember)
    if (o.counterBloom) {
      const ccx = W * (1 - o.cx - px * 0.6);
      const ccy = H * (1 - o.cy - py * 0.6);
      const cr =
        W *
        0.42 *
        (1 - o.breathAmp * 0.6 + Math.sin(t * (TWO_PI / (o.period * 1.42))) * o.breathAmp * 0.6);
      const ca = o.counterBloom.a ?? 0.22;
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const cgrad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr);
      cgrad.addColorStop(0, rgba(o.counterBloom.rgb, ca * I));
      cgrad.addColorStop(1, rgba(o.counterBloom.rgb, 0));
      ctx.fillStyle = cgrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // calm film grain (crossfade preserved from v2)
    drawGrain(ctx, tiles, W, H, o.grainMul, 'multiply', t, o.grainTime);
    drawGrain(ctx, tiles, W, H, o.grainMul * 0.18, 'overlay', t + 1.6, o.grainTime);
  };
}

/**
 * Mount the bloom on a canvas and start the render loop. Returns a stop
 * function that cancels the loop (call it on React unmount).
 */
export function mountBloom(canvas: HTMLCanvasElement, opts: BloomOpts = {}): () => void {
  const o = resolveOptions(opts);
  const cssW = o.w ?? canvas.clientWidth ?? 1440;
  const cssH = o.h ?? canvas.clientHeight ?? 900;
  const W = Math.round(cssW * o.renderScale);
  const H = Math.round(cssH * o.renderScale);
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const tiles = Array.from({ length: GRAIN_TILE_COUNT }, () =>
    makeNoiseTile(GRAIN_TILE_SIZE, GRAIN_TILE_BIAS),
  );
  const render = makeRenderer(o, tiles);

  const start = performance.now();
  const interval = 1000 / o.fps;
  let last = 0;
  let rafId = 0;

  const frame = (now: number) => {
    if (now - last >= interval) {
      last = now;
      const t = Math.max(0, (now - start) / 1000);
      try {
        render(ctx, W, H, t);
      } catch {
        // a single bad frame should not kill the loop
      }
    }
    rafId = requestAnimationFrame(frame);
  };

  render(ctx, W, H, 0);
  rafId = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(rafId);
}
