import { AuditDiffCard } from '@/components/dashboard/audit-diff-card';
import { diffAudits } from '@/lib/audit/diff-audits';
import { getAuditForUser, listFindingsForAudit } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{
    readonly siteId: string;
    readonly fromAuditId: string;
    readonly toAuditId: string;
  }>;
}

/**
 * Compare any two audits for a site. URL shape uses path params
 * (`/compare/<from>/<to>`) so the comparison is shareable + bookmarkable
 * and the browser back button does the obvious thing.
 *
 * Ownership: both audits must belong to a site the caller owns, AND
 * both must belong to the same site (the one in the URL). Anything
 * else 404s so neither existence nor cross-site relationships leak.
 *
 * "from" is the EARLIER audit, "to" is the LATER audit. The diff card
 * surfaces deltas, new failures (regressions since `from`), and fixed
 * checks (improvements since `from`).
 */
export default async function CompareAuditsPage({ params }: PageProps) {
  const { siteId, fromAuditId, toAuditId } = await params;

  if (fromAuditId === toAuditId) {
    notFound();
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const [site, fromAudit, toAudit] = await Promise.all([
    getSiteForUser(siteId, user.id),
    getAuditForUser(fromAuditId, user.id),
    getAuditForUser(toAuditId, user.id),
  ]);

  if (site === null || fromAudit === null || toAudit === null) {
    notFound();
  }
  if (fromAudit.siteId !== siteId || toAudit.siteId !== siteId) {
    notFound();
  }

  // Enforce the from < to ordering so the diff card reads correctly.
  const [previous, latest] =
    fromAudit.fetchedAt <= toAudit.fetchedAt ? [fromAudit, toAudit] : [toAudit, fromAudit];

  const [previousFindings, latestFindings] = await Promise.all([
    listFindingsForAudit(previous.id),
    listFindingsForAudit(latest.id),
  ]);

  const diff = diffAudits({
    previous: {
      score: previous.score,
      agentReadinessScore: previous.agentReadinessScore,
      fetchedAt: previous.fetchedAt,
    },
    latest: {
      score: latest.score,
      agentReadinessScore: latest.agentReadinessScore,
      fetchedAt: latest.fetchedAt,
    },
    previousFindings,
    latestFindings,
  });

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="font-mono text-[12px] text-ink-muted">
          <Link href={`/dashboard/sites/${site.id}/history`} className="hover:underline">
            ← History for {site.name}
          </Link>
        </p>
        <h1 className="t-hero mt-2 text-3xl">Compare audits</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-muted">
          {previous.fetchedAt.toISOString().slice(0, 10)} →{' '}
          {latest.fetchedAt.toISOString().slice(0, 10)} on {site.url}
        </p>
      </div>

      <AuditDiffCard diff={diff} />

      <section className="grid gap-4 md:grid-cols-2">
        <AuditSummaryBlock label="From" audit={previous} />
        <AuditSummaryBlock label="To" audit={latest} />
      </section>
    </div>
  );
}

interface AuditSummaryBlockProps {
  readonly label: string;
  readonly audit: {
    readonly fetchedAt: Date;
    readonly score: number;
    readonly agentReadinessScore: number;
    readonly passCount: number;
    readonly failCount: number;
    readonly warnCount: number;
    readonly skipCount: number;
  };
}

function AuditSummaryBlock({ label, audit }: AuditSummaryBlockProps) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-slate-base/40 p-5">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="mt-2 font-mono text-[12.5px] text-ink-muted">
        {audit.fetchedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
        <dt className="text-ink-dim">Score</dt>
        <dd className="text-right font-mono tabular-nums text-ink">{audit.score}/100</dd>
        <dt className="text-ink-dim">Agent Readiness</dt>
        <dd className="text-right font-mono tabular-nums text-ink">
          {audit.agentReadinessScore}/8
        </dd>
        <dt className="text-ink-dim">Pass</dt>
        <dd className="text-right font-mono tabular-nums text-emerald-700">{audit.passCount}</dd>
        <dt className="text-ink-dim">Fail</dt>
        <dd className="text-right font-mono tabular-nums text-red-700">{audit.failCount}</dd>
        <dt className="text-ink-dim">Warn</dt>
        <dd className="text-right font-mono tabular-nums text-amber-700">{audit.warnCount}</dd>
        {audit.skipCount > 0 && (
          <>
            <dt className="text-ink-dim">Skip</dt>
            <dd className="text-right font-mono tabular-nums text-ink-dim">{audit.skipCount}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
