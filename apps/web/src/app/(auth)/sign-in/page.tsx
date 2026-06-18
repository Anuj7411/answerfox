import { SignInWithGitHub } from '@/components/auth/sign-in-with-github';
import { Bloom } from '@/components/bloom/Bloom';
import type { BloomOpts } from '@/components/bloom/types';
import { FoxMark } from '@/components/brand/fox-mark';
import Link from 'next/link';

const signInBloom: BloomOpts = {
  base: '#D6D2CB',
  ember: [198, 85, 60],
  intensity: 0.6,
  cx: 0.5,
  cy: 0.5,
  radius: 0.6,
  orbitX: 0.28,
  orbitY: 0.2,
  orbitPeriod: 22,
  orbitPeriod2: 31,
  counterBloom: { rgb: [120, 116, 108], a: 0.14 },
  period: 14,
  breathAmp: 0.045,
  grainMul: 0.15,
  grainTime: 3.2,
  renderScale: 0.6,
  fps: 30,
};

interface SignInPageProps {
  readonly searchParams: Promise<{
    readonly redirect?: string;
    readonly error?: string;
  }>;
}

function SiCheck() {
  return (
    <span className="sck" aria-hidden>
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <title>check</title>
        <path
          d="M3.5 8.5l2.8 2.8L12.5 5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect;
  const error = params.error;

  return (
    <main className="siv relative isolate min-h-screen overflow-hidden text-ink" data-page="signin">
      <Bloom opts={signInBloom} />

      <div className="layer">
        <div className="si-top">
          <Link href="/" className="brand">
            <FoxMark size={28} />
            <span className="wm">Answerfox</span>
          </Link>
          <div className="util">
            <Link href="/compare">Docs</Link>
            <a href="mailto:hello@answerfox.dev">Need help?</a>
            <Link className="new" href="/sign-in">
              Create account
            </Link>
          </div>
        </div>

        <div className="si-body">
          <div className="left">
            <span className="hi">
              <span className="d" /> Welcome back
            </span>
            <h1>Let&rsquo;s get your site answerable.</h1>
            <p className="lede">Sign in to pick up exactly where you left off.</p>

            <div className="checks">
              <div className="row">
                <SiCheck />
                <span>
                  <b>50 checks</b> across SEO, AEO, GEO, and Agent Readiness.
                </span>
              </div>
              <div className="row">
                <SiCheck />
                <span>
                  <b>16 of 16</b> Cloudflare AR Score parity, plus 34 of our own.
                </span>
              </div>
              <div className="row">
                <SiCheck />
                <span>
                  AI writes the fix, you review the diff, we open the <b>pull request</b>.
                </span>
              </div>
            </div>

            <div className="ftr">
              <span>MIT licensed</span>
              <span className="sep" />
              <span>500+ stars</span>
              <span className="sep" />
              <span>v0.6.0 shipped</span>
            </div>
          </div>

          <div className="right">
            <div className="hc">
              <div className="pad">
                <span className="wm-sm">
                  <FoxMark size={18} />
                  Answerfox
                </span>
                <h2>Welcome.</h2>
                <p className="si-subtext">
                  Audit your site for SEO, AEO, GEO, and Agent Readiness across 50 checks, then let
                  AI write the fixes and open the PR.
                </p>

                {error !== undefined && error.length > 0 && <div className="si-error">{error}</div>}

                <div className="si-actions">
                  <SignInWithGitHub redirectTo={redirectTo} />
                </div>

                <div className="si-div">Free to sign in, no credit card</div>
                <p className="si-foot">
                  By continuing you agree to our <Link href="/terms">terms</Link> and{' '}
                  <Link href="/privacy">privacy</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
