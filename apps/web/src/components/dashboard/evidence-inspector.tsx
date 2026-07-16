'use client';

import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Evidence inspector. A focused modal that renders a finding's crawler-visible
 * evidence + fix recommendation with metadata front-and-center — richer than
 * the inline expand row on the Findings page, and copy-able so users can
 * share the exact snippet an AI crawler received.
 *
 * Uses a native <dialog> element for accessible modal semantics without a
 * dep. Everything shown here is real data pulled from the FindingItem the
 * server component already loads — no fabrication.
 */
export interface EvidenceInspectorItem {
  readonly checkId: string;
  readonly category: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly status: 'pass' | 'fail' | 'warn' | 'skip';
  readonly evidence: string | null;
  readonly fixRecommendation: string | null;
  /** The check title/rec used in the row header; helpful when evidence is thin. */
  readonly title: string;
}

const STATUS_COLOR: Record<string, string> = {
  fail: PC.red,
  warn: PC.amber,
  pass: PC.green,
  skip: PC.dim,
};

const SEVERITY_COLOR: Record<EvidenceInspectorItem['severity'], string> = {
  critical: PC.red,
  high: PC.red,
  medium: PC.amber,
  low: PC.muted,
};

export function InspectButton({ item }: { readonly item: EvidenceInspectorItem }) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const [copied, setCopied] = useState<'evidence' | 'fix' | null>(null);

  useEffect(() => {
    if (copied === null) return;
    const t = setTimeout(() => setCopied(null), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  function open() {
    dialogRef.current?.showModal();
  }
  function close() {
    dialogRef.current?.close();
  }

  async function copy(text: string, which: 'evidence' | 'fix') {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
    } catch {
      // Clipboard blocked (e.g. sandboxed iframe). Silent — button just doesn't flash.
    }
  }

  const sevColor = SEVERITY_COLOR[item.severity];
  const statusColor = STATUS_COLOR[item.status] ?? PC.dim;

  return (
    <>
      <button type="button" onClick={open} style={btnGhost} title="Open the evidence inspector">
        <MagnifierIcon />
        Inspect
      </button>

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: native <dialog> handles Escape-to-close for keyboard users; onClick is only for backdrop-click. */}
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        style={{
          padding: 0,
          border: 'none',
          borderRadius: 14,
          background: PC.card,
          maxWidth: 720,
          width: 'calc(100% - 32px)',
          maxHeight: 'calc(100vh - 32px)',
          color: PC.ink,
          boxShadow: '0 20px 60px rgba(20,22,16,.18)',
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) close();
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 32px)' }}>
          {/* HEADER */}
          <div
            style={{
              padding: '18px 20px',
              borderBottom: `1px solid ${PC.line}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                minWidth: 0,
                flex: '1 1 auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 12,
                    color: PC.muted,
                    background: PC.hover,
                    borderRadius: 5,
                    padding: '2px 8px',
                  }}
                >
                  {item.checkId}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: PC.dim,
                  }}
                >
                  {item.category}
                </span>
                <Pill color={sevColor}>{item.severity}</Pill>
                <Pill color={statusColor}>{item.status}</Pill>
              </div>
              <h2
                id={titleId}
                style={{
                  margin: 0,
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 17,
                  color: PC.ink,
                  lineHeight: 1.35,
                }}
              >
                {item.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close inspector"
              style={{
                flex: '0 0 auto',
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'transparent',
                border: `1px solid ${PC.line}`,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XIcon />
            </button>
          </div>

          {/* BODY */}
          <div
            style={{
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              overflow: 'auto',
            }}
          >
            {/* EVIDENCE */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span style={sectionLabel}>Crawler-visible evidence</span>
                {item.evidence && item.evidence.length > 0 && (
                  <button
                    type="button"
                    onClick={() => copy(item.evidence ?? '', 'evidence')}
                    style={btnLink}
                  >
                    {copied === 'evidence' ? 'Copied' : 'Copy evidence'}
                  </button>
                )}
              </div>
              {item.evidence && item.evidence.length > 0 ? (
                <pre style={preBox}>{item.evidence}</pre>
              ) : (
                <div style={emptyBox}>
                  No structured evidence captured for this check — see the fix recommendation below.
                </div>
              )}
            </section>

            {/* FIX RECOMMENDATION */}
            <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <span style={sectionLabel}>Fix recommendation</span>
                {item.fixRecommendation && item.fixRecommendation.length > 0 && (
                  <button
                    type="button"
                    onClick={() => copy(item.fixRecommendation ?? '', 'fix')}
                    style={btnLink}
                  >
                    {copied === 'fix' ? 'Copied' : 'Copy fix'}
                  </button>
                )}
              </div>
              {item.fixRecommendation && item.fixRecommendation.length > 0 ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: PC.ink,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {item.fixRecommendation}
                </p>
              ) : (
                <div style={emptyBox}>
                  No fix recommendation on this check. Generate one from the Findings row to have
                  the AI draft it.
                </div>
              )}
            </section>

            {/* KEY */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderTop: `1px solid ${PC.line}`,
                fontFamily: MONO,
                fontSize: 11.5,
                color: PC.dim,
              }}
            >
              <span>
                Evidence is what an AI crawler received — no JavaScript executed. Failing checks are
                the gap between what your users see and what an agent sees.
              </span>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: MONO,
        fontSize: 10.5,
        letterSpacing: '.04em',
        textTransform: 'uppercase',
        color,
        background: PC.hover,
        borderRadius: 5,
        padding: '2px 8px',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {children}
    </span>
  );
}

const btnGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  height: 30,
  padding: '0 10px',
  background: PC.card,
  border: `1px solid ${PC.line}`,
  borderRadius: 7,
  fontFamily: BODY,
  fontSize: 12.5,
  color: PC.ink,
  cursor: 'pointer',
} as const;

const btnLink = {
  fontFamily: BODY,
  fontSize: 12,
  color: PC.blazeDeep,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  fontWeight: 500,
} as const;

const sectionLabel = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  color: PC.dim,
} as const;

const preBox = {
  margin: 0,
  padding: '12px 14px',
  background: PC.hover,
  border: `1px solid ${PC.line}`,
  borderRadius: 8,
  fontFamily: MONO,
  fontSize: 12,
  color: PC.ink,
  lineHeight: 1.65,
  whiteSpace: 'pre-wrap' as const,
  overflowX: 'auto' as const,
  maxHeight: 320,
  overflowY: 'auto' as const,
} as const;

const emptyBox = {
  padding: '12px 14px',
  border: `1px dashed ${PC.faint}`,
  borderRadius: 8,
  fontSize: 13,
  color: PC.muted,
  lineHeight: 1.55,
} as const;

function MagnifierIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
