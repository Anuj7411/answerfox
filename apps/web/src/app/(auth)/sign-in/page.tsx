import { SignInWithGitHub } from '@/components/auth/sign-in-with-github';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface SignInPageProps {
  readonly searchParams: Promise<{
    readonly redirect?: string;
    readonly error?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect;
  const error = params.error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: PC.bg,
        color: PC.ink,
        fontFamily: BODY,
      }}
    >
      {/* SLIM TOP NAV */}
      <header style={{ borderBottom: `1px solid ${PC.line}`, background: PC.bg }}>
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '0 32px',
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            <AnswerfoxMark height={22} />
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
        </div>
      </header>

      {/* CONTENT */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '56px 24px 40px',
          gap: 22,
        }}
      >
        {/* CARD */}
        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 14,
            padding: '36px 32px 28px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            boxShadow: '0 1px 2px rgba(28,28,25,.03)',
          }}
        >
          <AnswerfoxMark height={34} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center' }}>
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
              Sign in to Answerfox
            </h1>
            <p style={{ margin: 0, fontSize: 14, color: PC.muted, lineHeight: 1.55 }}>
              Answerfox runs inside GitHub. Sign in with GitHub to start.
            </p>
          </div>

          {error !== undefined && error.length > 0 && (
            <div
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: `1px solid ${PC.redWash}`,
                background: PC.redWash,
                fontSize: 13,
                color: PC.red,
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ width: '100%' }}>
            <SignInWithGitHub redirectTo={redirectTo} />
          </div>

          <span style={{ fontSize: 13, color: PC.dim, textAlign: 'center' }}>
            New here? Signing in creates your account.
          </span>

          <div
            style={{
              width: '100%',
              paddingTop: 16,
              borderTop: `1px solid ${FOOT_LINE}`,
              fontFamily: MONO,
              fontSize: 11,
              color: PC.dim,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            By continuing you agree to the{' '}
            <Link href="/terms" style={{ color: PC.muted }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: PC.muted }}>
              Privacy Policy
            </Link>
            .
          </div>
        </div>

        {/* REASSURANCE */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: 520,
          }}
        >
          <Reassure label="Read-only until you pick a repo">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </Reassure>
          <Reassure label="No access to your secrets">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </Reassure>
          <Reassure label="Uninstall anytime">
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          </Reassure>
        </div>
      </main>

      {/* SLIM FOOTER */}
      <footer style={{ borderTop: `1px solid ${PC.line}`, background: PC.bg }}>
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>© 2026 Answerfox</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Link href="/privacy" style={{ fontFamily: BODY, fontSize: 12.5, color: PC.dim }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ fontFamily: BODY, fontSize: 12.5, color: PC.dim }}>
              Terms
            </Link>
            <Link href="/how-it-works" style={{ fontFamily: BODY, fontSize: 12.5, color: PC.dim }}>
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FOOT_LINE = '#F0F0EC';

function Reassure({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: MONO,
        fontSize: 11.5,
        color: PC.dim,
        whiteSpace: 'nowrap',
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke={PC.dim}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
      </svg>
      {label}
    </span>
  );
}

/** The angular answerfox logomark, taken verbatim from the design set. */
function AnswerfoxMark({ height }: { height: number }) {
  return (
    <svg
      viewBox="296 223 927 518"
      style={{ display: 'block', height, width: 'auto' }}
      role="img"
      aria-label="Answerfox"
    >
      <defs>
        <mask id={`afxlm-${height}`}>
          <rect x="296" y="223" width="927" height="518" fill="#fff" />
          <rect x="700" y="493" width="523" height="18" fill="#000" />
        </mask>
      </defs>
      <polygon
        points="717,223 877,223 970,741 851,741 776,335 443,741 296,741"
        fill="#1C1C19"
        mask={`url(#afxlm-${height})`}
      />
      <polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504" />
      <polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504" />
      <polygon points="574,611 674,611 567,741 467,741" fill="#F34504" />
    </svg>
  );
}
