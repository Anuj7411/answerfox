import { Bloom } from '@/components/bloom/Bloom';
import type { BloomOpts } from '@/components/bloom/types';
import { GitHubIcon } from '@/components/icons';
import Link from 'next/link';

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
  { href: '/pricing', label: 'Pricing' },
  { href: '/compare', label: 'vs Cloudflare' },
  { href: 'https://github.com/Anuj7411/answerfox', label: 'GitHub' },
];

const NARRATIVE: ReadonlyArray<{
  readonly tier: string;
  readonly price: string;
  readonly hook: string;
  readonly accent: string;
}> = [
  {
    tier: 'Free',
    price: '$0',
    hook: 'Verifies. One audit, four scores, the badge. Open source.',
    accent: 'border-ink/10 bg-white/50',
  },
  {
    tier: 'Pro',
    price: '$29/mo',
    hook: 'Monitors and AI-writes the fix. Daily scans, 30-day trends, AI patches per finding.',
    accent: 'border-amber-300 bg-amber-50/70',
  },
  {
    tier: 'Studio',
    price: '$69/mo',
    hook: 'Automates. Auto-PR lands the manifest fixes in your repo. First 100 locked at $69 lifetime.',
    accent: 'border-orange-300 bg-orange-50/70',
  },
];

const COMPARISON_ROWS: ReadonlyArray<{
  readonly label: string;
  readonly answerfox: string;
  readonly cloudflare: string;
  readonly profound: string;
}> = [
  {
    label: 'Cloudflare AR Score parity',
    answerfox: '16 of 16',
    cloudflare: '16 of 16',
    profound: '0 of 16',
  },
  {
    label: 'Classic SEO / AEO / GEO checks',
    answerfox: '34 more',
    cloudflare: 'none',
    profound: 'none',
  },
  {
    label: 'Audit runs in your repo (CLI + CI)',
    answerfox: 'yes',
    cloudflare: 'no (CDN-only)',
    profound: 'no',
  },
  { label: 'Generates the fix code', answerfox: 'yes', cloudflare: 'no', profound: 'no' },
  { label: 'Auto-PR to your GitHub', answerfox: 'Studio', cloudflare: 'no', profound: 'no' },
  {
    label: 'Indie pricing',
    answerfox: '$29 / $69',
    cloudflare: 'free (score only)',
    profound: '$499',
  },
];

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-base text-ink">
      <Bloom opts={landingBloom} />

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col px-6 sm:px-10">
        <nav className="flex h-[76px] shrink-0 items-center justify-between">
          <Link href="/" className="brand">
            <span className="mark">
              <i />
            </span>
            <span className="wm">Answerfox</span>
          </Link>
          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14.5px] text-ink-muted transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link href="/sign-in" className="btn btn-quiet h-11">
            <GitHubIcon /> Sign in with GitHub
          </Link>
        </nav>

        <section className="flex flex-col items-start gap-12 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="max-w-[640px]">
            <span className="eyebrow">
              <span className="dot" /> The Agent Readiness toolkit
              <span className="ml-3 rounded-full bg-ember/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ember">
                v0.6.0 — 16 of 16 Cloudflare parity
              </span>
            </span>
            <h1 className="t-hero mt-6">
              Audit, scaffold, and auto-PR the manifests that make your site discoverable to AI
              agents.
            </h1>
            <p className="mt-6 max-w-[560px] font-body text-xl leading-relaxed text-ink-muted">
              Open source. Lives in your repo. Ships fixes as code. Covers classic SEO, AEO, and GEO
              too. 50 checks active today.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link href="/sign-in" className="btn btn-solid">
                Audit my site
              </Link>
              <a
                href="https://github.com/Anuj7411/answerfox"
                className="btn btn-ghost"
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon /> View on GitHub
              </a>
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3 font-mono text-[12.5px] tracking-wide text-ink-muted">
              <span>
                <b className="font-semibold text-ink">MIT</b> licensed
              </span>
              <span className="h-[3px] w-[3px] rounded-full bg-ink-muted opacity-60" />
              <span>Runs in your terminal and CI</span>
              <span className="h-[3px] w-[3px] rounded-full bg-ink-muted opacity-60" />
              <span>Pro $29 / Studio $69</span>
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
              <div className="muted">Audit running... done in 2.4s</div>
              <div className="ok">
                Score: <b className="font-semibold">55</b>/100 <span className="muted">(Weak)</span>
              </div>
              <div className="muted">33 pass · 14 fail · 0 warn · 3 skip</div>
              <div className="term-scores">
                <span className="sc">
                  Agent Readiness <b>1 / 8</b>
                </span>
                <span className="agg">Missing: G1 G2 G3 G4 G5 G7 G8</span>
                <span className="term-cursor" />
              </div>
              <div className="mt-3">
                <span className="prompt">$</span>{' '}
                <span className="cmd">npx @answerfox/cli add mcp-server-card</span>
              </div>
              <div className="ok">Wrote public/.well-known/mcp/server-card.json</div>
            </div>
          </div>
        </section>

        <section className="pb-16 pt-4">
          <h2 className="font-mono text-[12.5px] uppercase tracking-wide text-ink-muted">
            How it works
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {NARRATIVE.map((row) => (
              <div key={row.tier} className={`rounded-2xl border p-6 ${row.accent}`}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                    {row.tier}
                  </span>
                  <span className="font-mono text-[13px] font-semibold">{row.price}</span>
                </div>
                <p className="mt-3 font-body text-[15px] leading-relaxed">{row.hook}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 font-body text-[14px] text-ink-muted">
            <Link href="/pricing" className="font-semibold text-ink hover:underline">
              See full pricing
            </Link>
          </p>
        </section>

        <section className="pb-20">
          <h2 className="t-hero text-3xl">Cloudflare scores. Answerfox ships the PR.</h2>
          <p className="mt-3 max-w-[60ch] font-body text-[15px] text-ink-muted">
            Cloudflare put Agent Readiness on the map. Their free scanner tells you what is missing
            at the edge. We cover everything they cover, plus 34 classic SEO/AEO/GEO checks they do
            not, plus we open the PR with the fix.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white/40">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-ink/10 text-left font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Capability</th>
                  <th className="px-5 py-3 font-medium text-ember">Answerfox</th>
                  <th className="px-5 py-3 font-medium">Cloudflare AR</th>
                  <th className="px-5 py-3 font-medium">Profound</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-ink/5 last:border-0">
                    <td className="px-5 py-3 font-medium">{row.label}</td>
                    <td className="px-5 py-3 font-semibold text-ember">{row.answerfox}</td>
                    <td className="px-5 py-3 text-ink-muted">{row.cloudflare}</td>
                    <td className="px-5 py-3 text-ink-muted">{row.profound}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 font-body text-[13px] text-ink-muted">
            <Link href="/compare" className="font-semibold text-ink hover:underline">
              Full head-to-head with Profound, Peec, Otterly
            </Link>
          </p>
        </section>

        <footer className="border-t border-ink/10 py-10 font-mono text-[12.5px] text-ink-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>2026 Answerfox. MIT licensed OSS, hosted SaaS by Anuj Ojha.</span>
            <div className="flex items-center gap-5">
              <Link href="/pricing" className="hover:text-ink">
                Pricing
              </Link>
              <Link href="/compare" className="hover:text-ink">
                Compare
              </Link>
              <a
                href="https://github.com/Anuj7411/answerfox"
                target="_blank"
                rel="noreferrer"
                className="hover:text-ink"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
