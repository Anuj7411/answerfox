/* SCREEN 2 — PRICING (Slate Marigold #E8AA2A @ 60% intensity) */

function Pricing() {
  return (
    <div className="screen" data-screen-label="Pricing" style={{ '--ember': '#E8AA2A' }}>
      <Bloom opts={{
        base: '#D6D2CB',
        ember: [232, 170, 42],
        core: [240, 180, 60],
        intensity: 0.60,
        cx: 0.50, cy: 0.20, radius: 0.50,
        orbitX: 0.10, orbitY: 0.07, orbitPeriod: 30,
        period: 22, breathAmp: 0.06,
        grainMul: 0.14, grainTime: 3.2,
        tonePeriod: 42,
        renderScale: 0.82, fps: 30,
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

        <div className="pr-main">
          <span className="eyebrow"><span className="dot"></span> Pricing</span>
          <h1 className="pr-heading">Free is for verification. Pro is for monitoring and fixing.</h1>
          <p className="pr-sub">No credit card to try. Cancel any time. Open source forever.</p>

          <div className="pr-toggle">
            <span className="on">Monthly</span>
            <span>Annual <em className="pr-save">save 15%</em></span>
          </div>

          <div className="pr-cards">
            <div className="pr-card">
              <div className="pr-name">Free</div>
              <div className="pr-price">$0<small>forever</small></div>
              <div className="pr-tagline">For trying it out and self-hosting.</div>
              <ul className="pr-list">
                <li><b>Audit engine</b> (open source)</li>
                <li>Three scores: <b>SEO + AEO + GEO</b></li>
                <li><b>CLI:</b> pnpm dlx @answerable-kit/cli</li>
                <li><b>GitHub Action</b> for PR audits</li>
                <li><b>Public score badge</b> for your README</li>
                <li>Latest audit in web dashboard</li>
              </ul>
              <div className="pr-cta">
                <button className="btn btn-ghost">Install the CLI</button>
              </div>
            </div>

            <div className="pr-card pro">
              <div className="pr-name">Pro</div>
              <div className="pr-price">$29<small>/ month</small></div>
              <div className="pr-tagline">For founders who ship weekly.</div>
              <ul className="pr-list">
                <li>Everything in Free, plus:</li>
                <li><b>AI fixes as code</b> · 90 per month</li>
                <li><b>Auto-audits</b> every 24 hours</li>
                <li><b>30-day history</b> + trend graphs</li>
                <li>Up to <b>3 sites</b></li>
                <li><b>Weekly email digest</b></li>
                <li><b>Detailed evidence</b> per finding</li>
              </ul>
              <div className="pr-cta">
                <button className="btn btn-solid">Start Pro</button>
              </div>
            </div>
          </div>

          <div className="pr-studio">
            <span className="pill pill-violet">Studio</span>
            <span><b>$99 / month</b> · auto-PR to GitHub · Team accounts · API access</span>
            <span className="vd"></span>
            <span>Coming Q3 2026 · <a href="#" style={{ color: 'var(--violet)' }}>Join waitlist</a></span>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Pricing });
