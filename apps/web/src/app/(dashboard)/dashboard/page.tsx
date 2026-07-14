import { PortfolioRing } from '@/components/dashboard/site-overview/portfolio-ring';
import {
  BODY,
  DISPLAY,
  MONO,
  PC,
  bandTone,
  cardLabel,
} from '@/components/dashboard/site-overview/porcelain';
import { getAgentTrafficSummaryForUser } from '@/lib/db/queries/agent-visits';
import { listLatestAuditsForUser } from '@/lib/db/queries/audits';
import { listSitesForUser } from '@/lib/db/queries/sites';
import type { Site } from '@/lib/db/schema/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import type { CSSProperties } from 'react';

/**
 * Dashboard home (Porcelain). Cross-site portfolio view: a readiness ring
 * + needs-attention list, a grid of site cards, and a bottom row (AI
 * traffic + recent audits). Every number is real — sites, per-site latest
 * audit scores, and the agent-traffic rollup. No fabricated activity feed
 * or PR counters; those land when the underlying data exists.
 */
export default async function DashboardHome() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const sites = await listSitesForUser(user.id);
  if (sites.length === 0) {
    return <EmptyState userName={(user.user_metadata?.name as string | undefined) ?? user.email} />;
  }

  const [latestAudits, aiTraffic] = await Promise.all([
    listLatestAuditsForUser(user.id),
    getAgentTrafficSummaryForUser(user.id),
  ]);
  const auditBySite = new Map(latestAudits.map((a) => [a.siteId, a]));
  const scored = sites
    .map((s) => ({ site: s, audit: auditBySite.get(s.id) }))
    .filter((row): row is { site: Site; audit: NonNullable<typeof row.audit> } =>
      row.audit !== undefined,
    );

  if (scored.length === 0) {
    const first = sites[0];
    if (first === undefined) return null;
    return <NoAuditState site={first} />;
  }

  const portfolioScore = Math.round(
    scored.reduce((sum, r) => sum + r.audit.score, 0) / scored.length,
  );
  const portfolioColor = bandTone(bandFromScore(portfolioScore)).color;
  const verifiedCount = sites.filter((s) => s.verificationStatusValue === 'verified').length;

  // "Needs attention" = weakest scorers first (weak/critical band or a
  // failing-heavy run). Cap at 3 so the hero stays scannable.
  const attention = [...scored]
    .filter((r) => r.audit.band === 'weak' || r.audit.band === 'critical' || r.audit.failCount > 0)
    .sort((a, b) => a.audit.score - b.audit.score)
    .slice(0, 3);

  const recent = [...scored]
    .sort((a, b) => b.audit.fetchedAt.getTime() - a.audit.fetchedAt.getTime())
    .slice(0, 8);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* PAGE HEADER */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
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
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            Overview
          </h1>
          <p style={{ margin: '6px 0 0', fontFamily: MONO, fontSize: 13, color: PC.muted }}>
            {sites.length} site{sites.length === 1 ? '' : 's'} · {verifiedCount} verified
          </p>
        </div>
        <Link href="/dashboard/sites" style={ghostButton}>
          All sites →
        </Link>
      </div>

      {/* HERO — portfolio ring + needs attention */}
      <div
        className="afx-hero"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '40ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: 24,
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: 32,
          alignItems: 'stretch',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <span style={{ ...cardLabel, letterSpacing: '.1em' }}>Portfolio readiness</span>
          <PortfolioRing value={portfolioScore} color={portfolioColor} />
          <div style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.7, color: PC.muted }}>
            {sites.length} site{sites.length === 1 ? '' : 's'}
            <br />
            {verifiedCount} verified
            <br />
            {attention.length} need attention
          </div>
        </div>

        <div
          className="afx-hero-right"
          style={{
            borderLeft: `1px solid ${PC.line}`,
            paddingLeft: 32,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <span style={{ ...cardLabel, letterSpacing: '.1em' }}>Needs attention</span>
          {attention.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 16px',
                border: `1px solid ${PC.line}`,
                borderRadius: 8,
                background: PC.greenWash,
              }}
            >
              <Dot color={PC.green} size={8} />
              <span style={{ fontSize: 14, color: PC.ink2 }}>
                All {scored.length} audited sites are in good shape. Nothing failing right now.
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {attention.map((r) => {
                const tone = bandTone(r.audit.band);
                return (
                  <Link
                    key={r.site.id}
                    href={`/dashboard/sites/${r.site.id}`}
                    className="afx-attn-row"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '14px 16px',
                      border: `1px solid ${PC.line}`,
                      borderRadius: 8,
                      textDecoration: 'none',
                    }}
                  >
                    <Dot color={tone.color} size={8} />
                    <span style={{ fontWeight: 600, fontSize: 14, color: PC.ink, flex: '0 0 auto' }}>
                      {r.site.name}
                    </span>
                    <span style={bandChip(tone.color)}>
                      {r.audit.band} {r.audit.score}
                    </span>
                    <span
                      style={{ fontSize: 14, color: PC.muted, flex: '1 1 auto', minWidth: 160 }}
                    >
                      {r.audit.failCount} failing · {r.audit.agentReadinessScore}/8 agent manifests
                    </span>
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 13,
                        fontWeight: 500,
                        color: PC.blazeDeep,
                        flex: '0 0 auto',
                      }}
                    >
                      Review →
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SITES AT A GLANCE */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '80ms',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: PC.ink }}>
            Your sites
          </span>
          <span style={{ ...cardLabel, letterSpacing: '.06em' }}>{sites.length} total</span>
        </div>
        <div
          className="afx-sites"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}
        >
          {sites.map((s) => (
            <SiteCard key={s.id} site={s} audit={auditBySite.get(s.id)} />
          ))}
        </div>
      </div>

      {/* BOTTOM ROW — AI traffic + recent audits */}
      <div
        className="afx-bottom"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '120ms',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <AiTrafficCard traffic={aiTraffic} />
        <RecentAuditsCard rows={recent} />
      </div>
    </div>
  );
}

/* ============================================================
   SITE CARD
   ============================================================ */

function SiteCard({
  site,
  audit,
}: {
  readonly site: Site;
  readonly audit:
    | { score: number; band: string; agentReadinessScore: number; fetchedAt: Date }
    | undefined;
}) {
  const verified = site.verificationStatusValue === 'verified';
  const tone = audit ? bandTone(audit.band) : { label: 'no audit', color: PC.dim };
  return (
    <Link
      href={`/dashboard/sites/${site.id}`}
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        padding: 18,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        textDecoration: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: PC.sidebar,
            border: `1px solid ${PC.line}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 500,
            color: PC.ink,
            flex: '0 0 auto',
          }}
        >
          {site.name.slice(0, 1).toUpperCase()}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.25 }}>
          <span style={ellipsis({ fontWeight: 600, fontSize: 14, color: PC.ink })}>
            {site.name}
          </span>
          <span
            style={ellipsis({ fontFamily: MONO, fontSize: 11, color: PC.dim })}
          >
            {site.repoFullName ?? site.url}
          </span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 22,
            fontWeight: 500,
            color: tone.color,
            letterSpacing: '-.02em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {audit ? audit.score : '—'}
        </span>
        <span style={bandChip(tone.color)}>{tone.label}</span>
        {audit ? (
          <span
            style={{
              marginLeft: 'auto',
              fontFamily: MONO,
              fontSize: 11,
              color: PC.dim,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            AR {audit.agentReadinessScore}/8
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingTop: 12,
          borderTop: `1px solid ${PC.line}`,
          fontFamily: MONO,
          fontSize: 11,
          color: PC.dim,
        }}
      >
        <Dot color={verified ? PC.green : PC.amber} size={6} />
        <span style={{ color: verified ? PC.muted : PC.amber }}>
          {verified ? 'verified' : site.verificationStatusValue}
        </span>
        <span style={{ color: PC.faint }}>·</span>
        <span>{audit ? relativeTime(audit.fetchedAt) : 'never audited'}</span>
        <span
          style={{
            marginLeft: 'auto',
            color: site.installationId !== null ? PC.blazeDeep : PC.dim,
          }}
        >
          {site.installationId !== null ? 'PR mode' : 'audit only'}
        </span>
      </div>
    </Link>
  );
}

/* ============================================================
   BOTTOM ROW CARDS
   ============================================================ */

const ENGINE_META: Record<string, { label: string; color: string }> = {
  chatgpt: { label: 'ChatGPT', color: '#2563EB' },
  perplexity: { label: 'Perplexity', color: '#7C3AED' },
  gemini: { label: 'Gemini', color: '#0891B2' },
  claude: { label: 'Claude', color: '#D97706' },
  'other-bot': { label: 'Other bots', color: '#16A34A' },
  human: { label: 'Human', color: '#64748B' },
};

function AiTrafficCard({
  traffic,
}: {
  readonly traffic: {
    total: number;
    windowDays: number;
    integratedSiteCount: number;
    totalSiteCount: number;
    buckets: ReadonlyArray<{ label: string; count: number }>;
  };
}) {
  const { total } = traffic;
  const agentTotal = traffic.buckets
    .filter((b) => b.label !== 'human')
    .reduce((sum, b) => sum + b.count, 0);
  const agentPct = total > 0 ? Math.round((agentTotal / total) * 100) : 0;

  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: PC.ink }}>
          AI traffic
        </span>
        <span style={{ ...cardLabel, letterSpacing: '.06em' }}>last {traffic.windowDays} days</span>
        <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: PC.dim }}>
          {traffic.integratedSiteCount} of {traffic.totalSiteCount} integrated
        </span>
      </div>

      {total === 0 ? (
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: PC.muted }}>
          No agent visits recorded yet. Mint an ingest token on a site to start seeing which AI
          engines read it.
        </p>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 14, color: PC.ink }}>
            {formatCount(total)} requests ·{' '}
            <span style={{ color: PC.blazeDeep }}>{agentPct}% from AI agents</span>
          </div>
          <div
            style={{
              display: 'flex',
              height: 10,
              borderRadius: 999,
              overflow: 'hidden',
              background: PC.sidebar,
            }}
          >
            {traffic.buckets.map((b) => {
              const pct = total > 0 ? (b.count / total) * 100 : 0;
              if (pct === 0) return null;
              return (
                <span
                  key={b.label}
                  style={{ width: `${pct}%`, background: ENGINE_META[b.label]?.color ?? PC.dim }}
                />
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            {traffic.buckets.map((b) => {
              const meta = ENGINE_META[b.label] ?? { label: b.label, color: PC.dim };
              const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
              return (
                <div
                  key={b.label}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: PC.ink }}
                >
                  <span
                    style={{ width: 8, height: 8, borderRadius: 2, background: meta.color, flex: '0 0 auto' }}
                  />
                  {meta.label}
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: MONO,
                      fontSize: 12,
                      color: PC.ink,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatCount(b.count)}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      color: PC.dim,
                      width: 34,
                      textAlign: 'right',
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function RecentAuditsCard({
  rows,
}: {
  readonly rows: ReadonlyArray<{ site: Site; audit: { score: number; band: string; fetchedAt: Date } }>;
}) {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ flex: '0 0 auto', padding: '18px 20px 12px', borderBottom: `1px solid ${PC.line}` }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: PC.ink }}>
          Recent audits
        </span>
      </div>
      <div>
        {rows.map((r, i) => {
          const tone = bandTone(r.audit.band);
          return (
            <Link
              key={r.site.id}
              href={`/dashboard/sites/${r.site.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${PC.line}`,
                textDecoration: 'none',
              }}
            >
              <Dot color={tone.color} size={8} />
              <span style={{ fontSize: 13, color: PC.ink, flex: '1 1 auto', minWidth: 0 }}>
                {r.site.name} scored{' '}
                <span style={{ fontFamily: MONO, color: tone.color }}>{r.audit.score}</span> ({tone.label})
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim, flex: '0 0 auto' }}>
                {relativeTime(r.audit.fetchedAt)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY / NO-AUDIT STATES
   ============================================================ */

function EmptyState({ userName }: { readonly userName: string | null | undefined }) {
  return (
    <div style={cardStyle(32)}>
      <span style={eyebrow}>
        <Dot color={PC.blaze} size={6} /> Welcome
      </span>
      <h1 style={{ margin: '12px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: PC.ink }}>
        Welcome, {userName ?? 'there'}.
      </h1>
      <p style={{ margin: '10px 0 0', maxWidth: 520, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: PC.muted }}>
        Add your first site to run a 50-check audit across SEO, AEO, GEO, and Agent Readiness.
      </p>
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href="/dashboard/sites/new" style={solidButton}>
          Add a site
        </Link>
        <code style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>
          npx @answerfox/cli audit your-site.com
        </code>
      </div>
    </div>
  );
}

function NoAuditState({ site }: { readonly site: { id: string; name: string } }) {
  return (
    <div style={cardStyle(32)}>
      <span style={eyebrow}>
        <Dot color={PC.blaze} size={6} /> Ready to audit
      </span>
      <h1 style={{ margin: '12px 0 0', fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: PC.ink }}>
        Run your first audit on {site.name}.
      </h1>
      <p style={{ margin: '10px 0 0', maxWidth: 520, fontFamily: BODY, fontSize: 14, lineHeight: 1.5, color: PC.muted }}>
        Answerfox runs 50 checks across SEO, AEO, GEO, and Agent Readiness, then surfaces exactly
        what to fix first.
      </p>
      <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Link href={`/dashboard/sites/${site.id}`} style={solidButton}>
          Run audit
        </Link>
        <Link href="/dashboard/sites/new" style={ghostButton}>
          Add another site
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   SHARED
   ============================================================ */

function Dot({ color, size }: { readonly color: string; readonly size: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, borderRadius: '50%', background: color, flex: '0 0 auto' }}
    />
  );
}

const eyebrow: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: PC.dim,
};

const ghostButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0 14px',
  height: 34,
  background: PC.card,
  border: `1px solid ${PC.line16}`,
  borderRadius: 6,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  color: PC.ink2,
  textDecoration: 'none',
};

const solidButton: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0 16px',
  height: 34,
  background: PC.blaze,
  border: 'none',
  borderRadius: 6,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 600,
  color: PC.ink,
  textDecoration: 'none',
};

function bandChip(color: string): CSSProperties {
  return {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '.04em',
    textTransform: 'uppercase',
    color,
    background: `${color}1a`,
    borderRadius: 6,
    padding: '2px 8px',
  };
}

function ellipsis(base: CSSProperties): CSSProperties {
  return { ...base, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
}

function cardStyle(padding: number): CSSProperties {
  return { background: PC.card, border: `1px solid ${PC.line}`, borderRadius: 12, padding };
}

function bandFromScore(score: number): string {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'strong';
  if (score >= 55) return 'average';
  if (score >= 35) return 'weak';
  return 'critical';
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
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
