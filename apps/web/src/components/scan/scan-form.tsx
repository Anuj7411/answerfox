'use client';

import { type PublicScanState, runPublicScanAction } from '@/app/scan/scan-actions';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
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
      <form onSubmit={submit} style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-docs-site.com"
          style={{
            minWidth: 0,
            flex: '1 1 auto',
            height: 46,
            padding: '0 14px',
            border: `1px solid ${PC.faint}`,
            borderRadius: 9,
            background: PC.card,
            fontFamily: MONO,
            fontSize: 14,
            color: PC.ink,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={pending}
          style={{
            flex: '0 0 auto',
            height: 46,
            padding: '0 20px',
            background: PC.ink,
            border: 'none',
            borderRadius: 9,
            fontFamily: BODY,
            fontSize: 14,
            fontWeight: 500,
            color: '#FAFAF8',
            cursor: pending ? 'progress' : 'pointer',
            opacity: pending ? 0.75 : 1,
          }}
        >
          {pending ? 'Scanning…' : 'Scan'}
        </button>
      </form>

      {(state.status === 'invalid' || state.status === 'failed') && (
        <Notice tone="red">{state.status === 'invalid' ? state.reason : state.error}</Notice>
      )}

      {state.status === 'unavailable' && <Notice tone="amber">{state.reason}</Notice>}

      {state.status === 'succeeded' && (
        <div style={{ marginTop: 28 }}>
          <ScanResult report={state.report} />
          {state.scanId !== null && <ShareLink scanId={state.scanId} />}
        </div>
      )}
    </div>
  );
}

function Notice({ tone, children }: { tone: 'red' | 'amber'; children: React.ReactNode }) {
  const color = tone === 'red' ? PC.red : PC.amber;
  const bg = tone === 'red' ? PC.redWash : PC.amberWash;
  return (
    <div
      style={{
        marginTop: 16,
        padding: '11px 14px',
        border: `1px solid ${bg}`,
        background: bg,
        borderRadius: 9,
        fontSize: 13,
        color,
      }}
    >
      {children}
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
    <div
      style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}
    >
      <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>Share this result:</span>
      <code
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: PC.ink,
          background: PC.hover,
          borderRadius: 6,
          padding: '4px 8px',
        }}
      >
        {path}
      </code>
      <button
        type="button"
        onClick={copy}
        style={{
          height: 30,
          padding: '0 12px',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 7,
          fontFamily: MONO,
          fontSize: 12,
          color: PC.ink,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}
