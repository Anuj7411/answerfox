import { GitHubIcon } from '@/components/icons';
import Link from 'next/link';

interface FeatureRow {
  readonly label: string;
  readonly free: string;
  readonly pro: string;
  readonly studio: string;
}

const FEATURES: ReadonlyArray<{
  readonly header: string;
  readonly rows: ReadonlyArray<FeatureRow>;
}> = [
  {
    header: 'Audit framework',
    rows: [
      {
        label: 'Audit engine, 4 scores (SEO + AEO + GEO + Agent Readiness)',
        free: 'yes',
        pro: 'yes',
        studio: 'yes',
      },
      { label: 'CLI: audit, explain, init, add', free: 'yes', pro: 'yes', studio: 'yes' },
      { label: 'GitHub Action (audit on every PR)', free: 'yes', pro: 'yes', studio: 'yes' },
      { label: 'Public score badge', free: 'yes', pro: 'yes', studio: 'yes' },
      { label: 'Sites tracked', free: '1', pro: '3', studio: '10' },
      { label: 'Re-audit on demand', free: '3 / day', pro: 'Unlimited', studio: 'Unlimited' },
    ],
  },
  {
    header: 'Monitoring + AI fix',
    rows: [
      {
        label: 'AI fix generation per finding',
        free: 'no',
        pro: '90 / month',
        studio: 'Unlimited',
      },
      {
        label: '30-day audit history + trend graphs',
        free: 'no',
        pro: 'yes',
        studio: 'yes (unlimited)',
      },
      {
        label: 'Scheduled daily audits + regression alerts',
        free: 'no',
        pro: 'Daily',
        studio: 'Hourly',
      },
      { label: 'Weekly email digest', free: 'no', pro: 'yes', studio: 'yes' },
      {
        label: 'Evidence inspector (raw HTML + fix history)',
        free: 'no',
        pro: 'yes',
        studio: 'yes',
      },
    ],
  },
  {
    header: 'Automation (Studio)',
    rows: [
      { label: 'Auto-PR to your GitHub with manifest fixes', free: 'no', pro: 'no', studio: 'yes' },
      { label: 'API access for programmatic auditing', free: 'no', pro: 'no', studio: 'yes' },
      { label: 'Team seats', free: 'no', pro: 'no', studio: '5' },
      {
        label: 'Agentic Commerce coverage (x402 / UCP / ACP / MPP)',
        free: 'no',
        pro: 'no',
        studio: 'yes',
      },
      { label: 'AI citation tracking (Phase 2.1)', free: 'no', pro: 'no', studio: 'yes' },
      { label: 'Priority email support', free: 'no', pro: 'no', studio: 'yes' },
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-slate-base text-ink">
      <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-20 sm:px-10">
        <nav className="flex h-[60px] items-center justify-between">
          <Link href="/" className="brand">
            <span className="mark">
              <i />
            </span>
            <span className="wm">Answerfox</span>
          </Link>
          <div className="flex items-center gap-7">
            <Link href="/compare" className="text-[14.5px] text-ink-muted hover:text-ink">
              vs Cloudflare
            </Link>
            <a
              href="https://github.com/Anuj7411/answerfox"
              target="_blank"
              rel="noreferrer"
              className="text-[14.5px] text-ink-muted hover:text-ink"
            >
              GitHub
            </a>
            <Link href="/sign-in" className="btn btn-quiet h-11">
              <GitHubIcon /> Sign in
            </Link>
          </div>
        </nav>

        <header className="mt-10 max-w-[640px]">
          <span className="eyebrow">
            <span className="dot" /> Pricing
            <span className="ml-3 rounded-full bg-ember/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ember">
              First 100 Studio at $69 lifetime
            </span>
          </span>
          <h1 className="t-hero mt-6 text-4xl">Three tiers. Honest math.</h1>
          <p className="mt-4 font-body text-[17px] leading-relaxed text-ink-muted">
            Free verifies. Pro $29 monitors and AI-writes the fix. Studio $69 automates with
            auto-PR. Annual plans save 15%. Free is forever, not a trial.
          </p>
        </header>

        <section className="mt-12 grid gap-5 lg:grid-cols-3">
          <PlanCard
            tier="Free"
            price="$0"
            cadence="forever"
            blurb="The OSS verifier. Ship your site, get the badge."
            cta={{ label: 'Start free', href: '/sign-in' }}
            highlights={[
              '1 site, latest audit only',
              'Full 50-check framework via CLI',
              'GitHub Action + public badge',
              '3 re-audits per day per site',
            ]}
            tone="quiet"
          />
          <PlanCard
            tier="Pro"
            price="$29"
            cadence="per month"
            annual="$295 / year (save 15%)"
            blurb="Daily scans, 30-day trends, AI fix generation."
            cta={{ label: 'Start Pro', href: '/sign-in' }}
            highlights={[
              'Track up to 3 sites',
              '30-day history + 4-line trend graphs',
              '90 AI fixes per month',
              'Weekly email digest',
              'Evidence inspector',
            ]}
            tone="amber"
          />
          <PlanCard
            tier="Studio"
            price="$69"
            cadence="per month"
            annual="$703 / year (save 15%)"
            blurb="Auto-PR lands the fixes. The full Agent Readiness stack."
            cta={{ label: 'Join Studio', href: '/sign-in' }}
            highlights={[
              'Track up to 10 sites',
              'Auto-PR to your GitHub',
              'Unlimited AI fixes',
              'Hourly auto-audits',
              'Agentic Commerce coverage',
              'API access + team seats',
            ]}
            tone="ember"
            badge="First 100: $69 lifetime"
          />
        </section>

        <section className="mt-16">
          <h2 className="t-hero text-2xl">Every feature, every tier</h2>
          <p className="mt-2 font-body text-[14px] text-ink-muted">
            No asterisks. If a row says yes, it is included.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white/40">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-ink/10 text-left font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Feature</th>
                  <th className="px-5 py-3 font-medium">Free</th>
                  <th className="px-5 py-3 font-medium">Pro $29</th>
                  <th className="px-5 py-3 font-medium text-ember">Studio $69</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((group) => (
                  <FeatureGroup key={group.header} header={group.header} rows={group.rows} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-orange-300 bg-orange-50/70 p-8">
          <h2 className="text-xl font-semibold text-amber-950">
            First 100 Studio customers, $69 lifetime
          </h2>
          <p className="mt-3 max-w-[60ch] font-body text-[15px] text-amber-950/85">
            Pricing will rise to $89 once we hit 100 paid Studio accounts. Sign up before then and
            you keep $69 forever, even when standard pricing changes. No special form needed, the
            rate locks at sign-up.
          </p>
        </section>

        <section className="mt-16 grid gap-8 md:grid-cols-2">
          <FAQ
            question="Can I switch tiers later?"
            answer="Yes. Upgrade or downgrade from the Customer Portal anytime. Pro and Studio prorate within the billing cycle. Annual to monthly swaps take effect at the end of the annual term."
          />
          <FAQ
            question="Refund policy?"
            answer="14-day refund, no questions asked, from your first paid charge. After that you cancel from the Customer Portal and keep access until the end of the period."
          />
          <FAQ
            question="What is the OSS / SaaS split?"
            answer="The audit engine, CLI, GitHub Action, scaffolders, and public badge are MIT-licensed open source. The SaaS hosts history, scheduled audits, AI fix generation, evidence inspection, and the Studio auto-PR feature. You can self-host the OSS pieces and still subscribe for the SaaS features."
          />
          <FAQ
            question="Do you offer free trials of Pro or Studio?"
            answer="No. The Free tier is the trial. It is fully functional for one site forever, not a 14-day countdown. If Pro or Studio is not for you, the Free tier still works."
          />
        </section>

        <footer className="mt-16 border-t border-ink/10 pt-8 font-mono text-[12.5px] text-ink-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>2026 Answerfox. MIT licensed OSS, hosted SaaS by Anuj Ojha.</span>
            <div className="flex items-center gap-5">
              <Link href="/" className="hover:text-ink">
                Home
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

function PlanCard({
  tier,
  price,
  cadence,
  annual,
  blurb,
  cta,
  highlights,
  tone,
  badge,
}: {
  readonly tier: string;
  readonly price: string;
  readonly cadence: string;
  readonly annual?: string;
  readonly blurb: string;
  readonly cta: { readonly label: string; readonly href: string };
  readonly highlights: ReadonlyArray<string>;
  readonly tone: 'quiet' | 'amber' | 'ember';
  readonly badge?: string;
}) {
  const toneClass =
    tone === 'ember'
      ? 'border-orange-300 bg-orange-50/70 ring-1 ring-orange-200'
      : tone === 'amber'
        ? 'border-amber-300 bg-amber-50/60'
        : 'border-ink/10 bg-white/50';
  return (
    <div className={`relative flex flex-col rounded-2xl border p-7 ${toneClass}`}>
      {badge !== undefined ? (
        <span className="absolute -top-3 left-6 rounded-full bg-ember px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-base">
          {badge}
        </span>
      ) : null}
      <span className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">{tier}</span>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="t-hero text-5xl">{price}</span>
        <span className="font-mono text-[13px] text-ink-muted">{cadence}</span>
      </div>
      {annual !== undefined ? (
        <p className="mt-1 font-mono text-[12px] text-ink-muted">{annual}</p>
      ) : null}
      <p className="mt-4 font-body text-[15px] leading-relaxed">{blurb}</p>
      <ul className="mt-5 space-y-2 text-[14px]">
        {highlights.map((h) => (
          <li key={h} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
            <span>{h}</span>
          </li>
        ))}
      </ul>
      <Link
        href={cta.href}
        className={`mt-7 ${tone === 'ember' ? 'btn btn-solid' : 'btn btn-ghost'}`}
      >
        {cta.label}
      </Link>
    </div>
  );
}

function FeatureGroup({
  header,
  rows,
}: {
  readonly header: string;
  readonly rows: ReadonlyArray<FeatureRow>;
}) {
  return (
    <>
      <tr className="bg-slate-base/60">
        <td
          colSpan={4}
          className="px-5 py-2 font-mono text-[12px] uppercase tracking-wide text-ink-muted"
        >
          {header}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-b border-ink/5 last:border-0">
          <td className="px-5 py-3 font-medium">{row.label}</td>
          <td className="px-5 py-3 text-ink-muted">{row.free}</td>
          <td className="px-5 py-3 text-ink-muted">{row.pro}</td>
          <td className="px-5 py-3 font-medium text-ember">{row.studio}</td>
        </tr>
      ))}
    </>
  );
}

function FAQ({ question, answer }: { readonly question: string; readonly answer: string }) {
  return (
    <div>
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 font-body text-[14.5px] leading-relaxed text-ink-muted">{answer}</p>
    </div>
  );
}
