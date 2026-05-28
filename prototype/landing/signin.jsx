/* SCREEN 5 — SIGN IN (Slate Terracotta #C6553C @ 60% intensity)
   Asymmetric split. The bloom dominates the left side, glass card on
   the right. Warm welcome variant. */

function SignIn() {
  return (
    <div className="screen" data-screen-label="Sign in" style={{ '--ember': '#C6553C' }}>
      <Bloom opts={{
        base: '#D6D2CB',
        ember: [218, 110, 78],
        core: [224, 122, 88],
        intensity: 0.60,
        cx: 0.28, cy: 0.45, radius: 0.62,
        orbitX: 0.10, orbitY: 0.08, orbitPeriod: 28,
        period: 22, breathAmp: 0.06,
        grainMul: 0.14, grainTime: 3.2,
        tonePeriod: 42,
        renderScale: 0.82, fps: 30,
        w: 1440, h: 900,
      }} />

      <div className="layer">
        <div className="si-shell">
          {/* left bloom side with brand + proof */}
          <div className="si-left">
            <div className="brand">
              <span className="mark"><i></i></span>
              <span className="wm" style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Answerable</span>
            </div>
            <div className="quote">
              SEO that lives in your codebase. Audit, fix, and <em>ship</em> in one tool.
            </div>
            <div className="meta">
              <span>MIT licensed</span>
              <span className="vd"></span>
              <span>500+ stars</span>
              <span className="vd"></span>
              <span>50k weekly downloads</span>
            </div>
          </div>

          {/* right glass card with sign-in */}
          <div className="si-right">
            <div className="si-card">
              <div className="wm">Answerable</div>
              <h2>Welcome.</h2>
              <p className="sub">Audit your site for SEO, AEO, and GEO. Then let AI write the fixes as code.</p>

              <div className="actions">
                <button className="btn btn-solid">
                  <GitHubIcon /> Continue with GitHub
                </button>
                <button className="btn btn-quiet">
                  <GoogleIcon /> Continue with Google
                </button>
              </div>

              <div className="divider">Free to sign up · no credit card</div>
              <div className="footer">
                By continuing you agree to our <a href="#">terms</a> and <a href="#">privacy</a>.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SignIn });
