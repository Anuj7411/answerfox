import type { AgentAnswerReport } from '@/lib/agent-answer/types';
import Link from 'next/link';

/**
 * Presentational scan result, shared by the live scanner form and the
 * shareable /scan/:id page so both render a result identically. No
 * hooks, so it works as a server component on the shared page and inside
 * the client form alike.
 */
export function ScanResult({ report }: { readonly report: AgentAnswerReport }) {
  return (
    <div>
      <div className="flex items-baseline gap-3">
        <p className="t-hero text-5xl">{report.answerabilityScore}</p>
        <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
          / 100 answerability
        </p>
      </div>

      <p className="mt-3 font-body text-[14px] text-ink-muted">
        {report.gaps.length === 0
          ? 'An AI agent could answer every question we asked from what it can read. Strong.'
          : `${report.gaps.length} of ${report.results.length} questions an AI agent could not fully answer from what it can read:`}
      </p>

      {report.gaps.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {report.gaps.map((gap) => (
            <li key={gap.question} className="rounded-lg border border-ink/15 bg-white/70 p-3">
              <p className="text-[13px] font-medium text-ink/90">{gap.question}</p>
              {gap.missing.length > 0 ? (
                <p className="mt-1 text-[12.5px] text-ink-muted">Missing: {gap.missing}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 rounded-xl border border-ember/30 bg-ember/5 p-5">
        <p className="text-[14px] font-semibold">Fix these as pull requests.</p>
        <p className="mt-1 text-[13px] text-ink-muted">
          Connect the repo and Answerfox writes each fix, opens the PR, and proves the score moved.
        </p>
        <Link
          href="/sign-in"
          className="mt-3 inline-flex rounded-md border border-ember/40 bg-ember/10 px-3 py-1.5 text-[13px] font-medium hover:bg-ember/20"
        >
          Sign in with GitHub
        </Link>
      </div>
    </div>
  );
}
