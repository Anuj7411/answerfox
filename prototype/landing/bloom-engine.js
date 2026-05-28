/* ============================================================
   ANSWERABLE — SLATE FAMILY BLOOM ENGINE (v3.2, real bloom)
   Parameterized grain + ember bloom for every screen background.

   v3.2 vs v3 — fix the "orange circle but no glow" problem:

   On a light slate background, screen blend mode does almost
   nothing (screen brightens, but slate is already 80% bright so
   there is no room to brighten). The previous version stacked
   passes that all clustered at the same radius, so the eye saw
   a hard orange dot instead of a soft luminous halo.

   v3.2 uses FIVE concentric scales of bloom:

     PASS A  atmospheric haze  enormous radius, very soft tint
     PASS B  body              gradual warm falloff
     PASS C  halo              soft-light warmth (works on light bg)
     PASS D  hot core          deeper saturated darkening (chiaroscuro)
     PASS E  pinpoint          tiny intense source-over highlight

     The pinpoint is the unmistakable "lit" detail. The deeper-than-
     halo core creates the candlelight chiaroscuro feel. The huge
     soft haze gives the bloom its long tail bleeding into the slate.

   v3.1 orbital drift preserved (the shadergradient feel):
   - Ember traces a lissajous over orbitPeriod seconds.
   - Counter-bloom drifts opposite for parallax depth.
   - Tonal-gradient slowly rotates around the canvas.

   v2 eye-friendly fixes preserved:
   - Grain crossfades smoothly over 3.2s, no strobe.
   - Reduced grain alphas.
   - 30 FPS render.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- film grain tiles ---------- */
  function makeNoise(size, bias) {
    bias = bias || 0;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    const id = ctx.createImageData(size, size);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.max(0, Math.min(255, ((Math.random() * 255) | 0) + bias));
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(id, 0, 0);
    return c;
  }
  const PAPER = Array.from({ length: 6 }, () => makeNoise(256, 18));

  function grainPair(ctx, W, H, baseAlpha, mode, t, tileSeconds) {
    const len = PAPER.length;
    const phase = (t / tileSeconds) % len;
    const a = Math.floor(phase);
    const b = (a + 1) % len;
    const blend = phase - a;
    const draw = (tile, alpha) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.globalCompositeOperation = mode;
      ctx.fillStyle = ctx.createPattern(tile, 'repeat');
      ctx.fillRect(0, 0, W + 600, H + 600);
      ctx.restore();
    };
    const wA = 0.5 + 0.5 * Math.cos(blend * Math.PI);
    const wB = 1 - wA;
    if (PAPER[a]) draw(PAPER[a], baseAlpha * wA);
    if (PAPER[b]) draw(PAPER[b], baseAlpha * wB);
  }

  function rgba(rgb, a) {
    return 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + a + ')';
  }

  function makeRenderer(opts) {
    const base = opts.base || '#D6D2CB';
    const ember = opts.ember || [245, 145, 65];
    const core = opts.core || ember;
    const I = opts.intensity == null ? 0.95 : opts.intensity;
    const fcx = opts.cx == null ? 0.78 : opts.cx;
    const fcy = opts.cy == null ? 0.28 : opts.cy;
    const fr = opts.radius == null ? 0.52 : opts.radius;

    const orbitX = opts.orbitX == null ? 0.14 : opts.orbitX;
    const orbitY = opts.orbitY == null ? 0.09 : opts.orbitY;
    const orbitPeriod = opts.orbitPeriod || 26;

    const period = opts.period || 22;
    const bAmp = opts.breathAmp == null ? 0.06 : opts.breathAmp;
    const grainMul = opts.grainMul == null ? 0.14 : opts.grainMul;
    const grainTime = opts.grainTime || 3.2;
    const tonePeriod = opts.tonePeriod || 38;
    /* lighter tonal gradient so it harmonises with the brighter slate */
    const toneA = opts.toneA || 'rgba(217,212,204,0.30)';
    const toneB = opts.toneB || 'rgba(196,190,182,0.38)';
    const counterBloom = opts.counterBloom || null;

    // precompute color variants used by the 5 bloom passes
    // v3.3: deep color stays much closer to the ember (less burned)
    // so the chiaroscuro core no longer drags the bloom to brown.
    const ember_warm = ember;
    const ember_deep = [
      Math.round(ember[0] * 0.88),
      Math.round(ember[1] * 0.62),
      Math.round(ember[2] * 0.38)
    ];
    const ember_hot = [
      Math.min(255, ember[0] + 10),
      Math.min(255, ember[1] + 40),
      Math.min(255, ember[2] + 70)
    ];

    return function (ctx, W, H, t) {
      // 1) flat slate base
      ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

      // 2) slow tonal rotation
      const angle = (t / tonePeriod) * Math.PI * 2;
      const cosA = Math.cos(angle), sinA = Math.sin(angle);
      const cxC = W / 2, cyC = H / 2;
      const half = Math.max(W, H);
      const tone = ctx.createLinearGradient(
        cxC - cosA * half, cyC - sinA * half,
        cxC + cosA * half, cyC + sinA * half
      );
      tone.addColorStop(0, toneA);
      tone.addColorStop(1, toneB);
      ctx.fillStyle = tone; ctx.fillRect(0, 0, W, H);

      // 3) ORBITAL BLOOM POSITION (lissajous over orbitPeriod)
      const px = Math.cos((t / orbitPeriod) * Math.PI * 2) * orbitX;
      const py = Math.sin((t / (orbitPeriod * 1.37)) * Math.PI * 2) * orbitY;
      const cx = W * (fcx + px);
      const cy = H * (fcy + py);

      // breath (radius pulse) runs on its own slower period
      const breath = (1 - bAmp) + Math.sin(t * (Math.PI * 2 / period)) * bAmp;
      const r = W * fr * breath;

      // tiny offset center used for the "hot" passes (organic feel)
      const hx = cx - 18, hy = cy + 6;

      // ============================================================
      // PASS A — ATMOSPHERIC HAZE (warm tail bleeding into slate).
      // Slightly larger and warmer than the over-faded version so
      // the bloom has presence in the surrounding canvas.
      // ============================================================
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const haze = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.20);
      haze.addColorStop(0.00, rgba(ember_warm, 0.22 * I));
      haze.addColorStop(0.30, rgba(ember_warm, 0.14 * I));
      haze.addColorStop(0.60, rgba(ember_warm, 0.06 * I));
      haze.addColorStop(1.00, rgba(ember_warm, 0));
      ctx.fillStyle = haze; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ============================================================
      // PASS B — BODY (the main warm mass; saturation restored
      // to roughly the geometric mean of v3.1 and v3.2 so the orange
      // reads as a real ember, not a ghost).
      // ============================================================
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const body = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.88);
      body.addColorStop(0.00, rgba(ember_warm, 0.72 * I));
      body.addColorStop(0.10, rgba(ember_warm, 0.62 * I));
      body.addColorStop(0.25, rgba(ember_warm, 0.46 * I));
      body.addColorStop(0.45, rgba(ember_warm, 0.28 * I));
      body.addColorStop(0.70, rgba(ember_warm, 0.10 * I));
      body.addColorStop(1.00, rgba(ember_warm, 0));
      ctx.fillStyle = body; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ============================================================
      // PASS C — HALO (soft-light; brings back the gentle warm
      // luminosity around the center. Still uses the hot variant
      // for color tone but never goes white).
      // ============================================================
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light';
      const halo = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.58);
      halo.addColorStop(0.00, rgba(ember_hot, 0.65 * I));
      halo.addColorStop(0.25, rgba(ember_hot, 0.48 * I));
      halo.addColorStop(0.55, rgba(ember_warm, 0.22 * I));
      halo.addColorStop(1.00, rgba(ember_warm, 0));
      ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ============================================================
      // PASS D — HOT CORE (gentle warm deepening; not strong enough
      // to read as a dark hole, just enough to feel like there is
      // a center to the bloom).
      // ============================================================
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      const coreGrad = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.30);
      coreGrad.addColorStop(0.00, rgba(ember_deep, 0.32 * I));
      coreGrad.addColorStop(0.45, rgba(ember_deep, 0.18 * I));
      coreGrad.addColorStop(1.00, rgba(ember_warm, 0));
      ctx.fillStyle = coreGrad; ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // PASS E (the bright pinpoint highlight) stays REMOVED.
      // No white hole. The ember reads as warm glow, not a sun.

      // ============================================================
      // optional COUNTER-BLOOM (cool drift opposite the ember)
      // ============================================================
      if (counterBloom) {
        const ccx = W * ((1 - fcx) - px * 0.6);
        const ccy = H * ((1 - fcy) - py * 0.6);
        const cr = W * 0.42 * (
          (1 - bAmp * 0.6) +
          Math.sin(t * (Math.PI * 2 / (period * 1.42))) * bAmp * 0.6
        );
        ctx.save();
        ctx.globalCompositeOperation = 'multiply';
        const cgrad = ctx.createRadialGradient(ccx, ccy, 0, ccx, ccy, cr);
        const ca = counterBloom.a == null ? 0.22 : counterBloom.a;
        cgrad.addColorStop(0, rgba(counterBloom.rgb, ca * I));
        cgrad.addColorStop(1, rgba(counterBloom.rgb, 0));
        ctx.fillStyle = cgrad; ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // calm film grain (v2 crossfade preserved)
      grainPair(ctx, W, H, grainMul, 'multiply', t, grainTime);
      grainPair(ctx, W, H, grainMul * 0.18, 'overlay', t + 1.6, grainTime);
    };
  }

  /* ---------- mount + RAF loop ---------- */
  function mountBloom(canvas, opts) {
    opts = opts || {};
    const cssW = opts.w || canvas.clientWidth || 1440;
    const cssH = opts.h || canvas.clientHeight || 900;
    const scale = opts.renderScale || 0.62;
    const W = Math.round(cssW * scale);
    const H = Math.round(cssH * scale);
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const render = makeRenderer(opts);

    const start = performance.now();
    let last = 0;
    const FPS = opts.fps || 30;
    const INT = 1000 / FPS;
    function frame(now) {
      if (now - last >= INT) {
        last = now;
        const t = Math.max(0, (now - start) / 1000);
        try { render(ctx, W, H, t); } catch (e) {}
      }
      requestAnimationFrame(frame);
    }
    render(ctx, W, H, 0);
    requestAnimationFrame(frame);
    return canvas;
  }

  window.mountBloom = mountBloom;
})();
