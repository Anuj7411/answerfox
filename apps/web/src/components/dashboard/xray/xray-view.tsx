'use client';

import {
  type RunXrayState,
  runXrayAction,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/xray-actions';
import { BODY, DISPLAY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useState, useTransition } from 'react';

/**
 * Functional X-Ray page, ported from X-Ray.dc.html. The design shows a
 * 25-page master/detail with a draggable crawler-vs-browser HTML split.
 * Today's engine (`runXrayForPage`) runs ONE page (the homepage) and
 * returns coverage + word counts + the longest missing text runs — it
 * does not return the raw HTML blobs or a per-page fan-out. So this page
 * keeps the design's language (coverage as the hero, crawler-vs-browser
 * framing, missing-content evidence) and wires the real single-page
 * action, with an honest note that the money-page fan-out and side-by-side
 * HTML land when the engine returns them. No faked 25-page list.
 */
export function XrayView({
  siteId,
  siteUrl,
}: { readonly siteId: string; readonly siteUrl: string }) {
  const [state, setState] = useState<RunXrayState>({ status: 'idle' });
  const [pending, start] = useTransition();
  const [ranAt, setRanAt] = useState<string | null>(null);

  function run() {
    start(async () => {
      const next = await runXrayAction(siteId);
      setState(next);
      if (next.status === 'succeeded') setRanAt('just now');
    });
  }

  const done = state.status === 'succeeded';
  const coverage = done ? state.comparison.coveragePercent : null;
  const tone = coverage === null ? null : coverageTone(coverage);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* PAGE HEADER */}
      <div
        className="afx-phead"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            X-Ray
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: PC.muted,
              maxWidth: '54ch',
            }}
          >
            What an AI crawler receives vs what a browser renders on {stripScheme(siteUrl)}.
            Crawlers do not run JavaScript, so anything injected client-side is invisible to them.
          </p>
        </div>
        <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            Content parity
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 2,
            }}
          >
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 28,
                letterSpacing: '-.02em',
                color: tone?.color ?? PC.dim,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {coverage === null ? '—' : `${coverage}%`}
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: PC.dim, marginTop: 2 }}>
            {done ? 'homepage' : 'not run yet'}
          </div>
        </div>
      </div>

      {/* MAIN CARD */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '60ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 15, color: PC.ink }}>
              {stripScheme(siteUrl)}/
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                color: PC.muted,
                background: PC.hover,
                border: `1px solid ${PC.line}`,
                borderRadius: 6,
                padding: '2px 8px',
              }}
            >
              homepage
            </span>
          </div>
          <button
            type="button"
            onClick={run}
            disabled={pending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '0 14px',
              height: 34,
              background: PC.blazeWash,
              border: `1px solid ${PC.line16}`,
              borderRadius: 6,
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 500,
              color: PC.blazeDeep,
              cursor: pending ? 'wait' : 'pointer',
              opacity: pending ? 0.7 : 1,
            }}
          >
            <RerenderIcon />
            {pending
              ? 'Rendering + comparing…'
              : done || state.status === 'failed'
                ? 'Run again'
                : 'Run X-Ray'}
          </button>
        </div>

        {/* RESULT */}
        {done && coverage !== null && tone !== null ? (
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 800,
                  fontSize: 40,
                  letterSpacing: '-.03em',
                  color: tone.color,
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {coverage}%
              </span>
              <div style={{ flex: '1 1 220px', minWidth: 160 }}>
                <span
                  style={{
                    display: 'block',
                    height: 8,
                    background: PC.hover,
                    borderRadius: 999,
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      height: '100%',
                      width: `${coverage}%`,
                      background: tone.color,
                      borderRadius: 999,
                      transition: 'width 900ms cubic-bezier(.16,1,.3,1)',
                    }}
                  />
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 8,
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: tone.color,
                  }}
                >
                  <span
                    style={{ width: 7, height: 7, borderRadius: '50%', background: tone.color }}
                  />
                  {tone.label}
                </span>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
                {state.rendered ? `re-rendered ${ranAt ?? 'just now'}` : 'from cache'}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                background: PC.line,
                border: `1px solid ${PC.line}`,
                borderRadius: 8,
                overflow: 'hidden',
              }}
            >
              <WordTile
                n={state.comparison.crawlerWordCount}
                label="words the crawler received"
                dot={PC.blaze}
              />
              <WordTile
                n={state.comparison.renderedWordCount}
                label="words a browser rendered"
                dot={PC.ink}
              />
            </div>

            {state.comparison.missingSamples.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '.08em',
                    textTransform: 'uppercase',
                    color: PC.dim,
                  }}
                >
                  Missing from the crawler
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: PC.ink2 }}>
                  These runs of rendered text never reach the crawler. Any AI answer about this page
                  is built without them.
                </p>
                {state.comparison.missingSamples.map((sample) => (
                  <div
                    key={sample}
                    style={{
                      background: PC.blazeWash,
                      border: `1px solid ${PC.line16}`,
                      borderRadius: 6,
                      padding: '10px 12px',
                      fontFamily: MONO,
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      color: PC.blazeDeep,
                    }}
                  >
                    {sample}
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  background: PC.greenWash,
                  borderRadius: 8,
                }}
              >
                <CheckIcon />
                <span style={{ fontSize: 14, color: PC.green }}>
                  The crawler receives essentially all rendered content. Nothing meaningful is
                  hidden behind JavaScript.
                </span>
              </div>
            )}
          </div>
        ) : (
          <p style={{ margin: '16px 0 0', fontSize: 14, lineHeight: 1.5, color: PC.muted }}>
            Run X-Ray to fetch {stripScheme(siteUrl)} the way a crawler does, render it the way a
            browser does, and measure how much rendered content the crawler never sees.
          </p>
        )}

        {state.status === 'unavailable' ? (
          <Note tone="amber" title="Render backend not configured">
            {state.reason}
          </Note>
        ) : null}

        {state.status === 'failed' ? (
          <Note tone="red" title="X-Ray failed">
            {state.error}
          </Note>
        ) : null}
      </div>

      {/* HONEST SCOPE NOTE */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '120ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '16px 20px',
          fontSize: 13,
          lineHeight: 1.5,
          color: PC.muted,
        }}
      >
        <span style={{ fontFamily: BODY, fontWeight: 600, color: PC.ink }}>Single page today.</span>{' '}
        X-Ray runs against the homepage. The money-page fan-out over your sitemap (ranked by
        coverage) and the side-by-side crawler-vs-browser HTML land once the engine returns per-page
        HTML.
      </div>
    </div>
  );
}

function WordTile({ n, label, dot }: { n: number; label: string; dot: string }) {
  return (
    <div style={{ background: PC.card, padding: '16px 18px' }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: '-.03em',
          color: PC.ink,
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {n.toLocaleString()}
      </div>
      <div
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: MONO,
          fontSize: 11,
          color: PC.dim,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />
        {label}
      </div>
    </div>
  );
}

function Note({
  tone,
  title,
  children,
}: { tone: 'amber' | 'red'; title: string; children: React.ReactNode }) {
  const color = tone === 'amber' ? PC.amber : PC.red;
  const bg = tone === 'amber' ? PC.amberWash : PC.redWash;
  return (
    <div style={{ marginTop: 14, background: bg, borderRadius: 6, padding: '12px 16px' }}>
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{title}. </span>
      <span style={{ fontFamily: MONO, fontSize: 12, color: PC.ink2 }}>{children}</span>
    </div>
  );
}

function RerenderIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.blazeDeep}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.green}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function coverageTone(pct: number): { readonly label: string; readonly color: string } {
  if (pct < 50) return { label: 'critical', color: PC.red };
  if (pct < 80) return { label: 'warning', color: PC.amber };
  return { label: 'healthy', color: PC.green };
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
