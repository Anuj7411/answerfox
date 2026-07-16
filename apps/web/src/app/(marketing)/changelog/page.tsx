import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import {
  MarketingFooter,
  MarketingNav,
  marketingInstallUrl,
} from '@/components/marketing/marketing-chrome';
import type React from 'react';

export const metadata = {
  title: 'Changelog — Answerfox',
  description: 'Every shipped Answerfox feature. Newest first.',
};

const RELEASES_URL = 'https://github.com/Anuj7411/answerfox/releases';
const FOOT_BG = '#FCFCFA';

interface Entry {
  readonly date: string;
  readonly version: string;
  readonly title: string;
  readonly body: string;
  readonly artifact?: React.ReactNode;
}

const ENTRIES: readonly Entry[] = [
  {
    date: 'Jul 8, 2026',
    version: 'v0.9',
    title: 'AI-agent traffic analytics',
    body: 'See which agents (ChatGPT, Perplexity, Gemini, Claude) actually fetch each site, via a one-line middleware.',
    artifact: <TrafficArtifact />,
  },
  {
    date: 'Jun 20, 2026',
    version: 'v0.8',
    title: 'Score-drop email alerts + Drift Guard reminders',
    body: 'Set a threshold; get an email the moment a deploy costs you readiness.',
    artifact: <AlertArtifact />,
  },
  {
    date: 'Jun 12, 2026',
    version: 'v0.7',
    title: 'Payment & entitlement',
    body: 'First fix-to-proof loop free, then $29/repo/mo. Public repos stay free.',
  },
  {
    date: 'Jun 5, 2026',
    version: 'v0.6',
    title: 'Proof-of-Fix',
    body: 'We re-audit on merge and post the before → after delta on your PR.',
    artifact: <ProofArtifact />,
  },
  {
    date: 'May 28, 2026',
    version: 'v0.5',
    title: 'Fix-PRs',
    body: 'Findings ship as small, validated pull requests — merge from your phone.',
    artifact: <PrArtifact />,
  },
  {
    date: 'May 20, 2026',
    version: 'v0.4',
    title: 'Agent-View X-Ray',
    body: 'Crawler view vs browser view, side by side — see exactly what an agent receives.',
    artifact: <XrayArtifact />,
  },
];

export default function ChangelogPage() {
  const installUrl = marketingInstallUrl();

  return (
    <div style={{ minHeight: '100vh', background: PC.bg, color: PC.ink, fontFamily: BODY }}>
      <style>
        {
          '@media(max-width:840px){.afx-log-row{grid-template-columns:1fr!important;gap:12px!important}.afx-log-row>div:first-child{position:static!important;flex-direction:row!important;align-items:center!important;gap:12px!important}}'
        }
      </style>
      <MarketingNav current="changelog" />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        {/* HERO */}
        <section
          style={{ padding: '72px 0 40px', display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <span
            style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '.16em', color: PC.blaze }}
          >
            CHANGELOG
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 640 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: BODY,
                  fontWeight: 600,
                  fontSize: 38,
                  letterSpacing: '-.03em',
                  color: PC.ink,
                  lineHeight: 1.1,
                }}
              >
                What's new in <span style={{ color: PC.blaze }}>Answerfox</span>.
              </h1>
              <p style={{ margin: 0, fontSize: 16, color: PC.muted, lineHeight: 1.55 }}>
                Every shipped feature. Newest first.
              </p>
            </div>
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 14px',
                height: 36,
                background: PC.card,
                border: `1px solid ${PC.line}`,
                borderRadius: 8,
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 500,
                color: PC.muted,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              <RssIcon />
              Subscribe
            </a>
          </div>
        </section>

        {/* ENTRIES */}
        <section style={{ padding: '8px 0 24px' }}>
          {ENTRIES.map((e) => (
            <div
              key={e.version}
              className="afx-log-row"
              style={{
                display: 'grid',
                gridTemplateColumns: '180px 1fr',
                gap: 32,
                padding: '28px 0',
                borderTop: `1px solid ${PC.line}`,
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  position: 'sticky',
                  top: 80,
                  alignSelf: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    color: PC.ink,
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.date}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontFamily: MONO,
                    fontSize: 11,
                    color: PC.blaze,
                    background: '#FEF0EA',
                    border: '1px solid #F9D6C4',
                    borderRadius: 5,
                    padding: '2px 8px',
                    width: 'fit-content',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {e.version}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: BODY,
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: '-.02em',
                    color: PC.ink,
                    lineHeight: 1.25,
                  }}
                >
                  {e.title}
                </h2>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: PC.muted,
                    lineHeight: 1.6,
                    maxWidth: 640,
                  }}
                >
                  {e.body}
                </p>
                {e.artifact}
              </div>
            </div>
          ))}
        </section>

        {/* FINAL */}
        <section
          style={{
            padding: '56px 0 96px',
            borderTop: `1px solid ${PC.line}`,
            marginTop: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: BODY, fontSize: 16, color: PC.muted }}>
            Start watching your site.
          </span>
          <a
            href={installUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 18px',
              height: 44,
              background: PC.ink,
              borderRadius: 9,
              fontFamily: BODY,
              fontSize: 14,
              fontWeight: 500,
              color: '#FAFAF8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            <GithubMark />
            Install the GitHub App
          </a>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ============================================================
   ARTIFACTS
   ============================================================ */

const artifactCard = {
  background: PC.card,
  border: `1px solid ${PC.line}`,
  borderRadius: 12,
  maxWidth: 520,
} as const;

function TrafficArtifact() {
  const bars = [
    { label: 'ChatGPT', w: '44%', color: '#2F6FED' },
    { label: 'Perplexity', w: '20%', color: '#7C3AED' },
    { label: 'Gemini', w: '15%', color: '#0891B2' },
    { label: 'Claude', w: '12%', color: '#D97706' },
  ];
  return (
    <div
      style={{ ...artifactCard, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: PC.dim,
        }}
      >
        agent share · last 30 days
      </span>
      {bars.map((b) => (
        <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              flex: '0 0 auto',
              width: 84,
              fontFamily: MONO,
              fontSize: 12,
              color: PC.ink,
              whiteSpace: 'nowrap',
            }}
          >
            {b.label}
          </span>
          <span
            style={{
              flex: '1 1 auto',
              height: 7,
              borderRadius: 4,
              background: '#F2F1EC',
              overflow: 'hidden',
            }}
          >
            <span style={{ display: 'block', width: b.w, height: '100%', background: b.color }} />
          </span>
          <span
            style={{
              flex: '0 0 auto',
              width: 44,
              textAlign: 'right',
              fontFamily: MONO,
              fontSize: 12,
              color: PC.muted,
              whiteSpace: 'nowrap',
            }}
          >
            {b.w}
          </span>
        </div>
      ))}
    </div>
  );
}

function AlertArtifact() {
  return (
    <div
      style={{
        ...artifactCard,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 30,
          height: 30,
          borderRadius: 8,
          background: '#FEF3E2',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#D97706"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </span>
      <span
        style={{ fontFamily: MONO, fontSize: 12.5, color: PC.ink, flex: '1 1 auto', minWidth: 0 }}
      >
        alert when readiness drops by{' '}
        <span style={{ fontWeight: 500, color: PC.amber }}>≥ 5 points</span>
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          color: PC.green,
          background: PC.greenWash,
          borderRadius: 5,
          padding: '2px 8px',
          whiteSpace: 'nowrap',
        }}
      >
        email on
      </span>
    </div>
  );
}

function ProofArtifact() {
  const R = 18;
  const C = 2 * Math.PI * R;
  const score = 74;
  return (
    <div
      style={{
        ...artifactCard,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div style={{ position: 'relative', width: 46, height: 46, flex: '0 0 auto' }}>
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          style={{ transform: 'rotate(-90deg)' }}
          aria-hidden="true"
        >
          <circle cx="23" cy="23" r={R} fill="none" stroke="#F0F0EC" strokeWidth="5" />
          <circle
            cx="23"
            cy="23"
            r={R}
            fill="none"
            stroke={PC.green}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - score / 100)}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 14,
            color: PC.ink,
          }}
        >
          {score}
        </div>
      </div>
      <span
        style={{ fontFamily: MONO, fontSize: 12.5, color: PC.muted, flex: '1 1 auto', minWidth: 0 }}
      >
        agent-readiness <span style={{ color: PC.ink }}>61 → 74</span>{' '}
        <span style={{ color: PC.green, fontWeight: 500 }}>(+13)</span>
      </span>
    </div>
  );
}

function PrArtifact() {
  return (
    <div
      style={{
        ...artifactCard,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '3px 10px',
          background: PC.greenWash,
          borderRadius: 999,
          fontFamily: MONO,
          fontSize: 11,
          color: PC.green,
          whiteSpace: 'nowrap',
        }}
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PC.green}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M13 6h3a2 2 0 0 1 2 2v7" />
          <line x1="6" x2="6" y1="9" y2="21" />
        </svg>
        Open
      </span>
      <span
        style={{ fontFamily: MONO, fontSize: 12.5, color: PC.ink, flex: '1 1 auto', minWidth: 0 }}
      >
        Add Product JSON-LD to /pricing
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11, color: PC.green, whiteSpace: 'nowrap' }}>
        validated
      </span>
    </div>
  );
}

function XrayArtifact() {
  return (
    <div
      style={{
        ...artifactCard,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: PC.hover,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '.05em',
            color: PC.red,
            fontWeight: 500,
          }}
        >
          crawler
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.red }}>0 words</span>
      </div>
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          background: FOOT_BG,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '.05em',
            color: PC.green,
            fontWeight: 500,
          }}
        >
          browser
        </span>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.green }}>3,412 words</span>
      </div>
    </div>
  );
}

/* ── icons ── */

function RssIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1.5" fill={PC.muted} />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FAFAF8" stroke="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}
