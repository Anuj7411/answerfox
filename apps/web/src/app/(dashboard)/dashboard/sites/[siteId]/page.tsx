import { AgentReadinessHero } from '@/components/dashboard/agent-readiness-hero';
import { AuditNowButton } from '@/components/dashboard/audit-now-button';
import { getLatestAuditForSite, listFindingsForAudit } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
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

export default async function SiteDetailPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const latest = await getLatestAuditForSite(site.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[12px] text-ink-muted">
            <Link href="/dashboard/sites" className="hover:underline">
              ← All sites
            </Link>
          </p>
          <h1 className="t-hero mt-2 text-3xl">{site.name}</h1>
          <p className="mt-1 truncate font-mono text-[13px] text-ink-muted">{site.url}</p>
        </div>
        <AuditNowButton siteId={site.id} variant="full" />
      </div>

      {latest === null ? (
        <section className="glass rounded-2xl border border-ink/10 p-8">
          <h2 className="text-xl font-semibold">No audits yet</h2>
          <p className="mt-3 max-w-[480px] font-body text-ink-muted">
            Run your first audit to see how this site scores on Agent Readiness, SEO, AEO, and GEO.
          </p>
        </section>
      ) : (
        <LatestAuditView auditId={latest.id} auditSummary={latest} />
      )}
    </div>
  );
}

interface LatestAuditViewProps {
  readonly auditId: string;
  readonly auditSummary: {
    readonly score: number;
    readonly band: 'critical' | 'weak' | 'average' | 'strong' | 'excellent';
    readonly passCount: number;
    readonly failCount: number;
    readonly warnCount: number;
    readonly skipCount: number;
    readonly gatePageDetected: boolean;
    readonly agentReadinessScore: number;
    readonly fetchedAt: Date;
  };
}

async function LatestAuditView({ auditId, auditSummary }: LatestAuditViewProps) {
  const findings = await listFindingsForAudit(auditId);

  // Lead with agent-readiness findings regardless of severity — that's
  // the wedge. Then the rest, severity-ordered as before.
  const agentReadinessFails = findings.filter(
    (f) => f.category === 'agent-readiness' && f.status !== 'pass',
  );
  const otherGrouped = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    items: findings.filter(
      (f) => f.severity === sev && f.status !== 'pass' && f.category !== 'agent-readiness',
    ),
  })).filter((g) => g.items.length > 0);

  const totalChecks =
    auditSummary.passCount +
    auditSummary.failCount +
    auditSummary.warnCount +
    auditSummary.skipCount;

  return (
    <div className="space-y-8">
      {auditSummary.gatePageDetected && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-900">Gate page detected</p>
          <p className="mt-1 text-sm text-amber-900/90">
            This URL looks like a logged-out gate (login wall). The low score reflects an
            intentionally minimal page, not a broken site. Audit your real landing page for a
            meaningful score.
          </p>
        </div>
      )}

      <AgentReadinessHero
        agentReadinessScore={auditSummary.agentReadinessScore}
        score={auditSummary.score}
        band={auditSummary.band}
      />

      <section className="rounded-xl border border-ink/10 bg-slate-base/40 px-5 py-4">
        <p className="font-mono text-[12.5px] text-ink-muted">
          <span className="font-semibold text-ink">{totalChecks} checks</span>
          {' · '}
          <span className="text-emerald-700">{auditSummary.passCount} pass</span>
          {' · '}
          <span className="text-red-700">{auditSummary.failCount} fail</span>
          {' · '}
          <span className="text-amber-700">{auditSummary.warnCount} warn</span>
          {auditSummary.skipCount > 0 ? ` · ${auditSummary.skipCount} skip` : ''}
          {' · '}
          audited {auditSummary.fetchedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC
        </p>
      </section>

      {agentReadinessFails.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-semibold">Agent Readiness — fix these first</h2>
            <p className="font-mono text-[12px] text-ink-muted">
              {agentReadinessFails.length} of 6 manifests missing
            </p>
          </div>
          <ul className="space-y-2">
            {agentReadinessFails.map((f) => (
              <li key={f.id} className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-mono text-[13px] font-semibold">{f.checkId}</p>
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
              </li>
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
                  <li
                    key={f.id}
                    className={`rounded-lg border px-4 py-3 ${severityStyle[group.severity]}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-mono text-[13px] font-semibold">
                        {f.checkId}
                        <span className="ml-2 text-ink-muted">· category {f.category}</span>
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
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
