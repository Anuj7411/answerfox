'use client';

import { type PublicScanState, runPublicScanAction } from '@/app/scan/scan-actions';
import Link from 'next/link';
import { useState, useTransition } from 'react';

/**
 * The public scanner form. Enter a URL, get the outcome score and the
 * gaps an AI agent hits, then a CTA to sign in and ship the fixes as
 * PRs. This is the top-of-funnel: value before login.
 */
export function ScanForm() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<PublicScanState>({ status: 'idle' });
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (url.length === 0) return;
    start(async () => setState(await runPublicScanAction(url)));
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-docs-site.com"
          className="min-w-0 flex-1 rounded-md border border-ink/15 bg-white/70 px-3 py-2 font-mono text-[14px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-ember/40 bg-ember/10 px-4 py-2 text-[14px] font-medium hover:bg-ember/20 disabled:opacity-60"
        >
          {pending ? 'Scanning...' : 'Scan'}
        </button>
      </form>

      {state.status === 'invalid' || state.status === 'failed' ? (
        <p className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-[13px] text-red-900">
          {state.status === 'invalid' ? state.reason : state.error}
        </p>
      ) : null}

      {state.status === 'unavailable' ? (
        <p className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-[13px] text-amber-950">
          {state.reason}
        </p>
      ) : null}

      {state.status === 'succeeded' ? <Result report={state.report} /> : null}
    </div>
  );
}

function Result({ report }: { readonly report: Extract<PublicScanState, { status: 'succeeded' }>['report'] }) {
  return (
    <div className="mt-6">
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
