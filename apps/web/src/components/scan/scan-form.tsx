'use client';

import { type PublicScanState, runPublicScanAction } from '@/app/scan/scan-actions';
import { ScanResult } from '@/components/scan/scan-result';
import { useState, useTransition } from 'react';

/**
 * The public scanner form. Enter a URL, get the outcome score and the
 * gaps an AI agent hits, a share link to the persisted result, and a CTA
 * to sign in and ship the fixes as PRs. Value before login.
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

      {state.status === 'succeeded' ? (
        <div className="mt-6">
          <ScanResult report={state.report} />
          {state.scanId !== null ? <ShareLink scanId={state.scanId} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function ShareLink({ scanId }: { readonly scanId: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/scan/${scanId}`;

  function copy() {
    const full = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    void navigator.clipboard?.writeText(full).then(
      () => setCopied(true),
      () => setCopied(false),
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <span className="font-mono text-[12px] text-ink-muted">Share this result:</span>
      <code className="rounded bg-ink/5 px-2 py-1 font-mono text-[12px]">{path}</code>
      <button
        type="button"
        onClick={copy}
        className="rounded-md border border-ink/15 bg-white/60 px-2.5 py-1 font-mono text-[12px] hover:border-ember/40 hover:bg-white"
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
