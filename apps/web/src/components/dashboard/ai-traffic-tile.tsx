import type { AgentLabel } from '@/lib/analytics/classify-agent';
import type { AgentTrafficSummary } from '@/lib/db/queries/agent-visits';

interface AiTrafficTileProps {
  readonly summary: AgentTrafficSummary;
  readonly integrated: boolean;
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
 * AI traffic breakdown for a single site over the trailing 7 days.
 *
 * - If the site has never sent a visit AND has no ingest token yet,
 *   render an "Integrate analytics" empty state telling the user to
 *   mint the token first.
 * - If the site is integrated but the window is empty, render a
 *   "No traffic recorded yet" copy — analytics work, the site just
 *   hasn't had a request the user's middleware forwarded.
 * - Otherwise: total count + per-engine bar list ordered by the
 *   AI engines first, then catch-alls.
 */
export function AiTrafficTile({ summary, integrated }: AiTrafficTileProps) {
  if (!integrated) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
        <h2 className="text-lg font-semibold">AI traffic</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Mint an ingest token below to start recording which AI engines visit this site.
        </p>
      </section>
    );
  }

  if (summary.total === 0) {
    return (
      <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">AI traffic</h2>
          <span className="font-mono text-[11.5px] text-ink-dim">
            Last {summary.windowDays} days
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          No requests recorded yet. Make sure your middleware is forwarding to{' '}
          <code className="rounded bg-ink/5 px-1 py-0.5 font-mono text-[12px]">
            /api/track/visit
          </code>{' '}
          with the bearer token.
        </p>
      </section>
    );
  }

  const max = Math.max(...summary.buckets.map((b) => b.count), 1);

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">AI traffic</h2>
        <span className="font-mono text-[11.5px] text-ink-dim">
          Last {summary.windowDays} days · {summary.total.toLocaleString()} total
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {summary.buckets.map((b) => {
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
