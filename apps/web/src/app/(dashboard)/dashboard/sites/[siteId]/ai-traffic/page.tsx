import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import type { AgentLabel } from '@/lib/analytics/classify-agent';
import { getAgentTrafficSummary } from '@/lib/db/queries/agent-visits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
  readonly searchParams: Promise<{ readonly days?: string }>;
}

/** Fixed agent hues from the AI-Traffic design — one meaning each. */
const LABEL_META: Record<AgentLabel, { name: string; color: string }> = {
  chatgpt: { name: 'ChatGPT', color: '#2F6FED' },
  perplexity: { name: 'Perplexity', color: '#7C3AED' },
  gemini: { name: 'Gemini', color: '#0891B2' },
  claude: { name: 'Claude', color: '#D97706' },
  'other-bot': { name: 'Other bots', color: '#15803D' },
  human: { name: 'Human', color: '#C4C3BC' },
};

const RANGES: ReadonlyArray<{ days: number; label: string }> = [
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

/**
 * Functional AI Traffic page, ported from AI-Traffic.dc.html. Wires the
 * real per-site agent-visit rollup (`getAgentTrafficSummary`): total
 * agent requests, the share of all traffic that is AI, and a per-agent
 * breakdown that drills into `/traffic/:label`. The range toggle drives
 * the query's `windowDays` through a `?days=` param so this stays a
 * server component.
 *
 * The design's stacked-area time series needs per-day counts the summary
 * query does not return, so it is omitted rather than faked. Ingest-token
 * rotation lives on Settings; here we show integration status and the
 * middleware wire-up.
 */
export default async function AiTrafficPage({ params, searchParams }: PageProps) {
  const { siteId } = await params;
  const { days: daysRaw } = await searchParams;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const windowDays = parseDays(daysRaw);
  const summary = await getAgentTrafficSummary(site.id, windowDays);
  const integrated = site.ingestToken !== null;
  const host = stripScheme(site.url);

  const aiTotal = summary.buckets
    .filter((b) => b.label !== 'human')
    .reduce((sum, b) => sum + b.count, 0);
  const aiSharePct = summary.total === 0 ? 0 : Math.round((aiTotal / summary.total) * 100);
  const max = Math.max(...summary.buckets.map((b) => b.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* HEADER */}
      <div
        className="afx-phead"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            AI Traffic
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
            Which AI agents are actually fetching{' '}
            <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>{host}</span>
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 8,
            flex: '0 0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              background: PC.hover,
              border: `1px solid ${PC.line}`,
              borderRadius: 8,
              padding: 2,
            }}
          >
            {RANGES.map((r) => {
              const on = r.days === windowDays;
              return (
                <Link
                  key={r.days}
                  href={`/dashboard/sites/${site.id}/ai-traffic?days=${r.days}`}
                  style={{
                    fontFamily: MONO,
                    fontSize: 12.5,
                    fontWeight: 500,
                    height: 28,
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0 13px',
                    border: `1px solid ${on ? '#DEDDD7' : 'transparent'}`,
                    background: on ? PC.card : 'transparent',
                    color: on ? PC.ink : PC.muted,
                    borderRadius: 6,
                    textDecoration: 'none',
                  }}
                >
                  {r.label}
                </Link>
              );
            })}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim }}>
            Free with every site.
          </span>
        </div>
      </div>

      {/* SUMMARY LINE */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '40ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '16px 20px',
          fontFamily: MONO,
          fontSize: 13,
          color: PC.muted,
        }}
      >
        <span style={{ color: PC.ink, fontWeight: 500, fontSize: 15 }}>
          {aiTotal.toLocaleString()}
        </span>{' '}
        agent requests · last {windowDays} days
        {summary.total > 0 ? (
          <>
            {' '}
            · <span style={{ color: PC.ink }}>{aiSharePct}%</span> of{' '}
            {summary.total.toLocaleString()} total requests
          </>
        ) : null}
      </div>

      {/* TWO COLUMNS */}
      <div
        className="afx-cols"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '80ms',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 18,
          alignItems: 'stretch',
        }}
      >
        {/* BY AGENT */}
        <div
          style={{
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
            By agent
          </span>
          {summary.total === 0 ? (
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: PC.muted }}>
              {integrated
                ? 'No requests recorded yet in this window. Once your middleware forwards a hit, agents show up here classified by engine.'
                : 'No data yet. Wire up tracking on the right to start classifying every agent hit.'}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {summary.buckets.map((b) => {
                const meta = LABEL_META[b.label];
                const pct = summary.total === 0 ? 0 : Math.round((b.count / summary.total) * 100);
                const barPct = b.count === 0 ? 0 : Math.max(2, Math.round((b.count / max) * 100));
                return (
                  <AgentRow
                    key={b.label}
                    href={b.count > 0 ? `/dashboard/sites/${site.id}/traffic/${b.label}` : null}
                    color={meta.color}
                    name={meta.name}
                    count={b.count}
                    pct={pct}
                    barPct={barPct}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* WIRE UP TRACKING */}
        <div
          style={{
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
              Wire up tracking
            </span>
            <span style={{ fontSize: 13, color: PC.muted }}>
              Add one middleware and we classify every agent hit, server-side.
            </span>
          </div>

          <pre
            style={{
              margin: 0,
              background: PC.hover,
              border: `1px solid ${PC.line}`,
              borderRadius: 10,
              padding: '14px 16px',
              overflow: 'auto',
              fontFamily: MONO,
              fontSize: 12,
              lineHeight: 1.7,
              color: PC.ink,
            }}
          >
            {`// middleware.ts
import { afx } from '@answerfox/edge'

export const middleware = afx.track({
  token: process.env.AFX_INGEST_TOKEN,
})

export const config = { matcher: '/:path*' }`}
          </pre>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: PC.dim,
              }}
            >
              Ingest token
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <code
                style={{
                  flex: '1 1 160px',
                  minWidth: 160,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: integrated ? PC.ink : PC.dim,
                  background: PC.hover,
                  border: `1px solid ${PC.line}`,
                  borderRadius: 8,
                  padding: '9px 12px',
                }}
              >
                {integrated ? 'afx_live_••••••••' : 'not minted yet'}
              </code>
              <Link
                href={`/dashboard/sites/${site.id}/settings`}
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 38,
                  padding: '0 14px',
                  background: PC.ink,
                  borderRadius: 8,
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FAFAF8',
                  textDecoration: 'none',
                }}
              >
                {integrated ? 'Manage on Settings' : 'Mint on Settings'}
              </Link>
            </div>
          </div>

          <div
            style={{
              marginTop: 'auto',
              borderTop: `1px solid ${PC.line}`,
              paddingTop: 12,
              fontFamily: MONO,
              fontSize: 11.5,
              color: PC.dim,
            }}
          >
            {integrated
              ? 'Server-side only — no client script, no cookies.'
              : 'Server-side only. Mint a token on Settings, then paste it into your middleware.'}
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentRow({
  href,
  color,
  name,
  count,
  pct,
  barPct,
}: {
  href: string | null;
  color: string;
  name: string;
  count: number;
  pct: number;
  barPct: number;
}) {
  const inner: ReactNode = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{ width: 10, height: 10, borderRadius: 3, background: color, flex: '0 0 auto' }}
        />
        <span
          style={{ fontSize: 13.5, fontWeight: 500, color: PC.ink, flex: '1 1 auto', minWidth: 0 }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 13,
            color: PC.ink,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {count.toLocaleString()}
        </span>
        <span
          style={{ fontFamily: MONO, fontSize: 12, color: PC.dim, width: 40, textAlign: 'right' }}
        >
          {pct}%
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 4, background: '#F2F1EC', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 4 }} />
      </div>
    </div>
  );

  if (href === null) {
    return <div style={{ opacity: 0.7 }}>{inner}</div>;
  }
  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  );
}

export const dynamic = 'force-dynamic';

function parseDays(raw: string | undefined): number {
  const n = Number(raw);
  if (n === 30 || n === 90) return n;
  return 7;
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
