import { ArMiniChip } from '@/components/dashboard/ar-mini-chip';
import { AuditNowButton } from '@/components/dashboard/audit-now-button';
import { ScoreBandChip } from '@/components/dashboard/score-band-chip';
import { listLatestAuditsForUser } from '@/lib/db/queries/audits';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';

export default async function SitesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const [sites, latestAudits] = await Promise.all([
    listSitesForUser(user.id),
    listLatestAuditsForUser(user.id),
  ]);
  const latestBySiteId = new Map(latestAudits.map((a) => [a.siteId, a]));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="t-hero text-3xl">Your sites</h1>
          <p className="mt-2 font-body text-ink-muted">
            {sites.length} site{sites.length === 1 ? '' : 's'} tracked.
          </p>
        </div>
        <Link href="/dashboard/sites/new" className="btn btn-solid">
          Add site
        </Link>
      </div>

      {sites.length === 0 ? (
        <section className="glass rounded-2xl border border-ink/10 p-8">
          <h2 className="text-xl font-semibold">No sites yet</h2>
          <p className="mt-3 max-w-[480px] font-body text-ink-muted">
            Add your first site to start tracking SEO, AEO, GEO, and Agent Readiness over time.
          </p>
          <div className="mt-5">
            <Link href="/dashboard/sites/new" className="btn btn-solid">
              Add your first site
            </Link>
          </div>
        </section>
      ) : (
        <ul className="space-y-3">
          {sites.map((site) => {
            const latest = latestBySiteId.get(site.id);
            return (
              <li
                key={site.id}
                className="group rounded-xl border border-ink/10 bg-slate-base/50 p-5 transition-all hover:-translate-y-0.5 hover:border-ember/40 hover:bg-slate-base/70 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/sites/${site.id}`}
                      className="truncate font-semibold transition-colors group-hover:text-ember"
                    >
                      {site.name}
                    </Link>
                    <p className="truncate font-mono text-[12.5px] text-ink-muted">{site.url}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {latest !== undefined && (
                      <>
                        <ArMiniChip agentReadinessScore={latest.agentReadinessScore} />
                        <ScoreBandChip score={latest.score} band={latest.band} />
                      </>
                    )}
                    <span className="font-mono text-[12px] text-ink-muted">
                      {site.lastAuditedAt === null
                        ? 'Not audited yet'
                        : `Audited ${formatRelativeTime(site.lastAuditedAt)}`}
                    </span>
                    <AuditNowButton siteId={site.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/**
 * Tiny relative-time formatter. Falls back to a fixed locale-neutral
 * date for anything older than a week so we don't drift between
 * server and client locales mid-render.
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}
