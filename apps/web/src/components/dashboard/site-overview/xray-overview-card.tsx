'use client';

import { type RunXrayState, runXrayAction } from '@/app/(dashboard)/dashboard/sites/[siteId]/xray-actions';
import { useState, useTransition } from 'react';
import { MONO, PC, cardLabel } from './porcelain';

/**
 * Overview X-Ray card: how much of the rendered page an AI crawler
 * actually receives, and the content it never sees. Ported from the
 * design's X-Ray block, wired to the real Cloudflare-backed action.
 *
 * The design shows a draggable crawler-vs-browser HTML split; that needs
 * both raw HTML blobs, which today's action does not return. So this
 * Overview card shows the parts we have real data for (coverage + the
 * missing samples) and links out to the full X-Ray. The dual-pane split
 * lands with the dedicated X-Ray page.
 */
export function XrayOverviewCard({
  siteId,
  siteUrl,
}: {
  readonly siteId: string;
  readonly siteUrl: string;
}) {
  const [state, setState] = useState<RunXrayState>({ status: 'idle' });
  const [pending, start] = useTransition();

  function run() {
    start(async () => setState(await runXrayAction(siteId)));
  }

  const done = state.status === 'succeeded';
  const coverage = done ? state.comparison.coveragePercent : 0;

  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 8,
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
        <span style={{ ...cardLabel, color: PC.ink2 }}>
          X-Ray · crawler received vs browser rendered
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={cardLabel}>coverage</span>
          <span
            style={{
              width: 120,
              height: 6,
              background: PC.sidebar,
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                display: 'block',
                height: '100%',
                width: `${coverage}%`,
                background: PC.blaze,
                borderRadius: 999,
                transition: 'width 900ms cubic-bezier(.16,1,.3,1)',
              }}
            />
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 500,
              color: PC.ink2,
              fontVariantNumeric: 'tabular-nums',
              minWidth: 34,
              textAlign: 'right',
            }}
          >
            {coverage}%
          </span>
        </div>
      </div>

      <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12, color: PC.muted }}>
        {done ? (
          <>
            homepage · crawler received{' '}
            <span style={{ color: PC.ink2 }}>{state.comparison.crawlerWordCount}</span> of{' '}
            <span style={{ color: PC.ink2 }}>{state.comparison.renderedWordCount}</span> rendered
            words {state.rendered ? '' : '· from cache'}
          </>
        ) : (
          <>
            AI crawlers do not run JavaScript. Compare {siteUrl} as a browser renders it against
            what a crawler receives.
          </>
        )}
      </div>

      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          style={{
            padding: '8px 14px',
            background: PC.blazeWash,
            border: `1px solid ${PC.line16}`,
            borderRadius: 6,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 500,
            color: PC.blazeDeep,
            cursor: pending ? 'wait' : 'pointer',
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? 'Rendering + comparing…' : done || state.status === 'failed' ? 'Run again' : 'Run X-Ray'}
        </button>
      </div>

      {state.status === 'unavailable' ? (
        <div
          style={{
            marginTop: 14,
            background: 'rgba(184,128,28,.10)',
            borderRadius: 6,
            padding: '12px 16px',
            fontSize: 13,
            lineHeight: 1.5,
            color: PC.ink2,
          }}
        >
          Render backend not configured.{' '}
          <span style={{ fontFamily: MONO, fontSize: 12, color: PC.amber }}>{state.reason}</span>
        </div>
      ) : null}

      {state.status === 'failed' ? (
        <div
          style={{
            marginTop: 14,
            background: 'rgba(196,54,43,.08)',
            borderRadius: 6,
            padding: '12px 16px',
            fontSize: 13,
            color: PC.red,
          }}
        >
          X-Ray failed. <span style={{ fontFamily: MONO, fontSize: 12 }}>{state.error}</span>
        </div>
      ) : null}

      {done && state.comparison.missingSamples.length > 0 ? (
        <div
          style={{
            marginTop: 14,
            background: PC.blazeWash,
            borderRadius: 6,
            padding: '12px 16px',
          }}
        >
          <span style={{ fontSize: 13, lineHeight: 1.5, color: PC.ink2 }}>
            Missing from the crawler:{' '}
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.blazeDeep }}>
              {state.comparison.missingSamples.slice(0, 2).join(' · ')}
            </span>
            . The AI answer about this page is built without any of it.
          </span>
        </div>
      ) : null}

      {done && state.comparison.missingSamples.length === 0 ? (
        <div style={{ marginTop: 14, fontSize: 13, color: PC.muted }}>
          The crawler receives essentially all rendered content. Nothing hidden behind JavaScript.
        </div>
      ) : null}
    </div>
  );
}
