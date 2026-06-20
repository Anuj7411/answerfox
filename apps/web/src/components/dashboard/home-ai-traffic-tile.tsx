import type { AgentLabel } from '@/lib/analytics/classify-agent';
import type { UserAgentTrafficSummary } from '@/lib/db/queries/agent-visits';
import Link from 'next/link';

interface HomeAiTrafficTileProps {
  readonly summary: UserAgentTrafficSummary;
}

const LABEL_DISPLAY: Record<AgentLabel, { name: string; tone: 'ai' | 'bot' | 'human' }> = {
  chatgpt: { name: 'ChatGPT', tone: 'ai' },
  perplexity: { name: 'Perplexity', tone: 'ai' },
  gemini: { name: 'Gemini', tone: 'ai' },
  claude: { name: 'Claude', tone: 'ai' },
  'other-bot': { name: 'Other bots', tone: 'bot' },
  human: { name: 'Human', tone: 'human' },
};

const TONE_BAR_STYLE: Record<'ai' | 'bot' | 'human', string> = {
  ai: 'bg-ember',
  bot: 'bg-ink/30',
  human: 'bg-ink/60',
};

/**
 * Cross-site AI traffic rollup for the dashboard home. Shows three
 * states matching the per-site tile so the legend stays consistent
 * between home and detail.
 *
 * - No integrated sites: explain how to integrate, link to /sites.
 * - All sites integrated but no traffic: same "verify forwarding" copy.
 * - Has traffic: total + per-engine bars + integration coverage line.
 */
export function HomeAiTrafficTile({ summary }: HomeAiTrafficTileProps) {
  const { total, buckets, windowDays, integratedSiteCount, totalSiteCount } = summary;

  if (totalSiteCount === 0) {
    // Caller (home page) renders its own "add your first site" state
    // when sites.length === 0; this tile won't be mounted in that case.
    return null;
  }

  if (integratedSiteCount === 0) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">AI traffic</h2>
          <span className="font-mono text-[11.5px] text-ink-dim">
            0 of {totalSiteCount} site{totalSiteCount === 1 ? '' : 's'} integrated
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Mint an ingest token on a site to start recording which AI engines visit it.{' '}
          <Link className="underline" href="/dashboard/sites">
            Open sites
          </Link>{' '}
          to integrate the first one.
        </p>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">AI traffic</h2>
          <span className="font-mono text-[11.5px] text-ink-dim">
            Last {windowDays} days · {integratedSiteCount} of {totalSiteCount} integrated
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          No requests recorded yet. Make sure your middleware is forwarding to{' '}
          <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[12px]">
            /api/track/visit
          </code>
          .
        </p>
      </section>
    );
  }

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">AI traffic</h2>
        <span className="font-mono text-[11.5px] text-ink-dim">
          Last {windowDays} days · {total.toLocaleString()} total · {integratedSiteCount} of{' '}
          {totalSiteCount} integrated
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {buckets.map((b) => {
          const { name, tone } = LABEL_DISPLAY[b.label];
          const width = b.count === 0 ? 0 : Math.max(2, Math.round((b.count / max) * 100));
          return (
            <li
              key={b.label}
              className="grid grid-cols-[100px_1fr_56px] items-center gap-3 text-[13px]"
            >
              <span className="font-mono text-[12.5px] text-ink-muted">{name}</span>
              <span className="h-2 overflow-hidden rounded-full bg-ink/5">
                <span
                  className={`block h-full rounded-full ${TONE_BAR_STYLE[tone]}`}
                  style={{ width: `${width}%` }}
                />
              </span>
              <span className="text-right font-mono tabular-nums text-ink">{b.count}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
