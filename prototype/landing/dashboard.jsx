/* SCREEN 3 — DASHBOARD HOME (Slate Ember #E87B2C @ 35% intensity)
   Subtle ember presence: this is a daily-use product surface, not a
   marketing hero. The data is the focus, the bloom is ambient. */

/* Small line icons for the sidebar nav items. */
function DbIcon(props) {
  const p = {
    audits:   'M3 13h3l2 5 4-13 2 8h4',
    findings: 'M4 5h12M4 10h12M4 15h7',
    fixes:    'M11 2 4 12h5l-1 8 8-12h-5z',
    settings: 'M10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.4 4.6l-1.4 1.4M6 14l-1.4 1.4M15.4 15.4 14 14M6 6 4.6 4.6',
  }[props.name];
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={p} />
    </svg>
  );
}

function Dashboard() {
  return (
    <div className="screen" data-screen-label="Dashboard" style={{ '--ember': '#E87B2C' }}>
      <Bloom opts={{
        base: '#D6D2CB',
        ember: [248, 148, 68],
        core: [250, 142, 60],
        intensity: 0.35,
        cx: 0.50, cy: 0.46, radius: 0.50,
        orbitX: 0.42, orbitY: 0.34, orbitPeriod: 46,
        period: 22, breathAmp: 0.06,
        grainMul: 0.13, grainTime: 3.2,
        tonePeriod: 42,
        renderScale: 0.82, fps: 30,
        w: 1440, h: 900,
      }} />

      <div className="layer">
        <div className="db-shell">
          {/* sidebar */}
          <aside className="db-side">
            <div className="brand">
              <span className="mark" style={{ display: 'inline-flex', verticalAlign: 'middle' }}><i></i></span>
              <span className="wm" style={{ marginLeft: 10, fontFamily: 'var(--font-display)', fontWeight: 600 }}>Answerable</span>
            </div>
            <div className="group">Site</div>
            <div className="item active">
              <span className="swatch dot" style={{ background: 'var(--ember)' }}></span>
              answerable.io
            </div>
            <div className="item">
              <span className="swatch dot" style={{ background: 'var(--violet)' }}></span>
              docs.answerable.io
            </div>
            <div className="group">Navigate</div>
            <div className="item active"><DbIcon name="audits" /> Audits</div>
            <div className="item"><DbIcon name="findings" /> Findings <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-dim)' }}>3</span></div>
            <div className="item"><DbIcon name="fixes" /> AI Fixes <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--ink-dim)' }}>23/90</span></div>
            <div className="item"><DbIcon name="settings" /> Settings</div>
          </aside>

          {/* main */}
          <main className="db-main">
            <div className="db-topbar">
              <div className="db-site">
                <span className="swatch"></span>
                <span>answerable.io</span>
                <span style={{ color: 'var(--ink-dim)', marginLeft: 4 }}>▾</span>
              </div>
              <div className="db-meta">
                <span className="quota">Daily AI fixes · <b>2 of 3</b> used</span>
                <span>·</span>
                <span>resets in 4h 23m</span>
              </div>
            </div>

            <div className="db-scores">
              <ScoreCard label="SEO" value="92" trend="up" />
              <ScoreCard label="AEO" value="87" trend="up" />
              <ScoreCard label="GEO" value="74" trend="down" />
              <ScoreCard label="Aggregate" value="84" sub="Strong" aggregate />
            </div>

            <div className="db-bento">
              <div className="col" style={{ flex: 1, minHeight: 0 }}>
                <div className="db-trend">
                  <div className="db-tile-h">
                    <span>Score trend</span>
                    <span className="hint">Last 7 days</span>
                  </div>
                  <TrendChart />
                </div>
                <div className="db-fixes">
                  <div className="db-ring">
                    <div className="inner">23/90</div>
                  </div>
                  <div className="copy">
                    <span className="big">AI Fixes this month</span>
                    <span className="sub">67 remaining · resets May 31</span>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button className="btn btn-ghost" style={{ height: 40, padding: '0 16px' }}>Generate fix</button>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="db-findings">
                  <div className="db-tile-h">
                    <span>Recent findings</span>
                    <span className="hint">3 new</span>
                  </div>
                  <ul>
                    <li><span className="id">A4</span><span className="desc">Canonical missing on /pricing</span><span className="sev high">High</span></li>
                    <li><span className="id">G1</span><span className="desc">llms.txt absent</span><span className="sev med">Med</span></li>
                    <li><span className="id">C3</span><span className="desc">WebSite schema incomplete</span><span className="sev low">Low</span></li>
                  </ul>
                </div>
                <div className="db-next">
                  <div className="left">
                    <span className="ts">Tomorrow 03:42 UTC</span>
                    <span className="lbl">Next scheduled audit</span>
                  </div>
                  <button className="btn btn-solid" style={{ height: 40, padding: '0 16px' }}>Re-audit</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function ScoreCard(props) {
  const pct = parseInt(props.value, 10);
  const trend = props.trend;
  return (
    <div className={'db-score-card' + (props.aggregate ? ' aggregate' : '')}>
      <div className="label">
        <span>{props.label}</span>
        {trend === 'up'   && <span style={{ marginLeft: 'auto', color: 'var(--positive)', fontSize: 10, fontWeight: 600 }}>▲ improving</span>}
        {trend === 'down' && <span style={{ marginLeft: 'auto', color: 'var(--magenta)', fontSize: 10 }}>▼ declining</span>}
        {props.sub        && <span style={{ marginLeft: 'auto', color: 'var(--ink)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{props.sub}</span>}
      </div>
      <div className="num">{props.value}<small>/100</small></div>
      <div className="bar"><i style={{ width: pct + '%' }}></i></div>
    </div>
  );
}

function TrendChart() {
  // hand-drawn 7-day trends for SEO (top), AEO (mid), GEO (bottom)
  // 0..100 scale → svg y (180 - val * 1.6)
  const series = [
    { name: 'SEO',  color: '#1A1814', points: [88,89,90,90,91,92,92] },
    { name: 'AEO',  color: 'var(--violet)', points: [80,82,82,85,85,86,87] },
    { name: 'GEO',  color: 'var(--magenta)', points: [80,79,77,76,75,75,74] },
  ];
  const toPath = (vals) => {
    const dx = 100 / 6;
    return vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * dx).toFixed(1)},${(140 - (v - 60) * 3).toFixed(1)}`).join(' ');
  };
  return (
    <svg viewBox="0 0 100 160" preserveAspectRatio="none">
      <g opacity="0.18">
        {[80,90,100].map(v => (
          <line key={v} x1="0" x2="100" y1={140 - (v - 60) * 3} y2={140 - (v - 60) * 3} stroke="#1A1814" strokeWidth="0.2" />
        ))}
      </g>
      {series.map((s, i) => (
        <path key={i} d={toPath(s.points)} stroke={s.color} strokeWidth="0.9" fill="none" vectorEffect="non-scaling-stroke" />
      ))}
      <g fontFamily="JetBrains Mono, monospace" fontSize="3.6" fill="#7A736A">
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) => (
          <text key={d} x={(i * 16.66).toFixed(1)} y="155">{d}</text>
        ))}
      </g>
    </svg>
  );
}

Object.assign(window, { Dashboard });
