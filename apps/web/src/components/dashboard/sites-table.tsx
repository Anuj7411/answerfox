'use client';

import { runAuditAction } from '@/app/(dashboard)/dashboard/sites/actions';
import Link from 'next/link';
import { type CSSProperties, type ReactElement, useActionState, useMemo, useState } from 'react';
import { BODY, MONO, PC } from './site-overview/porcelain';

export interface SiteRow {
  readonly id: string;
  readonly name: string;
  readonly repo: string;
  readonly initial: string;
  readonly score: number | null;
  readonly band: string | null;
  readonly verif: 'verified' | 'pending' | 'failed' | 'unverified';
  readonly plan: 'Paid' | 'Free';
  readonly auditedLabel: string;
  readonly ageMs: number;
  readonly needs: boolean;
}

const GRID = 'minmax(200px,2.3fr) 1.25fr 1.1fr 0.8fr 0.95fr 96px';

const CHIPS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'needs', label: 'Needs attention' },
  { key: 'paid', label: 'Paid' },
  { key: 'free', label: 'Free' },
];

/**
 * Sites table, from Sites.dc.html: filter chips + sort + search over the row
 * grid. Fully functional — filtering/sorting is client-side over real data,
 * and each row's audit button fires the real runAuditAction.
 */
export function SitesTable({ rows }: { readonly rows: readonly SiteRow[] }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('readiness');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = rows.filter((s) => {
      if (filter === 'needs' && !s.needs) return false;
      if (filter === 'paid' && s.plan !== 'Paid') return false;
      if (filter === 'free' && s.plan !== 'Free') return false;
      if (q && !(s.name.toLowerCase().includes(q) || s.repo.toLowerCase().includes(q)))
        return false;
      return true;
    });
    const sorted = [...filtered];
    if (sort === 'readiness') sorted.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    else if (sort === 'audited') sorted.sort((a, b) => a.ageMs - b.ageMs);
    else sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [rows, filter, sort, query]);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            background: PC.hover,
            border: `1px solid ${PC.line}`,
            borderRadius: 8,
            padding: 2,
            flexWrap: 'wrap',
          }}
        >
          {CHIPS.map((c) => {
            const active = filter === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                style={{
                  fontFamily: BODY,
                  fontSize: 12.5,
                  fontWeight: 500,
                  height: 28,
                  padding: '0 12px',
                  border: `1px solid ${active ? PC.line : 'transparent'}`,
                  background: active ? PC.card : 'transparent',
                  color: active ? PC.ink : PC.muted,
                  borderRadius: 6,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        <span style={{ flex: '1 1 auto' }} />
        <select
          value={sort}
          onChange={(e) => setSort(e.currentTarget.value)}
          style={{
            height: 32,
            padding: '0 10px',
            border: `1px solid ${PC.line16}`,
            borderRadius: 8,
            background: PC.card,
            fontSize: 12.5,
            color: PC.ink,
            cursor: 'pointer',
          }}
        >
          <option value="readiness">Sort: Readiness</option>
          <option value="audited">Sort: Last audited</option>
          <option value="name">Sort: Name</option>
        </select>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 32,
            padding: '0 10px',
            border: `1px solid ${PC.line16}`,
            borderRadius: 8,
            background: PC.card,
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PC.dim}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Filter sites…"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: PC.ink,
              width: 150,
            }}
          />
        </div>
      </div>

      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID,
            gap: 14,
            alignItems: 'center',
            padding: '11px 20px',
            borderBottom: `1px solid ${PC.line}`,
            background: '#FCFCFA',
          }}
        >
          {['Site', 'Readiness', 'Verification', 'Plan', 'Last audited'].map((h) => (
            <span key={h} style={headStyle}>
              {h}
            </span>
          ))}
          <span style={{ ...headStyle, textAlign: 'right' }}>Actions</span>
        </div>

        {list.length === 0 ? (
          <div
            style={{ padding: '48px 24px', textAlign: 'center', fontSize: 13.5, color: PC.muted }}
          >
            No sites match this filter.
          </div>
        ) : (
          list.map((s) => <Row key={s.id} s={s} />)
        )}
      </div>
    </>
  );
}

function Row({ s }: { readonly s: SiteRow }) {
  const band = bandColors(s.band);
  const verif = verifMeta(s.verif);
  const [, auditAction, auditing] = useActionState(runAuditAction, {});
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: GRID,
        gap: 14,
        alignItems: 'center',
        padding: '13px 20px',
        borderTop: `1px solid ${PC.line}`,
      }}
    >
      <Link
        href={`/dashboard/sites/${s.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 11,
          minWidth: 0,
          textDecoration: 'none',
        }}
      >
        <span
          style={{
            flex: '0 0 auto',
            width: 30,
            height: 30,
            borderRadius: 8,
            background: PC.hover,
            border: `1px solid ${PC.line}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 13,
            color: PC.muted,
          }}
        >
          {s.initial}
        </span>
        <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.25 }}>
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: PC.ink,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.name}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              color: PC.dim,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {s.repo}
          </span>
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {s.score === null ? (
          <span style={{ fontFamily: MONO, fontSize: 13, color: PC.dim }}>—</span>
        ) : (
          <>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 16,
                fontWeight: 600,
                color: band.c,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.score}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '.03em',
                textTransform: 'uppercase',
                color: band.c,
                background: band.bg,
                borderRadius: 5,
                padding: '2px 8px',
              }}
            >
              {s.band}
            </span>
          </>
        )}
      </div>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: MONO,
          fontSize: 11.5,
          color: verif.color,
        }}
      >
        {verif.icon}
        {verif.label}
      </span>

      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO,
            fontSize: 11.5,
            color: s.plan === 'Paid' ? PC.green : PC.muted,
            border: `1px solid ${s.plan === 'Paid' ? PC.greenWash : PC.line}`,
            background: s.plan === 'Paid' ? PC.greenWash : PC.card,
            borderRadius: 999,
            padding: '2px 10px',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: s.plan === 'Paid' ? PC.greenBright : PC.dim,
            }}
          />
          {s.plan}
        </span>
      </div>

      <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>{s.auditedLabel}</span>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
        <form action={auditAction}>
          <input type="hidden" name="siteId" value={s.id} />
          <button
            type="submit"
            title="Audit now"
            aria-label="Audit now"
            disabled={auditing}
            style={{
              width: 30,
              height: 30,
              border: `1px solid ${PC.line}`,
              background: PC.card,
              borderRadius: 7,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: auditing ? 'wait' : 'pointer',
              opacity: auditing ? 0.6 : 1,
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PC.muted}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
        </form>
        <Link
          href={`/dashboard/sites/${s.id}`}
          title="Open"
          aria-label="Open"
          style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: PC.blazeDeep,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PC.blazeDeep}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

const headStyle: CSSProperties = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '.09em',
  textTransform: 'uppercase',
  color: PC.dim,
};

function bandColors(band: string | null): { c: string; bg: string } {
  if (band === 'weak' || band === 'critical') return { c: PC.red, bg: PC.redWash };
  if (band === 'average') return { c: PC.amber, bg: PC.amberWash };
  if (band === null) return { c: PC.dim, bg: PC.hover };
  return { c: PC.green, bg: PC.greenWash };
}

function verifMeta(v: SiteRow['verif']): { label: string; color: string; icon: ReactElement } {
  const common = {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (v === 'verified')
    return {
      label: 'verified',
      color: PC.green,
      icon: (
        <svg {...common} stroke={PC.green} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    };
  if (v === 'pending')
    return {
      label: 'pending',
      color: PC.amber,
      icon: (
        <svg {...common} stroke={PC.amber} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      ),
    };
  if (v === 'failed')
    return {
      label: 'failed',
      color: PC.red,
      icon: (
        <svg {...common} stroke={PC.red} aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      ),
    };
  return {
    label: 'unverified',
    color: PC.dim,
    icon: (
      <svg {...common} stroke={PC.dim} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4" />
        <path d="M12 16h.01" />
      </svg>
    ),
  };
}
