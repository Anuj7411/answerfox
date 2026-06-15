/**
 * Landing-page terminal demo (the glass-morphic right column).
 *
 * Geometry and styling lifted verbatim from the locked design handoff
 * (landing-v3.jsx). The container variables (`--ember`, `--ink`,
 * `--border-subtle`) come from globals.css and the per-page ember
 * cascade — do not hardcode colours here.
 *
 * Animations are CSS-only (cursor blink + live pulse). Everything else
 * is static so the terminal reads the same on a Twitter card screenshot
 * as it does in the browser.
 */

interface ScoreRow {
  readonly key: string;
  readonly value: number;
}

const SCORES: ReadonlyArray<ScoreRow> = [
  { key: 'SEO', value: 92 },
  { key: 'AEO', value: 87 },
  { key: 'GEO', value: 74 },
];

const AGGREGATE = 84;

export function LandingTerminal() {
  return (
    <div className="lvp-term">
      <div className="lvp-term-bar">
        <span className="lvp-lights">
          <span className="lvp-light r" />
          <span className="lvp-light y" />
          <span className="lvp-light g" />
        </span>
        <span className="lvp-name">answerfox — audit</span>
        <span className="lvp-live">
          <i /> live
        </span>
      </div>
      <div className="lvp-body">
        <div className="lvp-cmd">
          <span className="pr">$</span> <span className="c">answerfox audit vercel.com</span>
          <span className="cur" />
        </div>
        <div className="lvp-run">
          resolving · fetching · scoring 50 checks… <span className="ok">✓ done in 2.4s</span>
        </div>
        <div className="lvp-scores">
          {SCORES.map((row) => (
            <div key={row.key} className="lvp-row">
              <span className="k">{row.key}</span>
              <span className="tr">
                <i style={{ '--w': `${row.value}%` } as React.CSSProperties} />
              </span>
              <span className="v">{row.value}</span>
            </div>
          ))}
        </div>
        <div className="lvp-foot">
          <div className="lvp-agg">
            <span className="al">Aggregate</span>
            <span className="an">
              {AGGREGATE}
              <i>/100</i>
            </span>
            <span className="ab">Good</span>
          </div>
          <span className="lvp-fix">Fix 6 issues →</span>
        </div>
      </div>
    </div>
  );
}
