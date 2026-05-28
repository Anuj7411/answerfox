/* SCREEN 1 — LANDING (Slate Ember #E87B2C @ ~80% intensity)
   Bloom opts tuned for the eye-friendly v2 engine:
   - period 22s   (was 12s) — slower breath
   - breathAmp .06 (was .12) — subtler size pulse
   - grainMul .14  (was .22) — less itchy grain
   - tonePeriod 60s — slow tonal drift across the canvas
*/

function Landing() {
  return (
    <div className="screen" data-screen-label="Landing" style={{ '--ember': '#E87B2C' }}>
      <Bloom opts={{
        /* v3.3 — slate lifted ~12 points and ember brightened so
           the multiply blend stops landing in brown territory. */
        base: '#D6D2CB',
        ember: [248, 148, 68],
        core: [250, 142, 60],
        intensity: 0.80,
        cx: 0.80, cy: 0.24, radius: 0.46,

        /* orbital drift, kept clearly visible */
        orbitX: 0.14, orbitY: 0.09, orbitPeriod: 26,

        /* counter-bloom: quiet cool shape drifts opposite the ember
           to give the slate parallax depth. Subtle but you feel it. */
        counterBloom: { rgb: [120, 132, 148], a: 0.18 },

        /* slow tonal sweep across the full canvas */
        tonePeriod: 38,

        period: 22, breathAmp: 0.06,
        grainMul: 0.14, grainTime: 3.2,
        renderScale: 0.82,
        fps: 30,
        w: 1440, h: 900,
      }} />

      <div className="layer">
        <nav className="nav">
          <div className="brand">
            <span className="mark"><i></i></span>
            <span className="wm">Answerable</span>
          </div>
          <div className="nav-links">
            <a href="#pricing">Pricing</a>
            <a href="#docs">Docs</a>
            <a href="https://github.com/Anuj7411/answerable">GitHub</a>
          </div>
          <div className="nav-right">
            <button className="btn btn-quiet"><GitHubIcon /> Sign in with GitHub</button>
          </div>
        </nav>

        <div className="lp-main">
          <div className="lp-copy">
            <span className="eyebrow"><span className="dot"></span> Open-source AI-SEO toolkit</span>
            <h1 className="t-hero">The only AI-SEO toolkit that lives in your codebase and ships fixes as code.</h1>
            <p className="lp-sub">Audit any site for SEO, AEO, and GEO across 55 checks. Then let AI write the fixes.</p>
            <div className="lp-cta">
              <button className="btn btn-solid">Audit my site</button>
              <button className="btn btn-ghost"><GitHubIcon /> View on GitHub</button>
            </div>
            <div className="lp-trust">
              <span><b>MIT</b> licensed</span>
              <span className="sep"></span>
              <span><b>500+</b> stars on GitHub</span>
              <span className="sep"></span>
              <span><b>50K</b> weekly npm downloads</span>
            </div>
          </div>

          <div className="term glass">
            <div className="term-bar">
              <span className="tl"></span><span className="tl"></span><span className="tl"></span>
              <span className="tname">answerable — zsh</span>
            </div>
            <div className="term-body">
              <div><span className="prompt">$</span> <span className="cmd">pnpm dlx @answerable-kit/cli audit vercel.com</span></div>
              <div className="muted">Audit running… done in 2.4s</div>
              <div className="ok">Score: <b style={{ fontWeight: 600 }}>92</b>/100 <span className="muted">(Excellent)</span></div>
              <div className="term-scores">
                <span className="sc">SEO <b>92</b></span>
                <span className="sc">AEO <b>87</b></span>
                <span className="sc">GEO <b>74</b></span>
                <span className="agg">Aggregate <b>84</b></span>
                <span className="term-cursor"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing });
