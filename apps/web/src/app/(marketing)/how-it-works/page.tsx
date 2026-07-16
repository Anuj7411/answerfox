import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import {
  MarketingFooter,
  MarketingNav,
  marketingInstallUrl,
} from '@/components/marketing/marketing-chrome';
import Link from 'next/link';

export const metadata = {
  title: 'How it works — Answerfox',
  description:
    'Answerfox runs as a GitHub App: see what AI sees (X-Ray), get the fix as a PR, prove it worked on merge, and watch every deploy with Drift Guard.',
};

const ENGINE_URL = 'https://github.com/Anuj7411/answerfox/tree/main/packages/audit';
const FEF0EA = '#FEF0EA';
const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';

export default function HowItWorksPage() {
  const installUrl = marketingInstallUrl();

  return (
    <div style={{ minHeight: '100vh', background: PC.bg, color: PC.ink, fontFamily: BODY }}>
      <style>
        {
          '@media(max-width:900px){.afx-hero-row{grid-template-columns:1fr!important;gap:32px!important}.afx-loop{grid-template-columns:repeat(2,1fr)!important;row-gap:8px}.afx-loop .afx-loop-arrow{display:none!important}.afx-alertfix{flex-direction:column!important}.afx-alertfix>div:first-child{border-right:none!important;border-bottom:1px solid #EAE9E5}}'
        }
      </style>
      <MarketingNav current="how-it-works" />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        {/* HERO + LOOP */}
        <section
          style={{
            padding: '80px 0 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 22,
          }}
        >
          <span
            style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '.16em', color: PC.blaze }}
          >
            HOW IT WORKS
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.08,
              letterSpacing: '-.035em',
              color: PC.ink,
              maxWidth: 820,
            }}
          >
            See what AI sees. <span style={{ color: PC.blaze }}>Merge</span> the fix. Prove it
            worked.
          </h1>
          <p style={{ margin: 0, fontSize: 17, color: PC.muted, maxWidth: 620, lineHeight: 1.55 }}>
            Answerfox runs as a GitHub App. Here's the whole loop, in four moves.
          </p>

          <div
            className="afx-loop"
            style={{
              marginTop: 24,
              width: '100%',
              maxWidth: 960,
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 14,
              padding: '24px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr auto 1fr auto 1fr',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <LoopNode step="01" label="X-Ray" kind="xray" />
            <LoopArrow />
            <LoopNode step="02" label="Fix-PR" kind="pr" />
            <LoopArrow />
            <LoopNode step="03" label="Proof" kind="proof" />
            <LoopArrow />
            <LoopNode step="04" label="Drift Guard" kind="drift" />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim, marginTop: -4 }}>
            …then Drift Guard triggers the next X-Ray. The loop closes.
          </span>
        </section>

        {/* 01 — X-RAY (artifact left, text right) */}
        <FeatureRow reverse={false}>
          <XrayArtifact />
          <FeatureText
            num="01"
            label="Agent-View X-Ray"
            kind="xray"
            heading="See exactly what an AI crawler receives, page by page."
            body="We fetch each page the way an agent does — no JavaScript. You see the crawler view side-by-side with the browser view, so the delta is impossible to argue with."
          />
        </FeatureRow>

        {/* 02 — FIX-PRs (text left, artifact right) */}
        <FeatureRow reverse>
          <FeatureText
            num="02"
            label="Fix-PRs"
            kind="pr"
            heading="Every finding becomes one small, reviewable pull request."
            body="No dashboards to babysit. Fixes arrive on your repo as branches you review and merge — or don't. We validate the change parses and applies before the PR ever opens."
          />
          <FixPrArtifact />
        </FeatureRow>

        {/* 03 — PROOF-OF-FIX (artifact left, text right) */}
        <FeatureRow reverse={false}>
          <ProofArtifact />
          <FeatureText
            num="03"
            label="Proof-of-Fix"
            kind="proof"
            heading="We re-audit the moment you merge, and post the proof."
            body="The receipt lands where the work happens — as a comment on the PR you just merged. You see the score jump, and so does anyone who reviews the PR later."
          />
        </FeatureRow>

        {/* 04 — DRIFT GUARD (text left, artifact right) */}
        <FeatureRow reverse>
          <FeatureText
            num="04"
            label="Drift Guard"
            kind="drift"
            heading="Every deploy is watched. The alert arrives with its fix already open."
            body="Regressions happen — a refactor drops a schema, a redirect eats a page. We catch it on the next deploy and open the fix-PR before you'd have noticed."
          />
          <DriftArtifact />
        </FeatureRow>

        {/* CREDIBILITY */}
        <section style={{ padding: '56px 0 16px' }}>
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 12,
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: PC.hover,
                border: `1px solid ${PC.line}`,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 auto',
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PC.ink}
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
            </span>
            <span
              style={{
                flex: '1 1 220px',
                minWidth: 200,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 16,
                color: PC.ink,
                letterSpacing: '-.01em',
              }}
            >
              The 53 checks are open source.
            </span>
            <a
              href={ENGINE_URL}
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
                color: PC.ink,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              <GithubMark fill={PC.ink} />
              Read the check engine on GitHub
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PC.muted}
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
              </svg>
            </a>
            <span
              style={{
                flex: '1 1 100%',
                fontFamily: MONO,
                fontSize: 11.5,
                color: PC.dim,
                paddingTop: 6,
                borderTop: `1px solid ${FOOT_LINE}`,
              }}
            >
              answerfox/audit · checks/ · llms.txt spec
            </span>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '64px 0 96px' }}>
          <div
            style={{
              background: PC.ink,
              borderRadius: 16,
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 20,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 220,
                height: 220,
                background: 'radial-gradient(circle,rgba(243,69,4,.22),transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <h2
              style={{
                margin: 0,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 32,
                letterSpacing: '-.03em',
                color: '#FAFAF8',
                maxWidth: 640,
                lineHeight: 1.15,
              }}
            >
              Run your first audit in about 60 seconds.
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 4,
              }}
            >
              <a href={installUrl} style={ctaPrimary}>
                <GithubMark />
                Install the GitHub App
              </a>
              <Link href="/scan" style={ctaGhost}>
                Run your free audit
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ============================================================
   LAYOUT + TEXT
   ============================================================ */

function FeatureRow({ reverse, children }: { reverse: boolean; children: React.ReactNode }) {
  return (
    <section
      className="afx-hero-row"
      style={{
        padding: '72px 0',
        display: 'grid',
        gridTemplateColumns: reverse ? '1fr 1.15fr' : '1.15fr 1fr',
        gap: 56,
        alignItems: 'center',
      }}
    >
      {children}
    </section>
  );
}

type FeatureKind = 'xray' | 'pr' | 'proof' | 'drift';

function FeatureText({
  num,
  label,
  kind,
  heading,
  body,
}: {
  num: string;
  label: string;
  kind: FeatureKind;
  heading: string;
  body: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: PC.blaze,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: FEF0EA,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <KindIcon kind={kind} size={12} />
        </span>
        {num} · {label}
      </span>
      <h2
        style={{
          margin: 0,
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 30,
          letterSpacing: '-.025em',
          color: PC.ink,
          lineHeight: 1.15,
        }}
      >
        {heading}
      </h2>
      <p style={{ margin: 0, fontSize: 15.5, color: PC.muted, lineHeight: 1.6 }}>{body}</p>
    </div>
  );
}

/* ============================================================
   ARTIFACTS
   ============================================================ */

function ArtifactShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function XrayArtifact() {
  const missing = [
    'Pricing table (Hobby / Pro / Enterprise)',
    'The comparison grid — 42 rows of features',
    'FAQ answers below the fold',
  ];
  return (
    <ArtifactShell>
      <div
        style={{
          padding: '11px 16px',
          borderBottom: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            fontFamily: MONO,
            fontSize: 11.5,
            color: PC.muted,
            fontWeight: 500,
          }}
        >
          <KindIcon kind="xray" size={13} stroke={PC.muted} />
          Agent-View X-Ray
        </span>
        <span style={{ flex: '1 1 auto' }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim }}>/pricing</span>
      </div>
      <div
        style={{
          padding: '14px 18px',
          borderBottom: `1px solid ${FOOT_LINE}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 9,
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: PC.red,
          }}
        >
          Missing from crawler view
        </span>
        {missing.map((m) => (
          <div key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PC.red}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flex: '0 0 auto', marginTop: 3 }}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            <span style={{ fontSize: 13, color: PC.ink }}>{m}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div
          style={{
            borderRight: `1px solid ${PC.line}`,
            padding: '14px 16px',
            background: PC.hover,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: PC.red, fontWeight: 500 }}>
            crawler
          </span>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: PC.ink, lineHeight: 1.7 }}>
            <div>&lt;body&gt;</div>
            <div>&nbsp;&nbsp;&lt;div id="__next"&gt;&lt;/div&gt;</div>
            <div>&lt;/body&gt;</div>
            <div style={{ color: PC.red, marginTop: 6 }}>{'// 0 words'}</div>
          </div>
        </div>
        <div
          style={{
            padding: '14px 16px',
            background: FOOT_BG,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: PC.green, fontWeight: 500 }}>
            browser
          </span>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: PC.ink, lineHeight: 1.7 }}>
            <div>&lt;h2&gt;Hobby&lt;/h2&gt;</div>
            <div>&lt;h2&gt;Pro · $20/mo&lt;/h2&gt;</div>
            <div>&lt;h2&gt;Enterprise&lt;/h2&gt;</div>
            <div style={{ color: PC.green, marginTop: 6 }}>{'// 3,412 words'}</div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

function FixPrArtifact() {
  return (
    <ArtifactShell>
      <div
        style={{
          padding: '12px 18px',
          borderBottom: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <KindIcon kind="repo" size={14} stroke={PC.muted} />
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>stripe/stripe-docs</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.faint }}>·</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>pull/148</span>
      </div>
      <div
        style={{
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          borderBottom: `1px solid ${FOOT_LINE}`,
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
            flex: '0 0 auto',
            marginTop: 2,
          }}
        >
          <KindIcon kind="pr" size={11} stroke={PC.green} />
          Open
        </span>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 15.5,
              color: PC.ink,
              lineHeight: 1.35,
            }}
          >
            Add Product JSON-LD to /pricing
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
            answerfox-bot wants to merge 1 commit into <span style={{ color: PC.muted }}>main</span>{' '}
            from <span style={{ color: PC.muted }}>afx/schema-pricing</span>
          </span>
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11.5, lineHeight: 1.7, background: FOOT_BG }}>
        <div
          style={{
            padding: '8px 16px',
            borderBottom: `1px solid ${FOOT_LINE}`,
            background: PC.hover,
            color: PC.muted,
          }}
        >
          app/pricing/page.tsx
        </div>
        <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', background: '#F1FAF4' }}>
            <span style={{ textAlign: 'center', color: PC.green }}>+</span>
            <span style={{ color: PC.green }}>
              &nbsp;&nbsp;&lt;JsonLd data={'{productLd(plans)}'} /&gt;
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', background: '#F1FAF4' }}>
            <span style={{ textAlign: 'center', color: PC.green }}>+</span>
            <span style={{ color: PC.green }}>
              &nbsp;&nbsp;{'{plans.map(p => <PriceCard key={p.id} …/>)}'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr' }}>
            <span style={{ textAlign: 'center', color: '#C4C3BC' }}>·</span>
            <span style={{ color: PC.muted }}>&nbsp;&nbsp;&lt;PricingHero /&gt;</span>
          </div>
        </div>
      </div>
      <div
        style={{
          padding: '11px 18px',
          background: '#F1FAF4',
          borderTop: '1px solid #CDE9D6',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PC.green}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.green }}>
          validated to apply &amp; parse —{' '}
          <span style={{ color: '#0D5B2B' }}>Product schema OK</span>
        </span>
      </div>
    </ArtifactShell>
  );
}

function ProofArtifact() {
  const R = 24;
  const C = 2 * Math.PI * R;
  const score = 74;
  return (
    <ArtifactShell>
      <div
        style={{
          padding: '12px 18px',
          borderBottom: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>pull/148</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.faint }}>·</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: MONO,
            fontSize: 11,
            color: '#7C3AED',
            background: 'rgba(124,58,237,.10)',
            borderRadius: 999,
            padding: '2px 9px',
          }}
        >
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#7C3AED' }} />
          merged
        </span>
      </div>
      <div style={{ padding: 18, display: 'flex', gap: 14 }}>
        <span
          style={{
            flex: '0 0 auto',
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: PC.ink,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BotMark />
        </span>
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.ink, fontWeight: 500 }}>
              answerfox-bot
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim }}>
              commented · 2m after merge
            </span>
          </div>
          <div style={{ border: `1px solid ${PC.line}`, borderRadius: 10, background: FOOT_BG }}>
            <div
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ position: 'relative', width: 64, height: 64, flex: '0 0 auto' }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  style={{ transform: 'rotate(-90deg)' }}
                  aria-hidden="true"
                >
                  <circle cx="32" cy="32" r={R} fill="none" stroke={FOOT_LINE} strokeWidth="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r={R}
                    fill="none"
                    stroke={PC.green}
                    strokeWidth="6"
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
                    fontSize: 19,
                    color: PC.ink,
                  }}
                >
                  {score}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  flex: '1 1 auto',
                  minWidth: 0,
                }}
              >
                <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: 14.5, color: PC.ink }}>
                  Re-audit complete: agent-readiness{' '}
                  <span style={{ fontFamily: MONO }}>61 → 74</span>{' '}
                  <span style={{ color: PC.green }}>(+13)</span>
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.muted }}>
                  Product JSON-LD parsed on /pricing · 3,412 words now reachable
                </span>
              </div>
            </div>
            <div
              style={{
                padding: '10px 16px',
                borderTop: `1px solid ${FOOT_LINE}`,
                fontFamily: MONO,
                fontSize: 11.5,
                color: PC.dim,
              }}
            >
              ▸ /pricing · 12 pages re-checked · 0 regressions
            </div>
          </div>
        </div>
      </div>
    </ArtifactShell>
  );
}

function DriftArtifact() {
  return (
    <div style={{ minWidth: 0 }}>
      <div
        className="afx-alertfix"
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          boxShadow: 'inset 4px 0 0 #D97706',
        }}
      >
        <div
          style={{
            flex: '1 1 0',
            padding: '18px 20px',
            borderRight: `1px solid ${PC.line}`,
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            minWidth: 0,
          }}
        >
          <span
            style={{
              flex: '0 0 auto',
              width: 34,
              height: 34,
              borderRadius: 9,
              background: '#FEF3E2',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="18"
              height="18"
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
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: PC.amber,
                background: '#FEF3E2',
                borderRadius: 5,
                padding: '2px 7px',
                alignSelf: 'flex-start',
              }}
            >
              regression
            </span>
            <span style={{ fontSize: 14.5, fontWeight: 600, color: PC.ink }}>
              Schema stripped from /pricing
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim, lineHeight: 1.5 }}>
              after deploy 4f2a1c · readiness <span style={{ color: PC.muted }}>74</span> →{' '}
              <span style={{ color: PC.amber }}>66</span>
            </span>
          </div>
        </div>
        <div
          style={{
            flex: '1 1 0',
            padding: '18px 20px',
            background: '#FDFBF7',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.ink, fontWeight: 500 }}>
              Fix-PR #148
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontFamily: MONO,
                fontSize: 10.5,
                color: PC.green,
                background: PC.greenWash,
                borderRadius: 5,
                padding: '2px 7px',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: PC.green }} />
              open
            </span>
          </div>
          <span style={{ fontSize: 13, color: PC.muted, lineHeight: 1.5 }}>
            Re-adds the Product JSON-LD that the deploy removed.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ICONS + SHARED
   ============================================================ */

const ctaPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 18px',
  height: 46,
  background: PC.blaze,
  borderRadius: 9,
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 500,
  color: '#FAFAF8',
  whiteSpace: 'nowrap' as const,
  textDecoration: 'none',
} as const;

const ctaGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 18px',
  height: 46,
  background: 'transparent',
  border: '1px solid rgba(250,250,248,.28)',
  borderRadius: 9,
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 500,
  color: '#FAFAF8',
  whiteSpace: 'nowrap' as const,
  textDecoration: 'none',
} as const;

function LoopNode({ step, label, kind }: { step: string; label: string; kind: FeatureKind }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 8px',
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 11,
          background: FEF0EA,
          border: '1px solid #F9D6C4',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <KindIcon kind={kind} size={22} />
      </span>
      <span
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 13.5,
          color: PC.ink,
          letterSpacing: '-.005em',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.05em',
          textTransform: 'uppercase',
          color: PC.dim,
        }}
      >
        {step}
      </span>
    </div>
  );
}

function LoopArrow() {
  return (
    <span
      className="afx-loop-arrow"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke={PC.blaze}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </svg>
    </span>
  );
}

function KindIcon({
  kind,
  size = 22,
  stroke = PC.blaze,
}: { kind: FeatureKind | 'repo'; size?: number; stroke?: string }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke,
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (kind === 'xray') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M7 12h10" />
      </svg>
    );
  }
  if (kind === 'pr') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="18" cy="18" r="3" />
        <circle cx="6" cy="6" r="3" />
        <path d="M13 6h3a2 2 0 0 1 2 2v7" />
        <line x1="6" x2="6" y1="9" y2="21" />
      </svg>
    );
  }
  if (kind === 'proof') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (kind === 'repo') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
      </svg>
    );
  }
  // drift
  return (
    <svg {...common} aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function GithubMark({ fill = '#FAFAF8' }: { fill?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={fill} stroke="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

function BotMark() {
  return (
    <svg viewBox="296 223 927 518" style={{ height: 12, width: 'auto' }} aria-hidden="true">
      <defs>
        <mask id="afxlm-proofbot">
          <rect x="296" y="223" width="927" height="518" fill="#fff" />
          <rect x="700" y="493" width="523" height="18" fill="#000" />
        </mask>
      </defs>
      <polygon
        points="717,223 877,223 970,741 851,741 776,335 443,741 296,741"
        fill="#FAFAF8"
        mask="url(#afxlm-proofbot)"
      />
      <polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504" />
      <polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504" />
      <polygon points="574,611 674,611 567,741 467,741" fill="#F34504" />
    </svg>
  );
}
