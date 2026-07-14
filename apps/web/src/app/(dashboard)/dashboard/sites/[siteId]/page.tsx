import { AgentAnswerPanel } from '@/components/dashboard/agent-answer-panel';
import { AiFixPanel } from '@/components/dashboard/ai-fix-panel';
import { AiTrafficTile } from '@/components/dashboard/ai-traffic-tile';
import { AlertThresholdCard } from '@/components/dashboard/alert-threshold-card';
import { AnalyticsIntegrationCard } from '@/components/dashboard/analytics-integration-card';
import { SiteManagementCard } from '@/components/dashboard/site-management-card';
import { VerificationPanel } from '@/components/dashboard/verification-panel';
import { AnimatedScore } from '@/components/dashboard/site-overview/animated-score';
import {
  BODY,
  DISPLAY,
  MONO,
  PC,
  bandTone,
  cardLabel,
} from '@/components/dashboard/site-overview/porcelain';
import { ScheduleAuditControls } from '@/components/dashboard/site-overview/schedule-audit-controls';
import { XrayOverviewCard } from '@/components/dashboard/site-overview/xray-overview-card';
import { listAgentAnswerReportsForSite } from '@/lib/db/queries/agent-answer-reports';
import { getAgentTrafficSummary } from '@/lib/db/queries/agent-visits';
import {
  getLastTwoAuditsForSite,
  getLatestAuditForSite,
  getRecentAuditScoresForSite,
  listFindingsForAudit,
} from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import type { Finding } from '@/lib/db/schema/findings';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'] as const;
type Severity = (typeof SEVERITY_ORDER)[number];

const severityLabel: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const severityStyle: Record<Severity, string> = {
  critical: 'border-red-300 bg-red-50',
  high: 'border-orange-300 bg-orange-50',
  medium: 'border-amber-300 bg-amber-50',
  low: 'border-slate-300 bg-slate-50',
};

const statusBadgeStyle: Record<string, string> = {
  fail: 'bg-red-100 text-red-900',
  warn: 'bg-amber-100 text-amber-900',
  pass: 'bg-emerald-100 text-emerald-900',
  skip: 'bg-slate-100 text-slate-700',
};

/** A dot color per finding status, for the top-findings preview. */
const statusDot: Record<string, string> = {
  fail: PC.red,
  warn: PC.amber,
  pass: PC.green,
  skip: PC.dim,
};

export default async function SiteDetailPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const verified = site.verificationStatusValue === 'verified';
  const latest = verified ? await getLatestAuditForSite(site.id) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!verified ? (
        <>
          <SiteHeader site={site} />
          <VerificationPanel
            siteId={site.id}
            siteUrl={site.url}
            status={site.verificationStatusValue}
            token={site.verificationToken}
            verifiedMethod={site.verificationMethodValue}
            verifiedAt={site.verifiedAt}
          />
          <PorcelainNote
            title="Audit runs unlock after verification"
            body={`Once we confirm you control ${site.url}, the schedule and Audit now controls appear here and you can run the full Agent Readiness + SEO/AEO/GEO sweep.`}
          />
        </>
      ) : latest === null ? (
        <>
          <SiteHeader
            site={site}
            controls={
              <ScheduleAuditControls siteId={site.id} currentSchedule={site.auditSchedule} />
            }
          />
          <PorcelainNote
            title="No audits yet"
            body="Run your first audit to see how this site scores on Agent Readiness, SEO, AEO, and GEO."
          />
        </>
      ) : (
        <>
          <SiteHeader
            site={site}
            controls={
              <ScheduleAuditControls siteId={site.id} currentSchedule={site.auditSchedule} />
            }
          />
          <ScoreStackBento siteId={site.id} latest={latest} site={site} />
          <StatTiles latest={latest} />
          <XrayOverviewCard siteId={site.id} siteUrl={site.url} />
          <FindingsAuditBento
            siteId={site.id}
            auditId={latest.id}
            fetchedAt={latest.fetchedAt}
            gatePageDetected={latest.gatePageDetected}
            checkTotal={latest.passCount + latest.failCount + latest.warnCount + latest.skipCount}
            schedule={site.auditSchedule}
            plan={site.plan}
            freeLoopUsed={site.freeLoopConsumedAt !== null}
          />

          {/* Interim: the deep panels below move to their own tabs
              (Findings / AI Traffic / Settings) as those pages ship in
              Phase 2. Kept here so the fix loop and controls stay reachable
              during the migration. */}
          <FindingsAndFixes auditId={latest.id} gatePageDetected={latest.gatePageDetected} />
          <AgentAnswerSlot siteId={site.id} siteUrl={site.url} />
          <AnalyticsSlot siteId={site.id} hasToken={site.ingestToken !== null} />
          <AlertThresholdCard siteId={site.id} current={site.alertThreshold} />
          <BillingSlot plan={site.plan} siteId={site.id} userEmail={user.email ?? ''} />
          <SiteManagementCard siteId={site.id} currentName={site.name} />
        </>
      )}
    </div>
  );
}

/* ============================================================
   HEADER
   ============================================================ */

function SiteHeader({
  site,
  controls,
}: {
  readonly site: {
    readonly name: string;
    readonly url: string;
    readonly repoFullName: string | null;
    readonly verificationStatusValue: string;
    readonly plan: string;
  };
  readonly controls?: ReactNode;
}) {
  const verified = site.verificationStatusValue === 'verified';
  const statusColor = verified ? PC.green : PC.amber;
  return (
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
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 26,
              letterSpacing: '-.03em',
              color: PC.ink,
            }}
          >
            {site.name}
          </h1>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 9px',
              background: verified ? PC.greenWash : 'rgba(184,128,28,.12)',
              borderRadius: 999,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: statusColor,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor }} />
            {verified ? 'verified' : site.verificationStatusValue}
          </span>
        </div>
        <div style={{ marginTop: 6, fontFamily: MONO, fontSize: 13, color: PC.muted }}>
          ▸ {site.repoFullName ?? site.url}
        </div>
      </div>
      {controls}
    </div>
  );
}

/* ============================================================
   SCORE + STACK BENTO
   ============================================================ */

async function ScoreStackBento({
  siteId,
  latest,
  site,
}: {
  readonly siteId: string;
  readonly latest: {
    readonly score: number;
    readonly band: string;
    readonly agentReadinessScore: number;
    readonly fetchedAt: Date;
  };
  readonly site: {
    readonly repoFullName: string | null;
    readonly installationId: number | null;
    readonly plan: string;
  };
}) {
  const [lastTwo, recent] = await Promise.all([
    getLastTwoAuditsForSite(siteId),
    getRecentAuditScoresForSite(siteId, 7),
  ]);
  const previousScore = lastTwo.length === 2 ? (lastTwo[1]?.score ?? null) : null;
  const delta = previousScore === null ? null : latest.score - previousScore;
  const tone = bandTone(latest.band);
  // Oldest → newest, so the spark grows left to right like the design.
  const spark = [...recent].reverse().map((r) => r.score);
  const sparkMax = Math.max(1, ...spark);

  return (
    <div
      className="afx-bento"
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: '60ms',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)',
        gap: 16,
      }}
    >
      {/* SCORE CARD */}
      <div style={cardStyle(24)}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={cardLabel}>Answerability</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim }}>
            last · {relativeTime(latest.fetchedAt)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: 8 }}>
          <AnimatedScore value={latest.score} />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              paddingBottom: 6,
              minWidth: 0,
            }}
          >
            <span
              style={{
                alignSelf: 'flex-start',
                padding: '3px 9px',
                background: tone.color === PC.green ? PC.greenWash : `${tone.color}1f`,
                borderRadius: 6,
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: tone.color,
              }}
            >
              {tone.label}
            </span>
            {delta !== null && previousScore !== null ? (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: delta >= 0 ? PC.green : PC.red,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {previousScore} → {latest.score}{' '}
                <span style={{ fontWeight: 500 }}>
                  {delta >= 0 ? '+' : ''}
                  {delta}
                </span>
              </span>
            ) : (
              <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>first run</span>
            )}
            {spark.length > 1 ? (
              <span style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}>
                {spark.map((value, i) => (
                  <span
                    // Spark bars are a fixed positional series; index key is fine.
                    // biome-ignore lint/suspicious/noArrayIndexKey: fixed positional series
                    key={i}
                    style={{
                      width: 5,
                      height: Math.max(4, Math.round((value / sparkMax) * 30)),
                      background: i === spark.length - 1 ? tone.color : PC.faint,
                      borderRadius: 1,
                    }}
                  />
                ))}
              </span>
            ) : null}
          </div>
        </div>
        <div
          style={{
            marginTop: 20,
            paddingTop: 18,
            borderTop: `1px solid ${PC.line}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 34,
              letterSpacing: '-.04em',
              color: PC.ink,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {latest.agentReadinessScore}
            <span style={{ fontSize: 18, color: PC.dim }}> / 8</span>
          </span>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                color: PC.dim,
              }}
            >
              Agent Readiness
            </div>
            <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.4, color: PC.muted }}>
              Scored apart from overall. The agent manifests GPTBot / ClaudeBot look for.
            </div>
          </div>
        </div>
      </div>

      {/* STACK / REPO CARD */}
      <div style={{ ...cardStyle(24), display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={cardLabel}>Fix delivery</span>
          <span
            style={{
              padding: '3px 9px',
              background: site.installationId !== null ? PC.greenWash : PC.sidebar,
              borderRadius: 6,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: site.installationId !== null ? PC.green : PC.dim,
            }}
          >
            {site.installationId !== null ? 'PR mode' : 'audit only'}
          </span>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 17,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            {site.repoFullName ?? 'No repo linked'}
          </span>
          {site.repoFullName !== null ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
              {site.plan === 'paid' ? 'paid' : 'free loop'}
            </span>
          ) : null}
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.5, color: PC.ink2 }}>
          {site.installationId !== null
            ? 'Fixes ship as pull requests. We write structured data, crawler meta, and prerender fallbacks straight into the repo.'
            : 'Link a GitHub repo to get fixes as pull requests instead of copy-paste snippets.'}
        </p>
        <div
          style={{
            marginTop: 16,
            background: PC.sidebar,
            borderRadius: 4,
            padding: '10px 12px',
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.6,
            color: PC.muted,
          }}
        >
          <span style={{ color: PC.blazeDeep }}>why</span>&nbsp;&nbsp;
          {site.installationId !== null
            ? 'installation granted · write access confirmed'
            : 'no installation · fixes are advisory until a repo is connected'}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT TILES
   ============================================================ */

function StatTiles({
  latest,
}: {
  readonly latest: {
    readonly passCount: number;
    readonly failCount: number;
    readonly warnCount: number;
    readonly skipCount: number;
  };
}) {
  const tiles: ReadonlyArray<{ n: number; label: string; color: string; dot: string }> = [
    { n: latest.passCount, label: 'pass', color: PC.ink, dot: PC.green },
    { n: latest.failCount, label: 'fail', color: PC.red, dot: PC.red },
    { n: latest.warnCount, label: 'warn', color: PC.amber, dot: PC.amber },
    { n: latest.skipCount, label: 'skip', color: PC.dim, dot: PC.dim },
  ];
  return (
    <div
      className="afx-tiles"
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: '120ms',
        background: PC.line,
        border: `1px solid ${PC.line}`,
        borderRadius: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(4,1fr)',
        gap: 1,
        overflow: 'hidden',
      }}
    >
      {tiles.map((t) => (
        <div key={t.label} style={{ background: PC.card, padding: '18px 20px' }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: '-.03em',
              color: t.color,
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {t.n}
          </div>
          <div
            style={{
              marginTop: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />
            {t.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   FINDINGS PREVIEW + LATEST AUDIT BENTO
   ============================================================ */

async function FindingsAuditBento({
  siteId,
  auditId,
  fetchedAt,
  gatePageDetected,
  checkTotal,
  schedule,
  plan,
  freeLoopUsed,
}: {
  readonly siteId: string;
  readonly auditId: string;
  readonly fetchedAt: Date;
  readonly gatePageDetected: boolean;
  readonly checkTotal: number;
  readonly schedule: string;
  readonly plan: string;
  readonly freeLoopUsed: boolean;
}) {
  const findings = await listFindingsForAudit(auditId);
  const open = findings.filter((f) => f.status !== 'pass');
  const top = open.slice(0, 3);

  const rows: ReadonlyArray<{ label: string; value: string; color?: string }> = [
    { label: 'when', value: relativeTime(fetchedAt) },
    { label: 'checks', value: String(checkTotal) },
    {
      label: 'gate page',
      value: gatePageDetected ? 'detected' : 'none',
      color: gatePageDetected ? PC.amber : PC.green,
    },
    { label: 'schedule', value: schedule },
    { label: 'plan', value: plan },
    { label: 'free loop', value: freeLoopUsed ? 'used' : 'available' },
  ];

  return (
    <div
      className="afx-bento"
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: '240ms',
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)',
        gap: 16,
      }}
    >
      {/* TOP FINDINGS */}
      <div style={cardStyle(24)}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={cardLabel}>Top findings</span>
          <Link href="#all-findings" style={{ fontFamily: MONO, fontSize: 12, color: PC.blazeDeep }}>
            all {open.length} →
          </Link>
        </div>
        {top.length === 0 ? (
          <p style={{ marginTop: 12, fontSize: 14, color: PC.muted }}>
            No open findings. Every check on the last run passed.
          </p>
        ) : (
          top.map((f, i) => (
            <div
              key={f.id}
              style={{
                marginTop: i === 0 ? 8 : 0,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 0',
                borderBottom: i === top.length - 1 ? 'none' : `1px solid ${PC.line}`,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: statusDot[f.status] ?? PC.dim,
                  flex: '0 0 auto',
                  marginTop: 5,
                }}
              />
              <div style={{ minWidth: 0, flex: '1 1 auto' }}>
                <div style={{ fontSize: 14, lineHeight: 1.4, color: PC.ink2 }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>{f.checkId}</span>
                  &nbsp;&nbsp;{f.evidence ?? f.fixRecommendation ?? f.category}
                </div>
                {f.fixRecommendation !== null && f.evidence !== null ? (
                  <div style={{ marginTop: 4, fontFamily: MONO, fontSize: 12, color: PC.dim }}>
                    {f.fixRecommendation}
                  </div>
                ) : null}
              </div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                  color: severityColor(f.severity),
                  flex: '0 0 auto',
                }}
              >
                {f.severity}
              </span>
            </div>
          ))
        )}
      </div>

      {/* LATEST AUDIT RAIL */}
      <div style={cardStyle(24)}>
        <span style={cardLabel}>Latest audit</span>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column' }}>
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i === rows.length - 1 ? 'none' : `1px solid ${PC.line}`,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  color: PC.dim,
                }}
              >
                {r.label}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: r.color ?? PC.ink,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {r.value}
              </span>
            </div>
          ))}
          <Link
            href={`/dashboard/sites/${siteId}/history`}
            style={{ marginTop: 12, fontFamily: MONO, fontSize: 12, color: PC.blazeDeep }}
          >
            Full history →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   RETAINED (interim) — full findings + fixes, and secondary slots
   ============================================================ */

async function FindingsAndFixes({
  auditId,
  gatePageDetected,
}: {
  readonly auditId: string;
  readonly gatePageDetected: boolean;
}) {
  const findings = await listFindingsForAudit(auditId);

  const agentReadinessFails = findings.filter(
    (f) => f.category === 'agent-readiness' && f.status !== 'pass',
  );
  const otherGrouped = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    items: findings.filter(
      (f) => f.severity === sev && f.status !== 'pass' && f.category !== 'agent-readiness',
    ),
  })).filter((g) => g.items.length > 0);

  return (
    <div id="all-findings" className="space-y-8 scroll-mt-20">
      {gatePageDetected && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-900">Gate page detected</p>
          <p className="mt-1 text-sm text-amber-900/90">
            This URL looks like a logged-out gate (login wall). The low score reflects an
            intentionally minimal page, not a broken site. Audit your real landing page for a
            meaningful score.
          </p>
        </div>
      )}

      {agentReadinessFails.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Agent Readiness — fix these first</h2>
            <p className="font-mono text-[12px] text-ink-muted">
              {agentReadinessFails.length} of 8 manifests missing
            </p>
          </div>
          <ul className="space-y-2">
            {agentReadinessFails.map((f) => (
              <FindingRow key={f.id} f={f} className="border-orange-300 bg-orange-50" />
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Other findings to fix</h2>
        {otherGrouped.length === 0 ? (
          <p className="font-body text-ink-muted">
            No classic-SEO fails or warns. Nice. Run another audit later to catch regressions.
          </p>
        ) : (
          otherGrouped.map((group) => (
            <div key={group.severity} className="space-y-2">
              <h3 className="font-mono text-[13px] uppercase tracking-wide text-ink-muted">
                {severityLabel[group.severity]} ({group.items.length})
              </h3>
              <ul className="space-y-2">
                {group.items.map((f) => (
                  <FindingRow
                    key={f.id}
                    f={f}
                    className={severityStyle[group.severity]}
                    showCategory
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

function FindingRow({
  f,
  className,
  showCategory = false,
}: {
  readonly f: Finding;
  readonly className: string;
  readonly showCategory?: boolean;
}) {
  return (
    <li className={`rounded-lg border px-4 py-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[13px] font-semibold">
          {f.checkId}
          {showCategory ? (
            <span className="ml-2 text-ink-muted">· category {f.category}</span>
          ) : null}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[11px] uppercase ${
            statusBadgeStyle[f.status] ?? 'bg-slate-100 text-slate-700'
          }`}
        >
          {f.status}
        </span>
      </div>
      {f.evidence !== null && (
        <p className="mt-2 text-sm">
          <span className="text-ink-muted">Evidence:</span> {f.evidence}
        </p>
      )}
      {f.fixRecommendation !== null && (
        <p className="mt-1 text-sm">
          <span className="text-ink-muted">Fix:</span> {f.fixRecommendation}
        </p>
      )}
      <AiFixPanel findingId={f.id} checkId={f.checkId} />
    </li>
  );
}

async function AgentAnswerSlot({
  siteId,
  siteUrl,
}: {
  readonly siteId: string;
  readonly siteUrl: string;
}) {
  let answerHistory: { id: string; score: number; gapCount: number; label: string }[] = [];
  try {
    const rows = await listAgentAnswerReportsForSite(siteId);
    answerHistory = rows.map((r) => ({
      id: r.id,
      score: r.answerabilityScore,
      gapCount: r.gapCount,
      label: r.createdAt.toISOString().slice(0, 10),
    }));
  } catch {
    answerHistory = [];
  }
  return <AgentAnswerPanel siteId={siteId} siteUrl={siteUrl} history={answerHistory} />;
}

async function AnalyticsSlot({ siteId, hasToken }: { siteId: string; hasToken: boolean }) {
  const summary = await getAgentTrafficSummary(siteId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <AiTrafficTile summary={summary} integrated={hasToken} />
      <AnalyticsIntegrationCard siteId={siteId} hasToken={hasToken} appUrl={appUrl} />
    </div>
  );
}

function BillingSlot({
  plan,
  siteId,
  userEmail,
}: {
  readonly plan: string;
  readonly siteId: string;
  readonly userEmail: string;
}) {
  const polarProductId = process.env.POLAR_PRODUCT_ID ?? '';
  const polarConfigured =
    process.env.POLAR_ACCESS_TOKEN !== undefined && polarProductId.length > 0;
  const checkoutHref = `/api/checkout?products=${encodeURIComponent(
    polarProductId,
  )}&customerEmail=${encodeURIComponent(userEmail)}&metadata=${encodeURIComponent(
    JSON.stringify({ site_id: siteId }),
  )}`;

  if (plan === 'paid') {
    return (
      <section className="glass rounded-2xl border border-ink/10 p-6">
        <p className="text-[14px] font-semibold">This site is on the paid plan.</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Fixes keep shipping as PRs and drift stays guarded.
        </p>
      </section>
    );
  }
  if (!polarConfigured) return null;
  return (
    <section className="glass rounded-2xl border border-ink/10 p-8">
      <h2 className="text-xl font-semibold">Keep the fixes flowing</h2>
      <p className="mt-2 max-w-[520px] font-body text-ink-muted">
        Private repos get one free fix loop, then $9/mo per repo to keep fixes shipping and staying
        fixed. Public repos are free forever.
      </p>
      <a
        href={checkoutHref}
        className="mt-4 inline-flex rounded-md border border-ember/40 bg-ember/10 px-4 py-2 text-[14px] font-medium hover:bg-ember/20"
      >
        Upgrade this site for $9/mo
      </a>
    </section>
  );
}

/* ============================================================
   SHARED PORCELAIN HELPERS
   ============================================================ */

function PorcelainNote({ title, body }: { readonly title: string; readonly body: string }) {
  return (
    <div style={cardStyle(32)}>
      <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: PC.ink }}>
        {title}
      </h2>
      <p
        style={{
          margin: '12px 0 0',
          maxWidth: 480,
          fontFamily: BODY,
          fontSize: 14,
          lineHeight: 1.5,
          color: PC.muted,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function cardStyle(padding: number): CSSProperties {
  return {
    background: PC.card,
    border: `1px solid ${PC.line}`,
    borderRadius: 8,
    padding,
  };
}

function severityColor(sev: string): string {
  if (sev === 'critical') return PC.red;
  if (sev === 'high') return PC.blazeDeep;
  if (sev === 'medium') return PC.amber;
  return PC.dim;
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
