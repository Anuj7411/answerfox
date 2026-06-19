import type { AuditDiffSummary } from '@/lib/audit/diff-audits';

interface AuditDiffCardProps {
  readonly diff: AuditDiffSummary;
}

/**
 * "Since last audit" card. Renders deltas (score + Agent Readiness),
 * regressions (new failures), and improvements (fixed checks). Hidden
 * by the caller when only one audit exists.
 */
export function AuditDiffCard({ diff }: AuditDiffCardProps) {
  const { scoreDelta, agentReadinessDelta, newFailures, fixed, previousAt, latestAt } = diff;
  const nothingChanged =
    scoreDelta === 0 && agentReadinessDelta === 0 && newFailures.length === 0 && fixed.length === 0;

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">Since last audit</h2>
        <p className="font-mono text-[11.5px] text-ink-dim">
          {formatDay(previousAt)} → {formatDay(latestAt)}
        </p>
      </div>

      {nothingChanged ? (
        <p className="mt-3 text-sm text-ink-muted">
          No changes between this run and the previous one. Nothing has regressed; nothing has been
          fixed.
        </p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Delta label="Aggregate score" value={scoreDelta} suffix="/100" />
            <Delta label="Agent Readiness" value={agentReadinessDelta} suffix="/8" />
          </div>

          {newFailures.length > 0 && (
            <div className="mt-5">
              <p className="font-mono text-[11.5px] uppercase tracking-wider text-red-700">
                {newFailures.length} new failure{newFailures.length === 1 ? '' : 's'}
              </p>
              <ul className="mt-2 space-y-1">
                {newFailures.slice(0, 5).map((f) => (
                  <li key={f.id} className="text-sm">
                    <span className="font-mono text-[12.5px] font-semibold text-red-700">
                      {f.checkId}
                    </span>{' '}
                    {f.fixRecommendation ?? 'Failing — no recommendation captured.'}
                  </li>
                ))}
                {newFailures.length > 5 && (
                  <li className="font-mono text-[11.5px] text-ink-dim">
                    + {newFailures.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {fixed.length > 0 && (
            <div className="mt-5">
              <p className="font-mono text-[11.5px] uppercase tracking-wider text-emerald-700">
                {fixed.length} fixed
              </p>
              <ul className="mt-2 space-y-1">
                {fixed.slice(0, 5).map((f) => (
                  <li key={f.id} className="text-sm">
                    <span className="font-mono text-[12.5px] font-semibold text-emerald-700">
                      {f.checkId}
                    </span>{' '}
                    {f.fixRecommendation ?? 'Now passing.'}
                  </li>
                ))}
                {fixed.length > 5 && (
                  <li className="font-mono text-[11.5px] text-ink-dim">
                    + {fixed.length - 5} more
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  );
}

function Delta({ label, value, suffix }: { label: string; value: number; suffix: string }) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const colorClass =
    direction === 'up'
      ? 'text-emerald-700'
      : direction === 'down'
        ? 'text-red-700'
        : 'text-ink-dim';
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '·';
  const sign = value > 0 ? '+' : '';

  return (
    <div className="rounded-xl border border-ink/10 bg-slate-base px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${colorClass}`}>
        {arrow} {sign}
        {value}
        <span className="ml-1 text-sm font-normal text-ink-dim">{suffix}</span>
      </p>
    </div>
  );
}

function formatDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
