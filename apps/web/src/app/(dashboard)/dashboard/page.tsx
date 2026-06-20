import { HomeAiTrafficTile } from '@/components/dashboard/home-ai-traffic-tile';
import { getAgentTrafficSummaryForUser } from '@/lib/db/queries/agent-visits';
import { listFindingsForAudit, listLatestAuditsForUser } from '@/lib/db/queries/audits';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';

/**
 * Dashboard home. Renders only what real audit data supports today:
 * insight banner, three real metric cards (Aggregate, Agent Readiness,
 * Failing findings), and the findings list. Tiles for trend, AI answer
 * visibility, quota ring, and scheduled audits land when the underlying
 * data flows exist — not before.
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

  const primarySite = sites[0];
  if (primarySite === undefined) return null;
  const latestAudits = await listLatestAuditsForUser(user.id);
  const primaryAudit = latestAudits.find((a) => a.siteId === primarySite.id);

  if (!primaryAudit) {
    return <NoAuditState site={primarySite} />;
  }

  const [findings, aiTraffic] = await Promise.all([
    listFindingsForAudit(primaryAudit.id),
    getAgentTrafficSummaryForUser(user.id),
  ]);
  const failedFindings = findings.filter((f) => f.status === 'fail');
  const topFour = failedFindings.slice(0, 4);
  const topFailure = failedFindings[0];

  return (
    <div className="db-page">
      <div className="insight">
        <span className="ix">
          <SparkIcon />
        </span>
        <div className="body">
          <span className="eyebrow">
            <span className="dot" /> Priority insight
          </span>
          <div className="h">
            {topFailure ? (
              <>
                Start with <b>{topFailure.checkId}</b> — {shortReason(topFailure)}.
              </>
            ) : (
              <>
                Nothing failing on <b>{primarySite.name}</b> right now. Re-audit to confirm.
              </>
            )}
          </div>
          <p className="p">AI writes the fix, you review the diff, we open the pull request.</p>
        </div>
        <div className="acts">
          <Link href={`/dashboard/sites/${primarySite.id}`} className="btn btn-solid">
            {topFailure ? 'Investigate' : 'Re-audit'}
          </Link>
        </div>
      </div>

      <div className="db-metrics">
        <MetricCard
          label="Aggregate"
          value={primaryAudit.score}
          denominator={100}
          band={bandLabel(primaryAudit.band)}
          accentAggregate
        />
        <MetricCard
          label="Agent Readiness"
          value={primaryAudit.agentReadinessScore}
          denominator={8}
          band={`${primaryAudit.agentReadinessScore} of 8 manifests`}
        />
        <MetricCard
          label="Failing"
          value={failedFindings.length}
          band="across all 50 checks"
          isCount
        />
      </div>

      <HomeAiTrafficTile summary={aiTraffic} />

      <div className="db-bento">
        <div className="tile db-find-tile">
          <div className="tile-h">
            <h3 className="t-card">Recent findings</h3>
            <span className="meta">
              {failedFindings.length === 0 ? 'All clear' : `${failedFindings.length} failing`}
            </span>
          </div>
          {topFour.length === 0 ? (
            <p className="empty">No failing findings right now. Re-audit to recheck.</p>
          ) : (
            topFour.map((f) => (
              <Link key={f.id} href={`/dashboard/sites/${primarySite.id}`} className="find-row">
                <span className="find-id">{f.checkId}</span>
                <span className="find-txt">{shortReason(f)}</span>
                <span className={`sev ${severityClass(f.severity)}`}>
                  {severityLabel(f.severity)}
                </span>
              </Link>
            ))
          )}
          {failedFindings.length > 4 && (
            <div className="tile-foot">
              <Link href={`/dashboard/sites/${primarySite.id}`} className="view-all">
                View all {failedFindings.length} findings &rarr;
              </Link>
            </div>
          )}
        </div>

        <div className="tile db-next-side">
          <div className="tile-h">
            <h3 className="t-card">{primarySite.name}</h3>
            <span className="meta">Latest audit</span>
          </div>
          <dl className="db-meta">
            <div>
              <dt>Fetched</dt>
              <dd>{formatRelativeTime(primaryAudit.fetchedAt)}</dd>
            </div>
            <div>
              <dt>Passing</dt>
              <dd>{primaryAudit.passCount}</dd>
            </div>
            <div>
              <dt>Failing</dt>
              <dd>{primaryAudit.failCount}</dd>
            </div>
            <div>
              <dt>Warnings</dt>
              <dd>{primaryAudit.warnCount}</dd>
            </div>
          </dl>
          <div className="tile-actions">
            <Link href={`/dashboard/sites/${primarySite.id}`} className="btn btn-solid">
              Open site
            </Link>
            <Link href="/dashboard/sites" className="btn btn-quiet">
              All sites
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Sub-components
   ============================================================ */

function EmptyState({ userName }: { userName: string | null | undefined }) {
  return (
    <div className="db-page">
      <section className="db-empty">
        <span className="eyebrow">
          <span className="dot" /> Welcome
        </span>
        <h1 className="t-hero">Welcome, {userName ?? 'there'}.</h1>
        <p className="lede">
          Add your first site to run a 50-check audit across SEO, AEO, GEO, and Agent Readiness.
        </p>
        <div className="db-empty-actions">
          <Link href="/dashboard/sites/new" className="btn btn-solid">
            Add a site
          </Link>
          <code className="db-empty-cli">npx @answerfox/cli audit your-site.com</code>
        </div>
      </section>
    </div>
  );
}

function NoAuditState({ site }: { site: { id: string; name: string } }) {
  return (
    <div className="db-page">
      <section className="db-empty">
        <span className="eyebrow">
          <span className="dot" /> Ready to audit
        </span>
        <h1 className="t-hero">Run your first audit on {site.name}.</h1>
        <p className="lede">
          Answerfox runs 50 checks across SEO, AEO, GEO, and Agent Readiness, then surfaces exactly
          what to fix first.
        </p>
        <div className="db-empty-actions">
          <Link href={`/dashboard/sites/${site.id}`} className="btn btn-solid">
            Run audit
          </Link>
          <Link href="/dashboard/sites/new" className="btn btn-quiet">
            Add another site
          </Link>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  denominator,
  band,
  accentAggregate = false,
  isCount = false,
}: {
  label: string;
  value: number;
  denominator?: number;
  band: string;
  accentAggregate?: boolean;
  isCount?: boolean;
}) {
  const pct =
    !isCount && denominator !== undefined ? Math.round((value / denominator) * 100) : null;
  return (
    <div className={`sc-card${accentAggregate ? ' agg' : ''}`}>
      <div className="sc-top">
        <span className="sc-lbl">{label}</span>
        <span className="sc-band">{band}</span>
      </div>
      <div className="sc-num">
        {value}
        {denominator !== undefined && <span className="o100">/{denominator}</span>}
      </div>
      {pct !== null && (
        <div className="sc-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}

function SparkIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>spark</title>
      <path d="M10 2l1.6 4.8L16.5 8l-4.9 1.2L10 14l-1.6-4.8L3.5 8l4.9-1.2z" />
    </svg>
  );
}

/* ============================================================
   Helpers
   ============================================================ */

function severityClass(severity: 'critical' | 'high' | 'medium' | 'low'): 'high' | 'med' | 'low' {
  if (severity === 'critical' || severity === 'high') return 'high';
  if (severity === 'medium') return 'med';
  return 'low';
}

function severityLabel(severity: 'critical' | 'high' | 'medium' | 'low'): string {
  if (severity === 'critical') return 'Critical';
  if (severity === 'high') return 'High';
  if (severity === 'medium') return 'Med';
  return 'Low';
}

function bandLabel(band: string): string {
  return band.charAt(0).toUpperCase() + band.slice(1).toLowerCase();
}

function shortReason(f: { fixRecommendation: string | null; checkId: string }): string {
  const raw = f.fixRecommendation ?? f.checkId;
  const firstSentence = raw.split(/(?<=[.!?])\s/)[0] ?? raw;
  return firstSentence.length > 80 ? `${firstSentence.slice(0, 77)}…` : firstSentence;
}

function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diff = Math.max(0, now - then);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
