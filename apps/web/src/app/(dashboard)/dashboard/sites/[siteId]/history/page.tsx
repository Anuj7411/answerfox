import { ArMiniChip } from '@/components/dashboard/ar-mini-chip';
import { ScoreBandChip } from '@/components/dashboard/score-band-chip';
import { listAuditHistoryForSite } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

export default async function AuditHistoryPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const audits = await listAuditHistoryForSite(siteId);

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="font-mono text-[12px] text-ink-muted">
          <Link href={`/dashboard/sites/${site.id}`} className="hover:underline">
            ← {site.name}
          </Link>
        </p>
        <h1 className="t-hero mt-2 text-3xl">Audit history</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-muted">
          {audits.length === 0
            ? 'No audits recorded yet.'
            : `${audits.length} audit${audits.length === 1 ? '' : 's'} on ${site.url}, newest first.`}
        </p>
      </div>

      {audits.length === 0 ? (
        <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
          <p className="text-sm text-ink-muted">
            Run an audit to start building history. Scheduled audits land here automatically.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-ink/10 bg-slate-base/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink-dim">
                  <th className="px-5 py-3 font-mono font-normal">When</th>
                  <th className="px-5 py-3 font-mono font-normal">Score</th>
                  <th className="px-5 py-3 font-mono font-normal">AR</th>
                  <th className="px-5 py-3 font-mono font-normal">Pass</th>
                  <th className="px-5 py-3 font-mono font-normal">Fail</th>
                  <th className="px-5 py-3 font-mono font-normal">Warn</th>
                </tr>
              </thead>
              <tbody>
                {audits.map((a) => (
                  <tr key={a.id} className="border-b border-ink/5 align-middle last:border-b-0">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-ink-muted">
                      {formatRelativeTime(a.fetchedAt)}
                      <span className="ml-2 text-[10.5px] text-ink-dim">
                        {new Date(a.fetchedAt).toISOString().slice(0, 16).replace('T', ' ')} UTC
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <ScoreBandChip score={a.score} band={a.band} />
                    </td>
                    <td className="px-5 py-3">
                      <ArMiniChip agentReadinessScore={a.agentReadinessScore} />
                    </td>
                    <td className="px-5 py-3 font-mono tabular-nums text-emerald-700">
                      {a.passCount}
                    </td>
                    <td className="px-5 py-3 font-mono tabular-nums text-red-700">{a.failCount}</td>
                    <td className="px-5 py-3 font-mono tabular-nums text-amber-700">
                      {a.warnCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
