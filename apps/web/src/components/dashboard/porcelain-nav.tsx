'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const MONO = 'var(--font-jetbrains), ui-monospace, monospace';
const LINE = 'rgba(20,22,16,.10)';

/**
 * Porcelain sidebar nav item. Client component so it can highlight the
 * active route. `exact` matches the pathname exactly (for the Overview
 * root); otherwise it matches the route prefix.
 */
export function NavItem({
  href,
  exact = false,
  count,
  countTone,
  children,
}: {
  readonly href: string;
  readonly exact?: boolean;
  readonly count?: number;
  readonly countTone?: 'muted' | 'red';
  readonly children: ReactNode;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '6px 10px',
        borderRadius: 6,
        fontSize: 13,
        textDecoration: 'none',
        color: active ? '#14150F' : '#5C625B',
        fontWeight: active ? 600 : 400,
        background: active ? '#FFFFFF' : 'transparent',
        border: active ? `1px solid ${LINE}` : '1px solid transparent',
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: active ? '#F34504' : '#C7CCC6',
          flex: '0 0 auto',
        }}
      />
      {children}
      {typeof count === 'number' ? (
        <span
          style={{
            marginLeft: 'auto',
            fontFamily: MONO,
            fontSize: 11,
            color: countTone === 'red' ? '#C4362B' : '#767B73',
          }}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
