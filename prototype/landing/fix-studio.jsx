/* SCREEN 4 — FIX STUDIO (Slate Amber #FFA500 @ 40% intensity)
   The Fix Studio is a slide-in panel ON TOP of the Dashboard.
   For prototype clarity, we render the Dashboard underneath with
   a dimmed amber bloom, then overlay the Fix Studio panel. */

function FixStudio() {
  return (
    <div className="screen" data-screen-label="Fix Studio" style={{ '--ember': '#FFA500' }}>
      <Bloom opts={{
        base: '#D6D2CB',
        ember: [255, 165, 30],
        core: [255, 175, 60],
        intensity: 0.40,
        cx: 0.78, cy: 0.32, radius: 0.52,
        orbitX: 0.08, orbitY: 0.06, orbitPeriod: 32,
        period: 22, breathAmp: 0.06,
        grainMul: 0.13, grainTime: 3.2,
        tonePeriod: 42,
        renderScale: 0.82, fps: 30,
        w: 1440, h: 900,
      }} />

      <div className="layer">
        {/* dimmed dashboard underneath for context */}
        <div style={{
          position: 'absolute', inset: 0,
          opacity: 0.45, pointerEvents: 'none',
          filter: 'blur(2px) saturate(0.85)',
        }}>
          <div className="db-shell">
            <aside className="db-side"></aside>
            <main className="db-main">
              <div className="db-scores">
                <div className="db-score-card"><div className="label">SEO</div><div className="num">92<small>/100</small></div><div className="bar"><i style={{ width: '92%' }}></i></div></div>
                <div className="db-score-card"><div className="label">AEO</div><div className="num">87<small>/100</small></div><div className="bar"><i style={{ width: '87%' }}></i></div></div>
                <div className="db-score-card"><div className="label">GEO</div><div className="num">74<small>/100</small></div><div className="bar"><i style={{ width: '74%' }}></i></div></div>
                <div className="db-score-card aggregate"><div className="label">Aggregate</div><div className="num">84<small>/100</small></div><div className="bar"><i style={{ width: '84%' }}></i></div></div>
              </div>
            </main>
          </div>
        </div>

        {/* the actual Fix Studio panel */}
        <aside className="fs-overlay">
          <div className="fs-head">
            <div className="top">
              <div>
                <div className="title">
                  <span className="pill pill-ember">A4</span>
                  Generate fix for Canonical
                </div>
                <div className="sub">Missing canonical link on /pricing page · severity high</div>
              </div>
              <button className="fs-close">×</button>
            </div>
          </div>

          <div className="fs-body">
            <div className="fs-status">
              <span className="pulse"></span>
              Generated in 2.1s
            </div>

            <div className="fs-code">{`<`}<span className="tag">link</span>{` `}<span className="attr">rel</span>=<span className="str">"canonical"</span>{` `}<span className="attr">href</span>=<span className="str">"https://answerable.io/pricing"</span>{` />`}</div>

            <p className="fs-explain">
              <b>Why this matters.</b> This tells search engines and AI crawlers that <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>/pricing</code> is the authoritative version of this page, preventing duplicate content issues across query parameters and tracking variants. Both SEO and GEO scores will lift on the next audit.
            </p>

            <div style={{
              padding: '10px 12px', borderRadius: 10,
              border: '1px solid var(--border-subtle)',
              background: 'rgba(196, 192, 185, 0.35)',
              fontFamily: 'var(--font-mono)', fontSize: 12,
              color: 'var(--ink-muted)', display: 'flex', gap: 14, alignItems: 'center',
            }}>
              <span>Impact</span>
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>+3 SEO · +1 GEO</span>
              <span style={{ marginLeft: 'auto' }}>Estimated</span>
            </div>
          </div>

          <div className="fs-actions">
            <button className="btn btn-ghost" style={{ height: 42 }}>Copy code</button>
            <button className="btn btn-quiet" style={{ height: 42 }}>Download .patch</button>
            <button className="btn btn-quiet" style={{ height: 42, opacity: 0.55 }}>
              <span className="pill pill-violet">Studio</span> Apply as PR
            </button>
            <span className="meta">Daily AI fixes: 1 of 3 remaining</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { FixStudio });
