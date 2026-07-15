import { Breadcrumb, WorkspaceNav } from '@/components/dashboard/porcelain-nav';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { SiteNav, SiteSwitcher } from '@/components/dashboard/site-sidebar';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Porcelain dashboard shell, copied from the Overview.dc.html design:
 * a 236px white sidebar (site switcher, icon workspace nav, account foot)
 * plus a top bar (breadcrumb, plan pill, add-a-site, avatar). Every
 * dashboard page renders inside the centered 1240px content column.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard');

  const sites = await listSitesForUser(user.id);
  const sitesLite = sites.map((s) => ({ id: s.id, name: s.name }));
  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'You';
  const userEmail = user.email ?? '';
  const initials = computeInitials(userName);
  const anyPaid = sites.some((s) => s.plan === 'paid');

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '236px 1fr',
        minHeight: '100vh',
        background: PC.bg,
        color: PC.ink,
        fontFamily: BODY,
      }}
    >
      <aside
        style={{
          background: PC.sidebar,
          borderRight: `1px solid ${PC.line}`,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
        }}
      >
        <SiteSwitcher sites={sitesLite} />

        <WorkspaceNav siteCount={sites.length} />
        <SiteNav sites={sitesLite} />

        {/* FOOT */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: 14,
            borderTop: `1px solid ${PC.line}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: PC.ink,
                color: '#FAFAF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 600,
                flex: '0 0 auto',
              }}
            >
              {initials}
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: PC.ink,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userName}
              </span>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  color: PC.dim,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {userEmail}
              </span>
            </span>
          </div>
          <SignOutButton />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              fontFamily: MONO,
              fontSize: 11,
              color: PC.dim,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: PC.greenBright,
                flex: '0 0 auto',
              }}
            />
            watching {sites.length} site{sites.length === 1 ? '' : 's'} · v0.9
          </div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* TOP BAR */}
        <div
          style={{
            height: 56,
            background: PC.bg,
            borderBottom: `1px solid ${PC.line}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <Breadcrumb />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '4px 11px',
                border: `1px solid ${PC.line}`,
                borderRadius: 999,
                fontFamily: MONO,
                fontSize: 12,
                color: PC.muted,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: anyPaid ? PC.greenBright : PC.dim,
                }}
              />
              {anyPaid ? 'Paid' : 'Free'}
            </span>
            <Link
              href="/dashboard/sites/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '0 12px',
                height: 34,
                background: PC.card,
                border: `1px solid ${PC.line16}`,
                borderRadius: 6,
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 500,
                color: PC.ink,
                textDecoration: 'none',
              }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PC.dim2}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              Add a site
            </Link>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: PC.ink,
                color: '#FAFAF8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {initials.slice(0, 1)}
            </span>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1240,
            width: '100%',
            margin: '0 auto',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function computeInitials(name: string): string {
  const source = name.trim();
  if (source.length === 0) return 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}
