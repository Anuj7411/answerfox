import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';

/**
 * Dashboard home. Shows:
 * - A greeting using the user's display name (falls back to email).
 * - Either the empty state (no sites yet) or a quick summary of
 *   the most recently audited site.
 *
 * Day 6 ships the shell only. Add-site, audit-run, and history
 * views land in Day 7 + Week 4 per ROADMAP.
 */
export default async function DashboardHome() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The layout already redirected if user was null, but TypeScript
  // doesn't know that across server boundaries.
  if (user === null) return null;

  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'there';

  const userSites = await listSitesForUser(user.id);

  return (
    <div className="space-y-10">
      <section>
        <h1 className="t-hero text-3xl">Welcome back, {userName}.</h1>
        <p className="mt-3 max-w-[560px] font-body text-ink-muted">
          Your dashboard for Agent Readiness scoring and fix-as-code. Track manifests, watch the 0-8
          AR score move, ship the PR when it does not.
        </p>
      </section>

      {userSites.length === 0 ? <NoSitesEmptyState /> : <SitesPreview count={userSites.length} />}

      <ComingSoonGrid />
    </div>
  );
}

function NoSitesEmptyState() {
  return (
    <section className="glass rounded-2xl border border-ink/10 p-8">
      <h2 className="text-xl font-semibold">Add your first site</h2>
      <p className="mt-3 max-w-[480px] font-body text-ink-muted">
        Drop a URL. Answerfox runs all 50 checks (16 of 16 Cloudflare AR Score parity, plus 34
        classic SEO/AEO/GEO checks) and surfaces the manifests you are missing.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/sites/new" className="btn btn-solid">
          Add a site
        </Link>
        <span className="font-mono text-[12.5px] text-ink-muted">
          or run from the CLI:{' '}
          <code className="rounded bg-ink/5 px-2 py-0.5">
            npx @answerfox/cli audit your-site.com
          </code>
        </span>
      </div>
    </section>
  );
}

function SitesPreview({ count }: { count: number }) {
  return (
    <section className="glass rounded-2xl border border-ink/10 p-8">
      <h2 className="text-xl font-semibold">
        You have {count} site{count === 1 ? '' : 's'}
      </h2>
      <p className="mt-3 max-w-[480px] font-body text-ink-muted">
        View the full list with last-audit chips, or add another.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/sites" className="btn btn-solid">
          View sites
        </Link>
        <Link href="/dashboard/sites/new" className="btn btn-quiet">
          Add another
        </Link>
      </div>
    </section>
  );
}

function ComingSoonGrid() {
  const cards = [
    {
      title: 'Continuous audit',
      body: 'Schedule weekly audits, see what changed since last week.',
      eta: 'Week 4',
    },
    {
      title: 'Agent Readiness trends',
      body: '8 manifests, tracked over time. Catch regressions when you redeploy.',
      eta: 'Week 4',
    },
    {
      title: 'Email alerts',
      body: 'Notify when your score drops below a threshold.',
      eta: 'Week 4',
    },
  ];

  return (
    <section>
      <h2 className="text-lg font-semibold">Coming next</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.title} className="rounded-xl border border-ink/10 bg-slate-base/50 p-5">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{card.body}</p>
            <p className="mt-3 font-mono text-[11px] tracking-wide text-ink-muted">{card.eta}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
