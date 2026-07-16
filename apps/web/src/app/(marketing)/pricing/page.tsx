import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import {
  MarketingFooter,
  MarketingNav,
  marketingInstallUrl,
} from '@/components/marketing/marketing-chrome';
import Link from 'next/link';

export const metadata = {
  title: 'Pricing — Answerfox',
  description:
    'Priced per repo. Public repos are free forever; private repos get one free fix-to-proof loop, then $29/month.',
};

/** Locked pricing: $29/mo per private repo (monthly only — matches the Polar checkout). */
const PRICE = 29;

const FREE_FEATURES = [
  'Unlimited one-shot audits',
  'Public repos — free, in full, forever',
  'One free fix-to-proof loop on a private repo',
  'Agent-View X-Ray',
  'The full 53-check engine',
];

const PRO_FEATURES = [
  'Continuous Drift Guard on every deploy',
  'Unlimited fix-PRs',
  'Proof-of-Fix on every merge',
  'Score-drop email alerts',
  'AI-agent traffic analytics',
];

const FAQS: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What happens after my free loop?',
    a: 'You keep the audit and the merged fix forever. To keep Drift Guard watching that private repo and to keep new fix-PRs flowing, upgrade to Pro at $29/month per repo.',
  },
  {
    q: 'What counts as a repo?',
    a: 'One GitHub repository. If it maps to multiple sites (a monorepo shipping several docs), it still counts as one repo — you pay per repo, not per site.',
  },
  {
    q: 'What if I have multiple repos?',
    a: 'Each private repo is $29/month. Public repos are always free. Install the GitHub App on more orgs and pick which repos to enable — nothing runs until you opt them in.',
  },
  {
    q: 'Is this an SEO tool?',
    a: 'No — Answerfox is a dev tool. It reads your site the way an AI agent would, opens the fix as a pull request on your repo, and stops when the fix lands. No keyword reports, no dashboards to babysit.',
  },
  {
    q: 'Do you store my code?',
    a: "We read what the GitHub App is granted (Contents + Pull requests), generate the diff, and open a PR. We don't mirror your repo and we don't touch your secrets or Actions.",
  },
];

export default function PricingPage() {
  const installUrl = marketingInstallUrl();

  return (
    <div style={{ minHeight: '100vh', background: PC.bg, color: PC.ink, fontFamily: BODY }}>
      <style>
        {
          '@media(max-width:900px){.afx-plans{grid-template-columns:1fr!important}.afx-faq{grid-template-columns:1fr!important;gap:0!important}}'
        }
      </style>
      <MarketingNav current="pricing" />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        {/* HERO */}
        <section
          style={{
            padding: '80px 0 48px',
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
            PRICING
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
            Priced per repo.
            <br />
            The first fix is <span style={{ color: PC.blaze }}>free</span>.
          </h1>
          <p style={{ margin: 0, fontSize: 17, color: PC.muted, maxWidth: 600, lineHeight: 1.55 }}>
            Public repos are free forever. Private repos get one full fix-to-proof loop free, then $
            {PRICE}/month.
          </p>
        </section>

        {/* TWO PLANS */}
        <section
          className="afx-plans"
          style={{
            padding: '16px 0 24px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 24,
            alignItems: 'stretch',
          }}
        >
          {/* FREE */}
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 14,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={planEyebrow(PC.dim)}>Free</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                <span style={priceNum}>$0</span>
              </div>
              <span style={{ fontSize: 14, color: PC.muted }}>
                for open source &amp; first looks
              </span>
            </div>
            <FeatureList features={FREE_FEATURES} />
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Link
                href="/scan"
                style={{
                  height: 44,
                  background: PC.card,
                  border: `1px solid ${PC.ink}`,
                  borderRadius: 9,
                  fontFamily: BODY,
                  fontSize: 14,
                  fontWeight: 500,
                  color: PC.ink,
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <RefreshIcon />
                Run your free audit
              </Link>
            </div>
          </div>

          {/* PRO */}
          <div
            style={{
              position: 'relative',
              background: PC.card,
              border: `1px solid ${PC.blaze}`,
              borderRadius: 14,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              boxShadow: '0 0 0 4px rgba(243,69,4,.08)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -11,
                left: 24,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                background: PC.blaze,
                borderRadius: 999,
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: '#FAFAF8',
                whiteSpace: 'nowrap',
              }}
            >
              most teams
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={planEyebrow(PC.blaze)}>Pro</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={priceNum}>${PRICE}</span>
                <span style={{ fontSize: 14, color: PC.muted }}>/ repo / month</span>
              </div>
              <span style={{ fontSize: 14, color: PC.muted }}>billed monthly, cancel anytime</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <span style={planEyebrow(PC.dim)}>Everything in Free, plus</span>
              <FeatureList features={PRO_FEATURES} />
            </div>
            <a
              href={installUrl}
              style={{
                marginTop: 'auto',
                height: 44,
                background: PC.ink,
                borderRadius: 9,
                fontFamily: BODY,
                fontSize: 14,
                fontWeight: 500,
                color: '#FAFAF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}
            >
              <GithubMark />
              Install the GitHub App
            </a>
          </div>
        </section>

        {/* REASSURANCE */}
        <section style={{ padding: '24px 0 16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 20px',
              background: '#F1F5FE',
              border: '1px solid #D8E3FA',
              borderRadius: 12,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2F6FED"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flex: '0 0 auto' }}
              role="img"
              aria-label="Note"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <span style={{ fontSize: 14, color: PC.ink, lineHeight: 1.5 }}>
              <span style={{ fontWeight: 500 }}>Public repos never cost anything.</span> You only
              pay to keep Drift Guard and unlimited fix-PRs running on private repos.
            </span>
          </div>
        </section>

        {/* FAQ */}
        <section
          style={{ padding: '64px 0 32px', display: 'flex', flexDirection: 'column', gap: 24 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
            <span
              style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: '.16em', color: PC.blaze }}
            >
              FAQ
            </span>
            <h2
              style={{
                margin: 0,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 30,
                letterSpacing: '-.02em',
                color: PC.ink,
              }}
            >
              Questions we hear a lot.
            </h2>
          </div>
          <div
            className="afx-faq"
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 32px' }}
          >
            {FAQS.map((f, i) => (
              <details
                key={f.q}
                open={i === 0}
                style={{ borderBottom: `1px solid ${PC.line}`, padding: '14px 0' }}
              >
                <summary
                  style={{
                    listStyle: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 14,
                  }}
                >
                  <span
                    style={{
                      fontFamily: BODY,
                      fontWeight: 500,
                      fontSize: 15.5,
                      color: PC.ink,
                      lineHeight: 1.4,
                    }}
                  >
                    {f.q}
                  </span>
                  <span
                    style={{
                      flex: '0 0 auto',
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: PC.hover,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={PC.muted}
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </span>
                </summary>
                <p style={{ margin: '10px 0 0', fontSize: 14, color: PC.muted, lineHeight: 1.6 }}>
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ padding: '64px 0 96px' }}>
          <div
            style={{
              background: PC.ink,
              borderRadius: 16,
              padding: '56px 40px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 20,
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -40,
                right: -40,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle,rgba(243,69,4,.22),transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <h2
              style={{
                margin: 0,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 36,
                letterSpacing: '-.03em',
                color: '#FAFAF8',
                maxWidth: 640,
                lineHeight: 1.1,
              }}
            >
              See what AI sees on your docs.
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <a
                href={installUrl}
                style={{
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
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
                <GithubMark />
                Install the GitHub App
              </a>
              <Link
                href="/scan"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '0 18px',
                  height: 46,
                  background: 'transparent',
                  border: '1px solid rgba(250,250,248,.25)',
                  borderRadius: 9,
                  fontFamily: BODY,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#FAFAF8',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                }}
              >
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

/* ── shared bits ── */

const priceNum = {
  fontFamily: BODY,
  fontWeight: 600,
  fontSize: 40,
  letterSpacing: '-.025em',
  color: PC.ink,
  lineHeight: 1,
} as const;

function planEyebrow(color: string) {
  return {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '.08em',
    textTransform: 'uppercase' as const,
    color,
  };
}

function FeatureList({ features }: { features: readonly string[] }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 11,
      }}
    >
      {features.map((f) => (
        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PC.green}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flex: '0 0 auto', marginTop: 2 }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          <span style={{ fontSize: 14, color: PC.ink, lineHeight: 1.45 }}>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function GithubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FAFAF8" stroke="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.ink}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
