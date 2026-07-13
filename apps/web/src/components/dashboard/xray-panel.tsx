'use client';

import { type RunXrayState, runXrayAction } from '@/app/(dashboard)/dashboard/sites/[siteId]/xray-actions';
import { useState, useTransition } from 'react';

/**
 * X-Ray panel on the site detail page: shows how much of the rendered
 * page an AI crawler actually receives (crawlers do not execute
 * JavaScript), and the exact content they miss. The gap is the fixable
 * finding.
 */
export function XrayPanel({ siteId, siteUrl }: { readonly siteId: string; readonly siteUrl: string }) {
  const [state, setState] = useState<RunXrayState>({ status: 'idle' });
  const [pending, start] = useTransition();

  function run(e: React.FormEvent) {
    e.preventDefault();
    start(async () => setState(await runXrayAction(siteId)));
  }

  return (
    <section className="glass rounded-2xl border border-ink/10 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">X-Ray: what the crawler misses</h2>
          <p className="mt-2 max-w-[520px] font-body text-ink-muted">
            AI crawlers do not run JavaScript. We compare {siteUrl} as a browser renders it against
            what the crawler actually receives, and show the content that never reaches AI.
          </p>
        </div>
        {state.status === 'succeeded' ? (
          <div className="text-right">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
              Crawler coverage
            </p>
            <p className="t-hero text-4xl">{state.comparison.coveragePercent}%</p>
          </div>
        ) : null}
      </div>

      <form onSubmit={run} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-ember/40 bg-ember/10 px-3 py-1.5 text-[13px] font-medium hover:bg-ember/20 disabled:opacity-60"
        >
          {pending
            ? 'Rendering + comparing...'
            : state.status === 'succeeded' || state.status === 'failed'
              ? 'Run again'
              : 'Run X-Ray'}
        </button>
      </form>

      {state.status === 'succeeded' ? <XrayResult state={state} /> : null}

      {state.status === 'unavailable' ? (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-[13px] font-semibold text-amber-950">Render backend not configured</p>
          <p className="mt-1 font-mono text-[12px] text-amber-900/85">{state.reason}</p>
        </div>
      ) : null}

      {state.status === 'failed' ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-[13px] font-semibold text-red-900">X-Ray failed</p>
          <p className="mt-1 font-mono text-[12px] text-red-900/85">{state.error}</p>
        </div>
      ) : null}
    </section>
  );
}

function XrayResult({
  state,
}: {
  readonly state: Extract<RunXrayState, { status: 'succeeded' }>;
}) {
  const { comparison, rendered } = state;
  return (
    <div className="mt-5 space-y-3">
      <p className="font-mono text-[12px] text-ink-muted">
        The crawler receives {comparison.coveragePercent}% of what a browser renders (
        {comparison.crawlerWordCount} of {comparison.renderedWordCount} words).{' '}
        {rendered ? '' : '(served from render cache)'}
      </p>

      {comparison.missingSamples.length > 0 ? (
        <>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
            Content AI crawlers never receive
          </p>
          <ul className="space-y-2">
            {comparison.missingSamples.map((sample, i) => (
              <li
                // Samples are content excerpts; index keys are fine here.
                // biome-ignore lint/suspicious/noArrayIndexKey: excerpt list, order stable
                key={i}
                className="rounded-lg border border-ink/15 bg-white/70 p-3 text-[12.5px] text-ink/80"
              >
                {sample}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-[13px] text-ink-muted">
          The crawler receives essentially all rendered content. Nothing hidden behind JavaScript.
        </p>
      )}
    </div>
  );
}
