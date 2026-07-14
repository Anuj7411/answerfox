'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { MONO, PC } from './site-overview/porcelain';

/**
 * Workspace sidebar nav, copied from the Overview.dc.html design: icon +
 * label rows, the active row tinted (#F5F5F2) with an inset orange left
 * bar. Client component so it can highlight the active route.
 */
const ITEMS: ReadonlyArray<{
  readonly href: string;
  readonly label: string;
  readonly exact?: boolean;
  readonly icon: ReactNode;
}> = [
  {
    href: '/dashboard',
    label: 'Overview',
    exact: true,
    icon: (
      <>
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </>
    ),
  },
  {
    href: '/dashboard/sites',
    label: 'Sites',
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        <path d="M2 12h20" />
      </>
    ),
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: (
      <>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </>
    ),
  },
  {
    href: '/dashboard/integrations',
    label: 'Integrations',
    icon: (
      <>
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
];

export function WorkspaceNav({ siteCount }: { readonly siteCount: number }) {
  const pathname = usePathname();
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: PC.dim,
          padding: '0 12px',
          margin: '4px 0 6px',
        }}
      >
        Workspace
      </div>
      {ITEMS.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '7px 12px',
              borderRadius: 6,
              fontSize: 13,
              textDecoration: 'none',
              fontWeight: active ? 500 : 400,
              color: active ? PC.ink : PC.muted,
              background: active ? PC.hover : 'transparent',
              boxShadow: active ? `inset 3px 0 0 ${PC.blaze}` : 'none',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={active ? PC.ink : PC.dim2}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {item.icon}
            </svg>
            {item.label}
            {item.label === 'Sites' && siteCount > 0 ? (
              <span style={{ marginLeft: 'auto', fontFamily: MONO, fontSize: 11, color: PC.dim }}>
                {siteCount}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Top-bar breadcrumb, e.g. "overview" or "sites / stripe.com". Mirrors the
 * lowercase mono crumb in the design, derived from the pathname so it
 * stays correct across pages without threading props through the layout.
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const parts = pathname.split('/').filter(Boolean);
  const rest = parts.slice(1); // drop leading "dashboard"
  const crumbs = rest.length === 0 ? ['overview'] : rest;
  return (
    <div style={{ fontFamily: MONO, fontSize: 12, color: PC.ink }}>
      {crumbs.map((c, i) => (
        <span key={`${c}-${i}`}>
          {i > 0 ? <span style={{ color: PC.faint }}> / </span> : null}
          <span style={{ color: i === crumbs.length - 1 ? PC.ink : PC.dim }}>{c}</span>
        </span>
      ))}
    </div>
  );
}
