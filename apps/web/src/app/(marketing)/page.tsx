import { Bloom } from '@/components/bloom/Bloom';
import { LandingTerminal } from '@/components/bloom/LandingTerminal';
import type { BloomOpts } from '@/components/bloom/types';
import { GitHubIcon } from '@/components/icons';
import Link from 'next/link';

const landingBloom: BloomOpts = {
  base: '#D6D2CB',
  ember: [248, 148, 68],
  intensity: 0.74,
  cx: 0.78,
  cy: 0.42,
  radius: 0.5,
  orbitX: 0.04,
  orbitY: 0.035,
  orbitPeriod: 30,
  orbitPeriod2: 36,
  counterBloom: { rgb: [120, 116, 108], a: 0.14 },
  tonePeriod: 38,
  period: 22,
  breathAmp: 0.045,
  grainMul: 0.15,
  grainTime: 3.2,
  renderScale: 0.82,
  fps: 30,
};

export default function LandingPage() {
  return (
    <main
      className="lvp relative min-h-screen overflow-hidden bg-slate-base text-ink"
      data-page="landing"
      style={{ ['--ember' as string]: '#F89444' } as React.CSSProperties}
    >
      <Bloom opts={landingBloom} />

      <div className="layer relative z-10">
        <nav className="nav">
          <Link href="/" className="brand">
            <span className="mark">
              <i />
            </span>
            <span className="wm">Answerfox</span>
          </Link>
          <div className="nav-links">
            <Link href="/pricing">Pricing</Link>
            <Link href="/compare">vs Cloudflare</Link>
            <a href="https://github.com/Anuj7411/answerfox" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
          <div className="nav-right">
            <a
              href="https://github.com/Anuj7411/answerfox"
              target="_blank"
              rel="noreferrer"
              className="nstar"
            >
              <GitHubIcon size={15} /> <b>500+</b>
            </a>
            <Link href="/sign-in" className="btn btn-quiet">
              <GitHubIcon /> Sign in
            </Link>
          </div>
        </nav>

        <div className="hero">
          <div className="lp">
            <span className="eyebrow">
              <span className="dot" /> The Agent Readiness toolkit
            </span>
            <h1>
              Audit, scaffold, and <em>auto-PR</em> the manifests that make your site discoverable
              to AI agents.
            </h1>
            <p className="sub">
              Open source. Lives in your repo. Ships fixes as code. Covers classic SEO, AEO, and GEO
              too. 50 checks active today.
            </p>
            <div className="cta">
              <Link href="/sign-in" className="btn btn-solid">
                Audit my site
              </Link>
              <a
                href="https://github.com/Anuj7411/answerfox"
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                <GitHubIcon /> View on GitHub
              </a>
            </div>
            <div className="trust">
              <span>
                <b>MIT</b> licensed
              </span>
              <span className="sep" />
              <span>
                <b>v0.6.0</b> shipped
              </span>
              <span className="sep" />
              <span>
                <b>16 of 16</b> Cloudflare parity
              </span>
            </div>
          </div>

          <div className="stage">
            <LandingTerminal />
          </div>
        </div>
      </div>
    </main>
  );
}
