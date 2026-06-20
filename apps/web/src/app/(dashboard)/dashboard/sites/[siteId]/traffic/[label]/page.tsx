import type { AgentLabel } from '@/lib/analytics/classify-agent';
import { listRecentVisitsForSiteAndLabel } from '@/lib/db/queries/agent-visits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string; readonly label: string }>;
}

const VALID_LABELS: ReadonlyArray<AgentLabel> = [
  'chatgpt',
  'perplexity',
  'gemini',
  'claude',
  'other-bot',
  'human',
];

const LABEL_DISPLAY: Record<AgentLabel, string> = {
  chatgpt: 'ChatGPT',
  perplexity: 'Perplexity',
  gemini: 'Gemini',
  claude: 'Claude',
  'other-bot': 'Other bots',
  human: 'Human',
};

const VISIT_LIMIT = 100;

export default async function TrafficDeepDivePage({ params }: PageProps) {
  const { siteId, label } = await params;

  if (!VALID_LABELS.includes(label as AgentLabel)) {
    notFound();
  }
  const typedLabel = label as AgentLabel;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const visits = await listRecentVisitsForSiteAndLabel(siteId, typedLabel, VISIT_LIMIT);

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <p className="font-mono text-[12px] text-ink-muted">
          <Link href={`/dashboard/sites/${site.id}`} className="hover:underline">
            ← {site.name}
          </Link>
        </p>
        <h1 className="t-hero mt-2 text-3xl">{LABEL_DISPLAY[typedLabel]} traffic</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-muted">
          Showing the {visits.length === 0 ? 'no' : `last ${visits.length}`} recorded request
          {visits.length === 1 ? '' : 's'} classified as {LABEL_DISPLAY[typedLabel]} on {site.url}.
        </p>
      </div>

      {visits.length === 0 ? (
        <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
          <p className="text-sm text-ink-muted">
            No requests classified as {LABEL_DISPLAY[typedLabel]} have been recorded for this site
            yet. If you're sure your middleware is forwarding to{' '}
            <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[12px]">
              /api/track/visit
            </code>
            , this engine simply hasn't visited in the recorded window.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-ink/10 bg-slate-base/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-ink/10 text-[11px] uppercase tracking-wider text-ink-dim">
                  <th className="px-5 py-3 font-mono font-normal">When</th>
                  <th className="px-5 py-3 font-mono font-normal">Path</th>
                  <th className="px-5 py-3 font-mono font-normal">Referrer</th>
                  <th className="px-5 py-3 font-mono font-normal">User-Agent</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v.id} className="border-b border-ink/5 align-top last:border-b-0">
                    <td className="whitespace-nowrap px-5 py-3 font-mono text-[12px] text-ink-muted">
                      {formatRelativeTime(v.recordedAt)}
                    </td>
                    <td className="max-w-[240px] truncate px-5 py-3 font-mono text-[12.5px]">
                      {v.path ?? '—'}
                    </td>
                    <td className="max-w-[260px] truncate px-5 py-3 font-mono text-[12px] text-ink-muted">
                      {v.referrer ?? '—'}
                    </td>
                    <td className="max-w-[320px] truncate px-5 py-3 font-mono text-[12px] text-ink-muted">
                      {v.userAgent}
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
  if (days < 7) return `${days}d ago`;
  return new Date(date).toISOString().slice(0, 10);
}
