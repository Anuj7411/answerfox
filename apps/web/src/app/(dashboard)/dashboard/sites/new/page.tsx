import { AddSiteForm } from '@/components/dashboard/add-site-form';
import { RepoOnboarder } from '@/components/dashboard/repo-onboarder';
import Link from 'next/link';

export default function NewSitePage() {
  return (
    <div className="mx-auto max-w-[520px] space-y-8">
      <div>
        <Link
          href="/dashboard/sites"
          className="font-mono text-[12.5px] tracking-wide text-ink-muted hover:text-ink"
        >
          ← Sites
        </Link>
        <h1 className="t-hero mt-3 text-3xl">Add a site</h1>
        <p className="mt-3 font-body text-ink-muted">
          Drop a URL Answerfox should audit. Once added, you can run an on-demand audit, schedule
          weekly runs (Week 4), and get notified when your score drops.
        </p>
      </div>

      <section className="glass rounded-2xl border border-ink/10 p-8">
        <AddSiteForm />
      </section>

      <section className="glass rounded-2xl border border-ink/10 p-8">
        <h2 className="text-lg font-semibold">Connect a GitHub repo</h2>
        <p className="mt-2 font-body text-[14px] text-ink-muted">
          Pick a repo the Answerfox App is installed on. We create the site, link the repo, and run
          the first audit in one step, so fixes can ship as pull requests.
        </p>
        <RepoOnboarder />
      </section>

      <p className="text-center font-mono text-[12px] tracking-wide text-ink-muted">
        On-demand audit runs ship in Day 8.
      </p>
    </div>
  );
}
