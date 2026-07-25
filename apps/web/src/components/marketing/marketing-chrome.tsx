import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

const REPO_URL = 'https://github.com/Anuj7411/answerfox';

export function marketingInstallUrl(): string {
  const slug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG ?? 'answerfox';
  return `https://github.com/apps/${slug}/installations/new`;
}

/** The angular answerfox logomark, taken verbatim from the design set. */
export function AnswerfoxMark({ idKey, height }: { idKey: string; height: number }) {
  const maskId = `afxlm-${idKey}`;
  return (
    <svg
      viewBox="296 223 927 518"
      style={{ display: 'block', height, width: 'auto' }}
      role="img"
      aria-label="Answerfox"
    >
      <defs>
        <mask id={maskId}>
          <rect x="296" y="223" width="927" height="518" fill="#fff" />
          <rect x="700" y="493" width="523" height="18" fill="#000" />
        </mask>
      </defs>
      <polygon
        points="717,223 877,223 970,741 851,741 776,335 443,741 296,741"
        fill="#1C1C19"
        mask={`url(#${maskId})`}
      />
      <polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504" />
      <polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504" />
      <polygon points="574,611 674,611 567,741 467,741" fill="#F34504" />
    </svg>
  );
}

function GithubMark({ size = 14, fill = '#FAFAF8' }: { size?: number; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="none"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

type MarketingPage = 'how-it-works' | 'pricing' | 'changelog' | 'leaderboard';

export function MarketingNav({ current }: { current?: MarketingPage }) {
  const installUrl = marketingInstallUrl();
  const link = (active: boolean) => ({
    fontFamily: BODY,
    fontSize: 13.5,
    fontWeight: 500,
    color: active ? PC.ink : PC.muted,
    whiteSpace: 'nowrap' as const,
    textDecoration: 'none',
  });

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'rgba(250,250,248,.88)',
        backdropFilter: 'saturate(180%) blur(10px)',
        WebkitBackdropFilter: 'saturate(180%) blur(10px)',
        borderBottom: `1px solid ${PC.line}`,
      }}
    >
      <style>
        {
          '@media(max-width:840px){.afx-mkt-navlinks{display:none!important}.afx-mkt-signin{display:none!important}}'
        }
      </style>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '0 32px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            color: PC.ink,
            textDecoration: 'none',
          }}
        >
          <AnswerfoxMark idKey="nav" height={22} />
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 17,
              letterSpacing: '-.01em',
              color: PC.ink,
            }}
          >
            answerfox
          </span>
        </Link>

        <nav
          className="afx-mkt-navlinks"
          style={{ display: 'flex', alignItems: 'center', gap: 28 }}
        >
          <Link href="/how-it-works" style={link(current === 'how-it-works')}>
            How it works
          </Link>
          <Link href="/pricing" style={link(current === 'pricing')}>
            Pricing
          </Link>
          <Link href="/leaderboard" style={link(current === 'leaderboard')}>
            Leaderboard
          </Link>
          <a href={REPO_URL} target="_blank" rel="noreferrer" style={link(false)}>
            Docs
          </a>
          <Link href="/changelog" style={link(current === 'changelog')}>
            Changelog
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/sign-in" className="afx-mkt-signin" style={link(false)}>
            Sign in
          </Link>
          <a
            href={installUrl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 14px',
              height: 38,
              background: PC.ink,
              borderRadius: 8,
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 500,
              color: '#FAFAF8',
              whiteSpace: 'nowrap',
              textDecoration: 'none',
            }}
          >
            <GithubMark />
            Install the GitHub App
          </a>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  const col = { display: 'flex', flexDirection: 'column' as const, gap: 12 };
  const colHead = {
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '.1em',
    textTransform: 'uppercase' as const,
    color: PC.dim,
    marginBottom: 2,
  };
  const flink = {
    fontFamily: BODY,
    fontSize: 13.5,
    color: PC.ink,
    fontWeight: 500,
    textDecoration: 'none',
  };

  return (
    <footer style={{ borderTop: `1px solid ${PC.line}`, background: PC.bg, marginTop: 64 }}>
      <style>
        {
          '@media(max-width:840px){.afx-mkt-fcols{grid-template-columns:1fr 1fr!important;gap:32px 24px!important}.afx-mkt-fbottom{flex-direction:column!important;align-items:flex-start!important;gap:16px!important}}'
        }
      </style>
      <div
        style={{
          maxWidth: 1180,
          margin: '0 auto',
          padding: '64px 32px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: 48,
        }}
      >
        <div
          className="afx-mkt-fcols"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 48 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 360 }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                color: PC.ink,
                textDecoration: 'none',
              }}
            >
              <AnswerfoxMark idKey="footer" height={22} />
              <span
                style={{ fontFamily: BODY, fontWeight: 600, fontSize: 17, letterSpacing: '-.01em' }}
              >
                answerfox
              </span>
            </Link>
            <p style={{ margin: 0, fontSize: 13.5, color: PC.dim, lineHeight: 1.55 }}>
              Dependabot for agent readiness. Not an SEO tool.
            </p>
          </div>

          <div style={col}>
            <span style={colHead}>Product</span>
            <Link href="/how-it-works" style={flink}>
              How it works
            </Link>
            <Link href="/pricing" style={flink}>
              Pricing
            </Link>
            <Link href="/changelog" style={flink}>
              Changelog
            </Link>
            <Link href="/leaderboard" style={flink}>
              Leaderboard
            </Link>
            <Link href="/scan" style={flink}>
              Public audits
            </Link>
          </div>

          <div style={col}>
            <span style={colHead}>Developers</span>
            <a href={REPO_URL} target="_blank" rel="noreferrer" style={flink}>
              Docs
            </a>
            <a
              href={`${REPO_URL}/tree/main/packages/cli`}
              target="_blank"
              rel="noreferrer"
              style={flink}
            >
              CLI
            </a>
            <a
              href={`${REPO_URL}/tree/main/packages/audit`}
              target="_blank"
              rel="noreferrer"
              style={flink}
            >
              The 53-check engine on GitHub
            </a>
          </div>

          <div style={col}>
            <span style={colHead}>Company</span>
            <Link href="/how-it-works" style={flink}>
              About
            </Link>
            <Link href="/privacy" style={flink}>
              Privacy
            </Link>
            <Link href="/terms" style={flink}>
              Terms
            </Link>
          </div>
        </div>

        <div
          className="afx-mkt-fbottom"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 24,
            paddingTop: 24,
            borderTop: `1px solid ${PC.line}`,
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>© 2026 Answerfox</span>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: PC.card,
              border: `1px solid ${PC.line}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GithubMark size={15} fill={PC.ink} />
          </a>
        </div>
      </div>
    </footer>
  );
}
