import { GitHubIcon } from '@/components/icons';
import { getLatestAuditForDomain, parseDomainForBadge } from '@/lib/db/queries/public-audit';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const revalidate = 3600; // ISR: refresh every hour

interface PageProps {
  readonly params: Promise<{ readonly domain: string }>;
}

const BAND_LABEL: Record<string, string> = {
  critical: 'Critical',
  weak: 'Weak',
  average: 'Average',
  strong: 'Strong',
  excellent: 'Excellent',
};

const BAND_CLASS: Record<string, string> = {
  critical: 'bg-red-100 text-red-900 ring-red-200',
  weak: 'bg-orange-100 text-orange-900 ring-orange-200',
  average: 'bg-amber-100 text-amber-900 ring-amber-200',
  strong: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  excellent: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
};

const TOTAL_AR_CHECKS = 8;

export default async function PublicSitePage({ params }: PageProps) {
  const { domain: rawDomain } = await params;
  const domain = parseDomainForBadge(decodeURIComponent(rawDomain));
  if (domain === null) notFound();

  const audit = await getLatestAuditForDomain(domain);

  return (
    <main className="relative min-h-screen bg-slate-base text-ink">
      <div className="mx-auto max-w-[1000px] px-6 pt-10 pb-20 sm:px-10">
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
            <Link href="/compare" className="text-[14.5px] text-ink-muted hover:text-ink">
              Compare
            </Link>
            <Link href="/sign-in" className="btn btn-quiet h-11">
              <GitHubIcon /> Sign in
            </Link>
          </div>
        </nav>

        <header className="mt-10 max-w-[640px]">
          <span className="eyebrow">
            <span className="dot" /> Public audit
          </span>
          <h1 className="t-hero mt-6 break-all text-4xl">{domain}</h1>
          {audit !== null ? (
            <p className="mt-4 font-body text-[15px] text-ink-muted">
              Last audited {audit.fetchedAt.toISOString().slice(0, 16).replace('T', ' ')} UTC
            </p>
          ) : (
            <p className="mt-4 font-body text-[15px] text-ink-muted">
              Nobody has audited this site yet.
            </p>
          )}
        </header>

        {audit !== null ? (
          <section className="mt-10 grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-ember/30 bg-orange-50/70 p-7 lg:col-span-3">
              <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                Agent Readiness
              </p>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="font-mono text-7xl font-semibold tabular-nums leading-none">
                  {audit.agentReadinessScore}
                </span>
                <span className="font-mono text-2xl text-ink-muted">/ {TOTAL_AR_CHECKS}</span>
              </div>
              <p className="mt-4 max-w-[44ch] font-body text-[15px] leading-relaxed">
                {audit.agentReadinessScore === TOTAL_AR_CHECKS
                  ? 'All agent manifests present. AI agents can discover and act on this site.'
                  : audit.agentReadinessScore === 0
                    ? 'No agent manifests detected. AI agents cannot discover this site cleanly.'
                    : `${TOTAL_AR_CHECKS - audit.agentReadinessScore} of ${TOTAL_AR_CHECKS} manifests missing.`}
              </p>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white/50 p-7 lg:col-span-2">
              <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
                Legacy score
              </p>
              <div className="mt-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[14px] ring-1 ring-inset ${
                    BAND_CLASS[audit.band] ?? 'bg-slate-100 text-slate-700 ring-slate-200'
                  }`}
                >
                  <b className="font-semibold">{audit.score}</b>
                  <span className="opacity-80">/ 100</span>
                  <span className="opacity-80">· {BAND_LABEL[audit.band] ?? audit.band}</span>
                </span>
              </div>
              <p className="mt-4 font-body text-[14px] text-ink-muted">
                {audit.passCount} pass · {audit.failCount} fail · {audit.warnCount} warn
                {audit.skipCount > 0 ? ` · ${audit.skipCount} skip` : ''}
              </p>
            </div>
          </section>
        ) : null}

        <section className="mt-12 rounded-2xl border border-ink/10 bg-white/40 p-8">
          <h2 className="text-xl font-semibold">Embed this badge in your README</h2>
          <p className="mt-2 font-body text-[14px] text-ink-muted">
            Two styles. Both auto-update within 24 hours of a fresh audit.
          </p>
          <div className="mt-6 space-y-4">
            <Snippet
              title="Agent Readiness (default)"
              code={`[![Agent Readiness](https://answerfox.dev/badge/${domain})](https://answerfox.dev/site/${domain})`}
            />
            <Snippet
              title="Legacy 0-100 score"
              code={`[![Answerfox Score](https://answerfox.dev/badge/${domain}?style=score)](https://answerfox.dev/site/${domain})`}
            />
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-orange-300 bg-orange-50/70 p-8">
          <h2 className="text-xl font-semibold text-amber-950">Want your own audit + the fix?</h2>
          <p className="mt-3 max-w-[60ch] font-body text-[15px] text-amber-950/85">
            Anyone can audit a public URL. The badge updates automatically. To run the audit in your
            repo, get the manifest scaffolders, and (on Studio) auto-PR the fixes, sign in below.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/sign-in" className="btn btn-solid">
              Sign in with GitHub
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
              <Link href="/compare" className="hover:text-ink">
                Compare
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function Snippet({ title, code }: { readonly title: string; readonly code: string }) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">{title}</p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-ink/10 bg-white px-4 py-3 font-mono text-[13px] leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
