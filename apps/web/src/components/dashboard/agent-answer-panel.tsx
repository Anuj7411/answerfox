'use client';

import {
  type RunAgentAnswerState,
  runAgentAnswerAction,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/agent-answer-actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export interface AgentAnswerRunSummary {
  readonly id: string;
  readonly score: number;
  readonly gapCount: number;
  /** Pre-formatted on the server (YYYY-MM-DD) to avoid hydration drift. */
  readonly label: string;
}

interface AgentAnswerPanelProps {
  readonly siteId: string;
  readonly siteUrl: string;
  readonly history: readonly AgentAnswerRunSummary[];
}

/**
 * "Run Agent Answer Simulation" section on the site detail page.
 *
 * Feeds a coding agent only what an AI crawler sees, asks real developer
 * questions, and scores whether it could answer. Each run persists, so
 * the panel also shows answerability over time, the trend no other tool
 * tracks. On a fresh run we refresh the server data so the new point
 * appears in the trend.
 */
export function AgentAnswerPanel({ siteId, siteUrl, history }: AgentAnswerPanelProps) {
  const router = useRouter();
  const [state, setState] = useState<RunAgentAnswerState>({ status: 'idle' });
  const [pending, start] = useTransition();

  function run(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const res = await runAgentAnswerAction(siteId);
      setState(res);
      if (res.status === 'succeeded') router.refresh();
    });
  }

  const latestScore =
    state.status === 'succeeded' ? state.report.answerabilityScore : (history[0]?.score ?? null);

  return (
    <section className="glass rounded-2xl border border-ink/10 p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-semibold">Agent Answer Simulation</h2>
          <p className="mt-2 max-w-[520px] font-body text-ink-muted">
            We feed a coding agent only what an AI crawler sees at {siteUrl} (no JavaScript), ask
            real developer questions, and score whether it could actually answer. Every gap is a
            fix.
          </p>
        </div>
        {latestScore !== null ? (
          <div className="text-right">
            <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
              Answerability
            </p>
            <p className="t-hero text-4xl">{latestScore}</p>
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
            ? 'Running the simulation...'
            : state.status === 'succeeded' || state.status === 'failed' || history.length > 0
              ? 'Run again'
              : 'Run simulation'}
        </button>
      </form>

      {state.status === 'succeeded' ? <ReportView report={state.report} /> : null}

      {state.status === 'unavailable' ? (
        <div className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3">
          <p className="text-[13px] font-semibold text-amber-950">Model key not configured</p>
          <p className="mt-1 font-mono text-[12px] text-amber-900/85">{state.reason}</p>
        </div>
      ) : null}

      {state.status === 'failed' ? (
        <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3">
          <p className="text-[13px] font-semibold text-red-900">Simulation failed</p>
          <p className="mt-1 font-mono text-[12px] text-red-900/85">{state.error}</p>
        </div>
      ) : null}

      <TrendView runs={history} />
    </section>
  );
}

function TrendView({ runs }: { readonly runs: readonly AgentAnswerRunSummary[] }) {
  if (runs.length === 0) return null;
  return (
    <div className="mt-6">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-muted">
        Answerability over time
      </p>
      <ul className="mt-2 space-y-1.5">
        {runs.map((r) => (
          <li key={r.id} className="flex items-center gap-3">
            <span className="w-[74px] font-mono text-[11.5px] text-ink-muted">{r.label}</span>
            <span className="h-2 max-w-full flex-1 rounded bg-ink/5">
              <span
                className="block h-2 rounded bg-ember/50"
                style={{ width: `${Math.max(2, Math.min(100, r.score))}%` }}
              />
            </span>
            <span className="w-8 text-right font-mono text-[12px]">{r.score}</span>
            <span className="w-14 text-right font-mono text-[11px] text-ink-muted">
              {r.gapCount} gaps
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportView({
  report,
}: {
  readonly report: Extract<RunAgentAnswerState, { status: 'succeeded' }>['report'];
}) {
  return (
    <div className="mt-5 space-y-3">
      <p className="font-mono text-[12px] text-ink-muted">
        {report.gaps.length === 0
          ? 'An AI agent could answer every developer question from what it can read.'
          : `${report.gaps.length} of ${report.results.length} questions an AI agent could not fully answer:`}
      </p>

      {report.gaps.length > 0 ? (
        <ul className="space-y-2">
          {report.gaps.map((gap) => (
            <li key={gap.question} className="rounded-lg border border-ink/15 bg-white/70 p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-[13px] font-medium text-ink/90">{gap.question}</p>
                <span
                  className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                    gap.verdict === 'unanswerable'
                      ? 'bg-red-100 text-red-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {gap.verdict}
                </span>
              </div>
              {gap.missing.length > 0 ? (
                <p className="mt-1 text-[12.5px] text-ink-muted">Missing: {gap.missing}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
