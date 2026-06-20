interface AuditPoint {
  readonly id: string;
  readonly fetchedAt: Date;
  readonly score: number;
  readonly agentReadinessScore: number;
}

interface ScoreTrendChartProps {
  readonly siteName: string;
  /** Newest first — same order as the query returns. */
  readonly audits: ReadonlyArray<AuditPoint>;
}

const W = 600;
const H = 180;
const PAD_X = 12;
const PAD_Y_TOP = 14;
const PAD_Y_BOT = 24;

/**
 * Aggregate score over the last N audits for the primary site.
 *
 * Rendered as an SVG line + filled area + endpoint dots. Mounted only
 * when there are at least 2 audits — one-point "trends" don't trend.
 * The y-axis is clamped to 0..100 so a real 0/100 audit doesn't look
 * the same as a 70/100 one.
 *
 * X-axis labels are the date of each audit (newest right) so the user
 * can tie movement to deploys.
 */
export function ScoreTrendChart({ siteName, audits }: ScoreTrendChartProps) {
  if (audits.length < 2) return null;

  // Query returns newest first — flip for left-to-right time progression.
  const points = audits.slice().reverse();
  const n = points.length;
  const x = (i: number) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2);
  const y = (v: number) => PAD_Y_TOP + (1 - v / 100) * (H - PAD_Y_TOP - PAD_Y_BOT);

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(2)} ${y(p.score).toFixed(2)}`)
    .join(' ');
  const areaPath = `${linePath} L ${x(n - 1).toFixed(2)} ${H - PAD_Y_BOT} L ${x(0).toFixed(2)} ${H - PAD_Y_BOT} Z`;
  const latest = points[points.length - 1];
  const earliest = points[0];
  if (latest === undefined || earliest === undefined) return null;
  const delta = latest.score - earliest.score;
  const deltaCopy =
    delta === 0
      ? 'flat'
      : `${delta > 0 ? '+' : ''}${delta} points across ${n} audit${n === 1 ? '' : 's'}`;

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Score trend</h2>
        <span className="font-mono text-[11.5px] text-ink-dim">
          {siteName} · last {n} audits · {deltaCopy}
        </span>
      </div>

      <div className="mt-4">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block h-[180px] w-full"
          aria-label={`Score trend for ${siteName}`}
          role="img"
        >
          <title>Score trend</title>
          <defs>
            <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--ember)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--ember)" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 25, 50, 75, 100].map((tick) => (
            <line
              key={tick}
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y(tick)}
              y2={y(tick)}
              stroke="rgba(26,24,20,0.07)"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={areaPath} fill="url(#scoreTrendFill)" />
          <path
            d={linePath}
            fill="none"
            stroke="var(--ember)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {points.map((p, i) => (
            <circle
              key={p.id}
              cx={x(i)}
              cy={y(p.score)}
              r="3.4"
              fill="var(--ember)"
              stroke="var(--bg-elev)"
              strokeWidth="1.5"
            />
          ))}
        </svg>

        <div className="mt-2 flex justify-between font-mono text-[10.5px] text-ink-dim">
          {points.map((p) => (
            <span key={p.id} className="tabular-nums">
              {formatDay(p.fetchedAt)}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDay(d: Date): string {
  return new Date(d).toISOString().slice(5, 10);
}
