import { DISPLAY, MONO, PC, bandTone } from '@/components/dashboard/site-overview/porcelain';
import { getLatestAuditForSite, listAuditHistoryForSite } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

export default async function HistoryPage({ params }: PageProps) {
  const { siteId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const audits = await listAuditHistoryForSite(site.id);
  const latest = audits[0] ?? (await getLatestAuditForSite(site.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            History
          </h1>
          <p style={{ margin: '6px 0 0', fontFamily: MONO, fontSize: 13, color: PC.muted }}>
            Every audit of {site.name} · {audits.length} run{audits.length === 1 ? '' : 's'}
          </p>
        </div>
        {latest ? (
          <a href={`/api/sites/${site.id}/audits/${latest.id}/export`} style={ghostBtn} download>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PC.dim2}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export latest
          </a>
        ) : null}
      </div>

      {audits.length === 0 ? (
        <div style={card(40)}>
          <p style={{ margin: 0, textAlign: 'center', fontSize: 14, color: PC.muted }}>
            No audits yet. Run an audit to start building history.
          </p>
        </div>
      ) : (
        <>
          <TrendCard audits={audits} />
          <RunsTable siteId={site.id} audits={audits} />
        </>
      )}
    </div>
  );
}

type AuditRow = Awaited<ReturnType<typeof listAuditHistoryForSite>>[number];

function TrendCard({ audits }: { readonly audits: readonly AuditRow[] }) {
  const chrono = [...audits].reverse();
  const scores = chrono.map((a) => a.score);
  const now = scores[scores.length - 1] ?? 0;
  const first = scores[0] ?? 0;
  const peak = scores.length > 0 ? Math.max(...scores) : 0;
  const delta = now - first;

  return (
    <div style={card(24)}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
          Readiness over time
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: PC.dim,
          }}
        >
          last {audits.length} audit{audits.length === 1 ? '' : 's'}
        </span>
      </div>
      <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 13, color: PC.muted }}>
        <span style={{ color: PC.ink }}>{now} now</span>
        {' · '}
        <span style={{ color: delta >= 0 ? PC.green : PC.red }}>
          {delta >= 0 ? '+' : ''}
          {delta} over range
        </span>
        {' · '}peak {peak}
      </div>
      <div style={{ marginTop: 16 }}>
        <LineChart scores={scores} />
      </div>
    </div>
  );
}

function LineChart({ scores }: { readonly scores: readonly number[] }) {
  const W = 600;
  const H = 120;
  const pad = 6;
  if (scores.length < 2) {
    return (
      <div
        style={{
          height: H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: MONO,
          fontSize: 12,
          color: PC.dim,
        }}
      >
        Need at least two audits to chart a trend.
      </div>
    );
  }
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const span = max - min || 1;
  const pts = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (s - min) / span) * (H - pad * 2);
    return { x, y };
  });
  const last = pts[pts.length - 1];
  const line = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} ${(W - pad).toFixed(1)},${(H - pad).toFixed(1)} ${pad.toFixed(1)},${(H - pad).toFixed(1)}`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon points={area} fill={PC.greenWash} />
      <polyline
        points={line}
        fill="none"
        stroke={PC.green}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {last ? <circle cx={last.x} cy={last.y} r="3.5" fill={PC.green} /> : null}
    </svg>
  );
}

function RunsTable({
  siteId,
  audits,
}: { readonly siteId: string; readonly audits: readonly AuditRow[] }) {
  const totalRuns = audits.length;
  const idToNumber = new Map<string, number>();
  [...audits].reverse().forEach((a, i) => idToNumber.set(a.id, i + 1));

  const GRID = '0.7fr 1fr 1.1fr 0.7fr 1.2fr 90px';
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${PC.line}`,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
          All runs
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: PC.dim,
          }}
        >
          newest first
        </span>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: GRID,
          gap: 12,
          alignItems: 'center',
          padding: '10px 20px',
          background: '#FCFCFA',
          borderBottom: `1px solid ${PC.line}`,
        }}
      >
        {['Run', 'When', 'Score', 'Δ', 'pass / warn / fail', 'Compare'].map((h, i) => (
          <span
            key={h}
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              color: PC.dim,
              textAlign: i === 5 ? 'right' : 'left',
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {audits.map((a, idx) => {
        const tone = bandTone(a.band);
        const prev = audits[idx + 1];
        const delta = prev ? a.score - prev.score : null;
        return (
          <div
            key={a.id}
            style={{
              display: 'grid',
              gridTemplateColumns: GRID,
              gap: 12,
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: idx === 0 ? 'none' : `1px solid ${PC.line}`,
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
              #{idToNumber.get(a.id) ?? totalRuns - idx}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>
              {relativeTime(a.fetchedAt)}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 15,
                  fontWeight: 600,
                  color: tone.color,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {a.score}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: '.03em',
                  textTransform: 'uppercase',
                  color: tone.color,
                  background: tone.bg,
                  borderRadius: 5,
                  padding: '2px 7px',
                }}
              >
                {a.band}
              </span>
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: delta === null ? PC.dim : delta >= 0 ? PC.green : PC.red,
              }}
            >
              {delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>
              <span style={{ color: PC.green }}>{a.passCount}</span> /{' '}
              <span style={{ color: PC.amber }}>{a.warnCount}</span> /{' '}
              <span style={{ color: PC.red }}>{a.failCount}</span>
            </span>
            <span style={{ textAlign: 'right' }}>
              {prev ? (
                <Link
                  href={`/dashboard/sites/${siteId}/compare/${prev.id}/${a.id}`}
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: PC.blazeDeep,
                    textDecoration: 'none',
                  }}
                >
                  Compare →
                </Link>
              ) : (
                <span style={{ fontFamily: MONO, fontSize: 12, color: PC.faint }}>—</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const ghostBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0 12px',
  height: 34,
  background: PC.card,
  border: `1px solid ${PC.line16}`,
  borderRadius: 6,
  fontFamily: DISPLAY,
  fontSize: 13,
  fontWeight: 500,
  color: PC.ink,
  textDecoration: 'none',
} as const;

function card(padding: number) {
  return {
    background: PC.card,
    border: `1px solid ${PC.line}`,
    borderRadius: 12,
    padding,
  } as const;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}
