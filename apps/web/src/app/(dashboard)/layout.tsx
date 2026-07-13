import { NavItem } from '@/components/dashboard/porcelain-nav';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

const DISPLAY = 'var(--font-archivo-expanded), var(--font-archivo), system-ui, sans-serif';
const MONO = 'var(--font-jetbrains), ui-monospace, monospace';
const LINE = 'rgba(20,22,16,.10)';

/**
 * Porcelain dashboard shell: a 236px sidebar (site switcher, workspace
 * nav, account foot) plus a top bar. Every dashboard page renders inside
 * the centered content column. Per-site nav is added by the site-level
 * layout when we reach the site pages.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard');

  const sites = await listSitesForUser(user.id);
  const userName = (user.user_metadata?.name as string | undefined) ?? user.email ?? 'You';
  const userEmail = user.email ?? '';
  const initials = computeInitials(userName);
  const primary = sites[0];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '236px 1fr',
        minHeight: '100vh',
        background: '#F4F5F3',
        color: '#14150F',
        fontFamily: 'var(--font-archivo), system-ui, sans-serif',
      }}
    >
      <aside
        style={{
          background: '#ECEEEB',
          borderRight: `1px solid ${LINE}`,
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
        <Link
          href="/dashboard"
          style={{
            background: '#FFFFFF',
            border: `1px solid ${LINE}`,
            borderRadius: 8,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <FoxLogo />
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15, minWidth: 0 }}>
            <span
              style={{
                fontFamily: DISPLAY,
                fontWeight: 800,
                fontSize: 13.5,
                letterSpacing: '-.01em',
                color: '#14150F',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {primary ? primary.name : 'Answerfox'}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: '#767B73' }}>
              {sites.length} site{sites.length === 1 ? '' : 's'}
            </span>
          </span>
          <span style={{ marginLeft: 'auto', color: '#767B73', fontSize: 12 }}>⌄</span>
        </Link>

        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <GroupLabel>Workspace</GroupLabel>
          <NavItem href="/dashboard" exact>
            Overview
          </NavItem>
          <NavItem href="/dashboard/sites">Sites</NavItem>
          <NavItem href="/dashboard/settings">Settings</NavItem>
        </div>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: 14,
            borderTop: `1px solid ${LINE}`,
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
                background: '#14150F',
                color: '#F4F5F3',
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
                  color: '#14150F',
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
                  color: '#767B73',
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
          <div style={{ fontFamily: MONO, fontSize: 11, color: '#767B73' }}>answerfox v0.9</div>
        </div>
      </aside>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div
          style={{
            height: 56,
            background: '#F4F5F3',
            borderBottom: `1px solid ${LINE}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 20,
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 12, color: '#767B73' }}>dashboard</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link
              href="/dashboard/sites/new"
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid rgba(20,22,16,.16)',
                borderRadius: 6,
                fontFamily: 'var(--font-archivo), sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#2A2E29',
                textDecoration: 'none',
              }}
            >
              + Add a site
            </Link>
            <span
              aria-hidden
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: '#14150F',
                color: '#F4F5F3',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
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
            gap: 16,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function GroupLabel({ children }: { readonly children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        color: '#767B73',
        padding: '0 10px',
        margin: '4px 0 6px',
      }}
    >
      {children}
    </div>
  );
}

function FoxLogo() {
  return (
    <svg
      viewBox="296 223 927 518"
      style={{ display: 'block', height: 20, width: 'auto', flex: '0 0 auto' }}
      aria-hidden
    >
      <defs>
        <mask id="afxm">
          <rect x="296" y="223" width="927" height="518" fill="#fff" />
          <rect x="700" y="493" width="523" height="18" fill="#000" />
        </mask>
      </defs>
      <polygon
        points="717,223 877,223 970,741 851,741 776,335 443,741 296,741"
        fill="#14150F"
        mask="url(#afxm)"
      />
      <polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504" />
      <polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504" />
      <polygon points="574,611 674,611 567,741 467,741" fill="#F34504" />
    </svg>
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
