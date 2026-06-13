import { GitHubIcon } from '@/components/icons';
import Link from 'next/link';

interface CompareRow {
  readonly label: string;
  readonly answerfox: string;
  readonly cloudflare: string;
  readonly profound: string;
  readonly peec: string;
  readonly otterly: string;
}

const SECTIONS: ReadonlyArray<{
  readonly header: string;
  readonly rows: ReadonlyArray<CompareRow>;
}> = [
  {
    header: 'Framework coverage',
    rows: [
      {
        label: 'Cloudflare AR Score checks (16 total)',
        answerfox: '16',
        cloudflare: '16',
        profound: '0',
        peec: '0',
        otterly: '0',
      },
      {
        label: 'Classic SEO / AEO / GEO checks',
        answerfox: '34',
        cloudflare: '0',
        profound: 'AI-only',
        peec: 'AI-only',
        otterly: 'AI-only',
      },
      {
        label: 'Agentic Commerce (x402 / UCP / ACP / MPP)',
        answerfox: '4',
        cloudflare: '4',
        profound: '0',
        peec: '0',
        otterly: '0',
      },
      {
        label: 'Total active checks',
        answerfox: '50',
        cloudflare: '16',
        profound: 'n/a',
        peec: 'n/a',
        otterly: 'n/a',
      },
    ],
  },
  {
    header: 'How it audits',
    rows: [
      {
        label: 'Runs from your terminal / CI',
        answerfox: 'yes',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'Runs at the CDN edge',
        answerfox: 'no',
        cloudflare: 'yes',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'Sees your repo source',
        answerfox: 'yes',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
    ],
  },
  {
    header: 'How it fixes',
    rows: [
      {
        label: 'Generates the fix code',
        answerfox: 'yes',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'One-command scaffolders (7 manifests)',
        answerfox: 'yes',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'Auto-PR to GitHub',
        answerfox: 'Studio',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'AI fix generation per finding',
        answerfox: 'Pro / Studio',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
    ],
  },
  {
    header: 'Pricing',
    rows: [
      {
        label: 'Free tier?',
        answerfox: 'yes (1 site, forever)',
        cloudflare: 'yes (score only)',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
      {
        label: 'Entry paid tier',
        answerfox: '$29',
        cloudflare: 'n/a',
        profound: '$499',
        peec: '~$95',
        otterly: '$29',
      },
      {
        label: 'High tier',
        answerfox: '$69 (Studio)',
        cloudflare: 'n/a',
        profound: 'custom',
        peec: 'custom',
        otterly: '$199',
      },
      {
        label: 'Open source',
        answerfox: 'MIT, audit engine + CLI',
        cloudflare: 'no',
        profound: 'no',
        peec: 'no',
        otterly: 'no',
      },
    ],
  },
];

const SUMMARY: ReadonlyArray<{ readonly tool: string; readonly oneLine: string }> = [
  {
    tool: 'Cloudflare Agent Readiness Score',
    oneLine:
      'Free CDN-side score. 16 checks at the edge. Tells you what is missing. Does not write the fix or touch your code.',
  },
  {
    tool: 'Profound',
    oneLine:
      'Enterprise AI search visibility tracker. $499 starter. Watches what ChatGPT and Perplexity say about your brand. Does not audit your site.',
  },
  {
    tool: 'Peec AI',
    oneLine:
      '~$95 EUR/mo. Mid-market AI visibility. Tracks brand presence across 10 engines. Built for marketers, not developers.',
  },
  {
    tool: 'Otterly',
    oneLine:
      '$29/mo. Budget AI visibility tracking. Cheaper Profound. Tracks citations, no in-repo fixes.',
  },
];

export default function ComparePage() {
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
            <Link href="/pricing" className="text-[14.5px] text-ink-muted hover:text-ink">
              Pricing
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

        <header className="mt-10 max-w-[760px]">
          <span className="eyebrow">
            <span className="dot" /> Compare
          </span>
          <h1 className="t-hero mt-6 text-4xl">
            Cloudflare scores. Profound monitors. Answerfox ships the PR.
          </h1>
          <p className="mt-4 font-body text-[17px] leading-relaxed text-ink-muted">
            Honest head-to-head with the four AI-visibility tools indie devs ask about most. We
            cover what they cover, plus what they do not, plus we open the PR with the fix.
          </p>
        </header>

        <section className="mt-10">
          <div className="grid gap-3 md:grid-cols-2">
            {SUMMARY.map((s) => (
              <div key={s.tool} className="rounded-2xl border border-ink/10 bg-white/50 p-5">
                <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                  {s.tool}
                </p>
                <p className="mt-2 font-body text-[14px] leading-relaxed text-ink">{s.oneLine}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="t-hero text-2xl">Full matrix</h2>
          <p className="mt-2 font-body text-[14px] text-ink-muted">
            Where Answerfox stands. Where it does not. No marketing fluff in the cells.
          </p>
          <div className="mt-6 overflow-x-auto rounded-2xl border border-ink/10 bg-white/40">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-ink/10 text-left font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                  <th className="px-5 py-3 font-medium">Capability</th>
                  <th className="px-5 py-3 font-medium text-ember">Answerfox</th>
                  <th className="px-5 py-3 font-medium">Cloudflare</th>
                  <th className="px-5 py-3 font-medium">Profound</th>
                  <th className="px-5 py-3 font-medium">Peec</th>
                  <th className="px-5 py-3 font-medium">Otterly</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section) => (
                  <CompareGroup key={section.header} header={section.header} rows={section.rows} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-14 rounded-2xl border border-orange-300 bg-orange-50/70 p-8">
          <h2 className="text-xl font-semibold text-amber-950">
            Why we are different in one sentence
          </h2>
          <p className="mt-3 max-w-[70ch] font-body text-[16px] leading-relaxed text-amber-950/85">
            Every other tool tells you what is broken at the edge or in AI search results. Answerfox
            is the only tool that audits inside your repo, scaffolds the manifest fix, and opens the
            PR for you. The wedge is fix-as-code, not score-only.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-in" className="btn btn-solid">
              Audit my site
            </Link>
            <Link href="/pricing" className="btn btn-ghost">
              See pricing
            </Link>
          </div>
        </section>

        <footer className="mt-16 border-t border-ink/10 pt-8 font-mono text-[12.5px] text-ink-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>2026 Answerfox. MIT licensed OSS, hosted SaaS by Anuj Ojha.</span>
            <div className="flex items-center gap-5">
              <Link href="/" className="hover:text-ink">
                Home
              </Link>
              <Link href="/pricing" className="hover:text-ink">
                Pricing
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

function CompareGroup({
  header,
  rows,
}: {
  readonly header: string;
  readonly rows: ReadonlyArray<CompareRow>;
}) {
  return (
    <>
      <tr className="bg-slate-base/60">
        <td
          colSpan={6}
          className="px-5 py-2 font-mono text-[12px] uppercase tracking-wide text-ink-muted"
        >
          {header}
        </td>
      </tr>
      {rows.map((row) => (
        <tr key={row.label} className="border-b border-ink/5 last:border-0">
          <td className="px-5 py-3 font-medium">{row.label}</td>
          <td className="px-5 py-3 font-semibold text-ember">{row.answerfox}</td>
          <td className="px-5 py-3 text-ink-muted">{row.cloudflare}</td>
          <td className="px-5 py-3 text-ink-muted">{row.profound}</td>
          <td className="px-5 py-3 text-ink-muted">{row.peec}</td>
          <td className="px-5 py-3 text-ink-muted">{row.otterly}</td>
        </tr>
      ))}
    </>
  );
}
