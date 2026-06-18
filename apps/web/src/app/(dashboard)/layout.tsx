import { FoxMark } from '@/components/brand/fox-mark';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard shell (V3). Sidebar (brand, sites list, nav, account chip)
 * plus a top bar (site switcher, search placeholder, bell placeholder).
 *
 * Middleware also gates `/dashboard/*` for unauthenticated users; this
 * server-side check is belt-and-braces.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/sign-in?redirect=/dashboard');
  }

  const sites = await listSitesForUser(user.id);
  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'You';
  const userEmail = user.email ?? '';
  const initials = (() => {
    const source = userName.trim();
    if (source.length === 0) return 'U';
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0]?.[0] ?? '';
      const b = parts[1]?.[0] ?? '';
      return `${a}${b}`.toUpperCase();
    }
    return source.slice(0, 2).toUpperCase();
  })();
  const primarySite = sites[0];

  return (
    <main className="dvp relative isolate min-h-screen overflow-hidden" data-page="dashboard">
      <div className="layer">
        <div className="db">
          <aside className="db-side">
            <Link href="/dashboard" className="brand">
              <FoxMark size={26} />
              <span className="wm">Answerfox</span>
            </Link>

            {sites.length > 0 && (
              <div className="db-sec">
                <div className="lbl">Sites</div>
                {sites.slice(0, 5).map((site, idx) => (
                  <Link
                    key={site.id}
                    href={`/dashboard/sites/${site.id}`}
                    className={`db-row${idx === 0 ? ' active' : ''}`}
                  >
                    <span
                      className="db-dot"
                      style={{ background: idx === 0 ? 'var(--ember)' : 'var(--violet)' }}
                    />
                    <span className="db-row-txt">{site.name}</span>
                  </Link>
                ))}
                {sites.length > 5 && (
                  <Link href="/dashboard/sites" className="db-row db-row-more">
                    +{sites.length - 5} more
                  </Link>
                )}
              </div>
            )}

            <div className="db-sec">
              <div className="lbl">Navigate</div>
              <Link href="/dashboard" className="db-row active">
                <span className="ic">
                  <DbIcon name="audits" />
                </span>
                Audits
              </Link>
              <Link href="/dashboard/sites" className="db-row">
                <span className="ic">
                  <DbIcon name="findings" />
                </span>
                Findings
              </Link>
              <Link href="/dashboard/sites" className="db-row">
                <span className="ic">
                  <DbIcon name="fixes" />
                </span>
                AI Fixes
              </Link>
              <Link href="/dashboard/sites/new" className="db-row">
                <span className="ic">
                  <DbIcon name="settings" />
                </span>
                Add site
              </Link>
            </div>

            <div className="db-foot">
              <div className="db-plan">
                <span>Plan</span>
                <span className="free">Free</span>
              </div>
              <Link href="/pricing" className="db-up">
                Upgrade to Pro
              </Link>
              <div className="db-acct">
                <span className="av" aria-hidden>
                  {initials}
                </span>
                <span className="who">
                  <span className="n">{userName}</span>
                  <span className="e">{userEmail}</span>
                </span>
              </div>
              <SignOutButton />
            </div>
          </aside>

          <section className="db-main">
            <div className="db-top">
              <Link
                href={primarySite ? `/dashboard/sites/${primarySite.id}` : '/dashboard/sites'}
                className="db-switch"
              >
                <span className="db-dot" style={{ background: 'var(--ember)' }} />
                {primarySite ? primarySite.name : 'No sites yet'}
                <span className="db-switch-caret">▾</span>
              </Link>
              <div className="right">
                <span className="db-search" aria-hidden>
                  <DbIcon name="search" size={15} />
                  <span className="db-search-ph">Search findings, fixes…</span>
                  <kbd>⌘K</kbd>
                </span>
                <button type="button" className="db-bell" aria-label="Notifications" disabled>
                  <span className="nd" />
                  <DbIcon name="bell" size={16} />
                </button>
              </div>
            </div>

            <div className="db-content">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DbIcon({ name, size = 16 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    audits: 'M3 13h3l2 5 4-13 2 8h4',
    findings: 'M4 5h12M4 10h12M4 15h7',
    fixes: 'M11 2 4 12h5l-1 8 8-12h-5z',
    settings:
      'M10 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.4 4.6l-1.4 1.4M6 14l-1.4 1.4M15.4 15.4 14 14M6 6 4.6 4.6',
    search: 'M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3zM17 17l-4-4',
    bell: 'M10 2a5 5 0 0 0-5 5c0 5-2 6-2 6h14s-2-1-2-6a5 5 0 0 0-5-5zM8.5 17a1.5 1.5 0 0 0 3 0',
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>{name}</title>
      <path d={paths[name]} />
    </svg>
  );
}
