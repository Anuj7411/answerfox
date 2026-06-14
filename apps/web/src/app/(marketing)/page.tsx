import { Bloom } from '@/components/bloom/Bloom';
import type { BloomOpts } from '@/components/bloom/types';
import { FoxMark } from '@/components/brand/fox-mark';
import { GitHubIcon } from '@/components/icons';

// Landing bloom: slate ember at 80% intensity (BRAND-SYSTEM-LOCKED + prototype).
const landingBloom: BloomOpts = {
  base: '#D6D2CB',
  ember: [248, 148, 68],
  intensity: 0.8,
  cx: 0.8,
  cy: 0.24,
  radius: 0.46,
  orbitX: 0.14,
  orbitY: 0.09,
  orbitPeriod: 26,
  counterBloom: { rgb: [120, 132, 148], a: 0.18 },
  tonePeriod: 38,
  period: 22,
  breathAmp: 0.06,
  grainMul: 0.14,
  grainTime: 3.2,
  renderScale: 0.82,
  fps: 30,
};

const navLinks = [
  { href: '#pricing', label: 'Pricing' },
  { href: '#docs', label: 'Docs' },
  { href: 'https://github.com/Anuj7411/answerfox', label: 'GitHub' },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-base text-ink">
      <Bloom opts={landingBloom} />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1200px] flex-col px-6 sm:px-10">
        <nav className="flex h-[76px] shrink-0 items-center justify-between">
          <div className="brand">
            <FoxMark size={28} />
            <span className="wm">Answerfox</span>
          </div>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[14.5px] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </div>
          <button type="button" className="btn btn-quiet h-11">
            <GitHubIcon /> Sign in with GitHub
          </button>
        </nav>

        <div className="flex flex-1 flex-col items-start gap-12 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-0">
          <div className="max-w-[640px]">
            <span className="eyebrow">
              <span className="dot" /> Open-source AI-SEO toolkit
              <span className="ml-3 rounded-full bg-ember/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ember">
                v0.3.0: Agent Readiness
              </span>
            </span>
            <h1 className="t-hero mt-6">
              The open-source AI-SEO toolkit that lives in your codebase and ships fixes as code.
            </h1>
            <p className="mt-6 max-w-[540px] font-body text-xl leading-relaxed text-ink-muted">
              Audit any site for SEO, AEO, GEO, and AI Agent Readiness. 39 of 56 checks live today.
              Each finding ships as code you commit.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <button type="button" className="btn btn-solid">
                Audit my site
              </button>
              <button type="button" className="btn btn-ghost">
                <GitHubIcon /> View on GitHub
              </button>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-[12.5px] tracking-wide text-ink-muted">
              <span>
                <b className="font-semibold text-ink">MIT</b> licensed
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-ink-muted opacity-60" />
              <span>Free and open source</span>
              <span className="h-[3px] w-[3px] rounded-full bg-ink-muted opacity-60" />
              <span>Runs in your terminal and CI</span>
            </div>
          </div>

          <div className="term glass w-full max-w-[470px] shrink-0">
            <div className="term-bar">
              <span className="tl" />
              <span className="tl" />
              <span className="tl" />
              <span className="tname">answerfox · zsh</span>
            </div>
            <div className="term-body">
              <div>
                <span className="prompt">$</span>{' '}
                <span className="cmd">npx @answerfox/cli audit stripe.com</span>
              </div>
              <div className="muted">Audit running… done in 2.4s</div>
              <div className="ok">
                Score: <b className="font-semibold">76</b>/100{' '}
                <span className="muted">(Average)</span>
              </div>
              <div className="muted">26 pass · 3 fail · 4 warn · 0 skip</div>
              <div className="term-scores">
                <span className="sc">
                  Agent Readiness <b>0 / 6</b>
                </span>
                <span className="agg">Missing: G3 G4 G5</span>
                <span className="term-cursor" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
