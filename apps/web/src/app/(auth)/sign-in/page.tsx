import { SignInWithGitHub } from '@/components/auth/sign-in-with-github';
import { Bloom } from '@/components/bloom/Bloom';
import type { BloomOpts } from '@/components/bloom/types';
import Link from 'next/link';

const signInBloom: BloomOpts = {
  base: '#D6D2CB',
  ember: [248, 148, 68],
  intensity: 0.6,
  cx: 0.5,
  cy: 0.4,
  radius: 0.5,
  orbitX: 0.08,
  orbitY: 0.06,
  orbitPeriod: 32,
  tonePeriod: 38,
  period: 22,
  breathAmp: 0.05,
  grainMul: 0.12,
  grainTime: 3.2,
  renderScale: 0.7,
  fps: 30,
};

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
    <main className="relative min-h-screen overflow-hidden bg-slate-base text-ink">
      <Bloom opts={signInBloom} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col px-6 sm:px-10">
        <nav className="flex h-[76px] shrink-0 items-center justify-between">
          <Link href="/" className="brand">
            <span className="mark">
              <i />
            </span>
            <span className="wm">Answerfox</span>
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-center">
          <div className="glass w-full max-w-[420px] rounded-2xl p-8">
            <h1 className="t-hero text-2xl">Sign in to Answerfox</h1>
            <p className="mt-3 font-body text-ink-muted">
              Continue with GitHub to access your dashboard, scheduled audits, and the Agent
              Readiness scaffolding commands.
            </p>

            {error !== undefined && error.length > 0 && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                {error}
              </div>
            )}

            <div className="mt-7">
              <SignInWithGitHub redirectTo={redirectTo} />
            </div>

            <p className="mt-6 text-center font-mono text-[12px] tracking-wide text-ink-muted">
              First-time sign-in creates your profile. MIT, no telemetry on the OSS CLI.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
