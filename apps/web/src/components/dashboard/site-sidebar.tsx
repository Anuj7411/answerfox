'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BODY, MONO, PC } from './site-overview/porcelain';

interface SiteLite {
  readonly id: string;
  readonly name: string;
}

/** Extract the active siteId from a /dashboard/sites/<id>[/tab] path, or null. */
function activeSiteId(pathname: string): string | null {
  const m = pathname.match(/^\/dashboard\/sites\/([^/]+)/);
  if (m === null) return null;
  const id = m[1];
  if (id === undefined || id === 'new') return null;
  return id;
}

/**
 * Site switcher card (top of the sidebar). Shows the current site (or
 * "All sites") and opens a dropdown to jump between sites. Functional —
 * replaces the static switcher from the design.
 */
export function SiteSwitcher({ sites }: { readonly sites: readonly SiteLite[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const activeId = activeSiteId(pathname);
  const active = activeId ? sites.find((s) => s.id === activeId) : undefined;
  const label = active ? active.name : 'All sites';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '11px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: PC.card,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <FoxLogo />
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            lineHeight: 1.2,
            minWidth: 0,
            flex: '1 1 auto',
          }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 13.5,
              letterSpacing: '-.01em',
              color: PC.ink,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: PC.dim }}>
            {sites.length} site{sites.length === 1 ? '' : 's'}
          </span>
        </span>
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
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      </button>

      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            zIndex: 50,
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 10,
            boxShadow: '0 12px 32px -12px rgba(20,22,16,.25)',
            padding: 4,
            maxHeight: 320,
            overflow: 'auto',
          }}
        >
          <Link href="/dashboard/sites" onClick={() => setOpen(false)} style={itemStyle(!activeId)}>
            All sites
          </Link>
          {sites.length > 0 ? (
            <div style={{ height: 1, background: PC.line, margin: '4px 0' }} />
          ) : null}
          {sites.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/sites/${s.id}`}
              onClick={() => setOpen(false)}
              style={itemStyle(s.id === activeId)}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function itemStyle(active: boolean): React.CSSProperties {
  return {
    display: 'block',
    padding: '7px 10px',
    borderRadius: 6,
    fontSize: 13,
    color: active ? PC.ink : PC.muted,
    fontWeight: active ? 600 : 400,
    background: active ? PC.hover : 'transparent',
    textDecoration: 'none',
  };
}

const TABS: ReadonlyArray<{ slug: string; label: string; exact?: boolean }> = [
  { slug: '', label: 'Overview', exact: true },
  { slug: '/findings', label: 'Findings' },
  { slug: '/x-ray', label: 'X-Ray' },
  { slug: '/fix-prs', label: 'Fix-PRs' },
  { slug: '/history', label: 'History' },
  { slug: '/drift-guard', label: 'Drift Guard' },
  { slug: '/ai-traffic', label: 'AI Traffic' },
  { slug: '/settings', label: 'Settings' },
];

/**
 * Per-site nav group. Appears in the sidebar (below the workspace nav)
 * only when viewing a specific site, mirroring the design's per-site tabs.
 */
export function SiteNav({ sites }: { readonly sites: readonly SiteLite[] }) {
  const pathname = usePathname();
  const id = activeSiteId(pathname);
  if (id === null) return null;
  const site = sites.find((s) => s.id === id);
  const base = `/dashboard/sites/${id}`;

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
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {site ? site.name : 'Site'}
      </div>
      {TABS.map((t) => {
        const href = `${base}${t.slug}`;
        const active = t.exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={t.slug || 'overview'}
            href={href}
            aria-current={active ? 'page' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13,
              textDecoration: 'none',
              fontWeight: active ? 600 : 400,
              color: active ? PC.ink : PC.muted,
              background: active ? PC.hover : 'transparent',
              boxShadow: active ? `inset 3px 0 0 ${PC.blaze}` : 'none',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: active ? PC.blaze : PC.faint,
                flex: '0 0 auto',
              }}
            />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function FoxLogo() {
  return (
    <svg
      viewBox="296 223 927 518"
      style={{ display: 'block', height: 19, width: 'auto', flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <defs>
        <mask id="afxmsw">
          <rect x="296" y="223" width="927" height="518" fill="#fff" />
          <rect x="700" y="493" width="523" height="18" fill="#000" />
        </mask>
      </defs>
      <polygon
        points="717,223 877,223 970,741 851,741 776,335 443,741 296,741"
        fill="#1C1C19"
        mask="url(#afxmsw)"
      />
      <polygon points="734,413 1223,413 1144,493 668,493" fill="#F34504" />
      <polygon points="655,511 1077,511 1000,591 589,591" fill="#F34504" />
      <polygon points="574,611 674,611 567,741 467,741" fill="#F34504" />
    </svg>
  );
}
