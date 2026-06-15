import { Bloom } from '@/components/bloom/Bloom';
import type { BloomOpts } from '@/components/bloom/types';
import { FoxMark } from '@/components/brand/fox-mark';
import { GitHubIcon } from '@/components/icons';
import { PricingPlans } from '@/components/marketing/pricing-plans';
import Link from 'next/link';

const pricingBloom: BloomOpts = {
  base: '#D6D2CB',
  ember: [248, 148, 68],
  intensity: 0.6,
  cx: 0.5,
  cy: 0.12,
  radius: 0.55,
  orbitX: 0.11,
  orbitY: 0.08,
  orbitPeriod: 13,
  orbitPeriod2: 17,
  counterBloom: { rgb: [120, 116, 108], a: 0.12 },
  period: 9,
  breathAmp: 0.09,
  grainMul: 0.16,
  grainTime: 3.2,
  renderScale: 0.6,
  fps: 30,
};

export default function PricingPage() {
  return (
    <main
      className="pvp relative isolate min-h-screen overflow-hidden bg-slate-base text-ink"
      data-page="pricing"
      style={{ ['--ember' as string]: '#F89444' } as React.CSSProperties}
    >
      <Bloom opts={pricingBloom} />

      <div className="layer relative z-10">
        <nav className="nav">
          <Link href="/" className="brand">
            <FoxMark size={28} />
            <span className="wm">Answerfox</span>
          </Link>
          <div className="nav-links">
            <Link href="/pricing" className="cur">
              Pricing
            </Link>
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

        <div className="wrap">
          <div className="head">
            <span className="eyebrow">
              <span className="dot" /> Pricing
            </span>
            <h1>
              Free verifies. <em>Pro monitors &amp; fixes.</em>
            </h1>
            <p className="sub">
              No credit card to try. Cancel anytime. The audit engine is open-source forever.
            </p>
          </div>

          <PricingPlans />

          <div className="studio">
            <div className="txt">
              <span className="pill">Studio</span>
              <span>
                <b>$99 / month</b>, auto-PR to GitHub, team accounts, API access, <b>Q3 2026</b>
              </span>
            </div>
            <a href="#waitlist">Join the waitlist →</a>
          </div>
        </div>
      </div>
    </main>
  );
}
