import { AddSiteForm } from '@/components/dashboard/add-site-form';
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

      <p className="text-center font-mono text-[12px] tracking-wide text-ink-muted">
        On-demand audit runs ship in Day 8.
      </p>
    </div>
  );
}
