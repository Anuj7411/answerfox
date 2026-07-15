'use client';

import { generateAIFixAction } from '@/app/(dashboard)/dashboard/sites/[siteId]/ai-fix-actions';
import type { GenerateAiFixState } from '@/app/(dashboard)/dashboard/sites/[siteId]/ai-fix-actions';
import { runAuditAction } from '@/app/(dashboard)/dashboard/sites/actions';
import { useActionState, useMemo, useState } from 'react';
import { BODY, MONO, PC } from './site-overview/porcelain';

/** Wired "Re-run" audit button for the Findings header. */
export function ReRunButton({ siteId }: { readonly siteId: string }) {
  const [, action, pending] = useActionState(runAuditAction, {});
  return (
    <form action={action}>
      <input type="hidden" name="siteId" value={siteId} />
      <button
        type="submit"
        disabled={pending}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 12px',
          height: 32,
          background: PC.card,
          border: `1px solid ${PC.line16}`,
          borderRadius: 6,
          fontFamily: BODY,
          fontSize: 13,
          fontWeight: 500,
          color: PC.ink,
          cursor: pending ? 'wait' : 'pointer',
          opacity: pending ? 0.7 : 1,
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
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
          <path d="M8 16H3v5" />
        </svg>
        {pending ? 'Re-running…' : 'Re-run'}
      </button>
    </form>
  );
}

export interface FindingItem {
  readonly id: string;
  readonly checkId: string;
  readonly category: string;
  readonly severity: 'critical' | 'high' | 'medium' | 'low';
  readonly status: 'pass' | 'fail' | 'warn' | 'skip';
  readonly evidence: string | null;
  readonly fixRecommendation: string | null;
}

export interface FindingGroup {
  readonly category: string;
  readonly label: string;
  readonly items: readonly FindingItem[];
  readonly fail: number;
}

const STATUS_COLOR: Record<string, string> = {
  fail: PC.red,
  warn: PC.amber,
  pass: PC.green,
  skip: PC.dim,
};

/** Functional Findings view (Findings.dc.html): category filter + search over
 *  collapsible groups of checks, each expandable to evidence + fix + Generate-fix. */
export function FindingsView({ groups }: { readonly groups: readonly FindingGroup[] }) {
  const [cat, setCat] = useState('all');
  const [query, setQuery] = useState('');

  const filters = [
    { key: 'all', label: 'All' },
    ...groups.map((g) => ({ key: g.category, label: g.label })),
  ];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => cat === 'all' || g.category === cat)
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            q === '' ||
            it.checkId.toLowerCase().includes(q) ||
            (it.fixRecommendation ?? '').toLowerCase().includes(q) ||
            (it.evidence ?? '').toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, cat, query]);

  return (
    <>
      {/* CONTROL ROW */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            background: PC.hover,
            border: `1px solid ${PC.line}`,
            borderRadius: 6,
            padding: 2,
            flexWrap: 'wrap',
          }}
        >
          {filters.map((f) => {
            const active = cat === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setCat(f.key)}
                style={{
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  height: 28,
                  padding: '0 12px',
                  border: `1px solid ${active ? PC.line16 : 'transparent'}`,
                  background: active ? PC.card : 'transparent',
                  color: active ? PC.ink : PC.muted,
                  borderRadius: 4,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 32,
            padding: '0 12px',
            background: PC.card,
            border: `1px solid ${PC.line16}`,
            borderRadius: 6,
            width: 240,
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
            style={{ flex: '0 0 auto' }}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Filter checks…"
            style={{
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: 13,
              color: PC.ink,
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* GROUPS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visible.length === 0 ? (
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 12,
              padding: '40px 24px',
              textAlign: 'center',
              fontSize: 14,
              color: PC.muted,
            }}
          >
            No checks match.
          </div>
        ) : (
          visible.map((g) => <Group key={g.category} group={g} />)
        )}
      </div>
    </>
  );
}

function Group({ group }: { readonly group: FindingGroup }) {
  const [open, setOpen] = useState(group.fail > 0);
  const total = group.items.length;
  const fail = group.items.filter((i) => i.status === 'fail').length;
  const warn = group.items.filter((i) => i.status === 'warn').length;
  const pass = group.items.filter((i) => i.status === 'pass').length;

  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 18px',
          textAlign: 'left',
        }}
      >
        <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
          {group.label}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 12,
            color: fail > 0 ? PC.red : PC.muted,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fail > 0 ? `${fail} failing / ${total}` : `${total} checks`}
        </span>
        <span
          style={{
            display: 'flex',
            height: 4,
            width: 120,
            borderRadius: 999,
            overflow: 'hidden',
            background: '#F0F0EC',
            marginLeft: 'auto',
          }}
        >
          {fail > 0 ? (
            <span style={{ width: `${(fail / total) * 100}%`, background: PC.red }} />
          ) : null}
          {warn > 0 ? (
            <span style={{ width: `${(warn / total) * 100}%`, background: PC.amber }} />
          ) : null}
          {pass > 0 ? (
            <span style={{ width: `${(pass / total) * 100}%`, background: PC.greenBright }} />
          ) : null}
        </span>
        <Chevron open={open} />
      </button>
      {open ? (
        <div style={{ borderTop: `1px solid ${PC.line}` }}>
          {group.items.map((it) => (
            <Row key={it.id} item={it} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

const initialFix: GenerateAiFixState = { status: 'idle' };

function Row({ item }: { readonly item: FindingItem }) {
  const [open, setOpen] = useState(false);
  const [fix, fixAction, fixing] = useActionState(
    async () => generateAIFixAction(item.id),
    initialFix,
  );
  const color = STATUS_COLOR[item.status] ?? PC.dim;
  const canFix = item.status === 'fail' || item.status === 'warn';
  const title = item.fixRecommendation ?? item.evidence ?? item.category;

  return (
    <div style={{ borderBottom: `1px solid ${PC.line}` }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 18px',
          textAlign: 'left',
        }}
      >
        <StatusIcon status={item.status} color={color} />
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim, flex: '0 0 auto' }}>
          {item.checkId}
        </span>
        <span
          style={{
            fontSize: 14,
            color: PC.ink,
            flex: '1 1 auto',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color,
            flex: '0 0 auto',
          }}
        >
          {item.status}
        </span>
        <Chevron open={open} small />
      </button>
      {open ? (
        <div style={{ padding: '0 18px 18px 46px' }}>
          {item.evidence ? (
            <div
              style={{
                background: PC.hover,
                borderRadius: 6,
                padding: '10px 12px',
                fontFamily: MONO,
                fontSize: 12,
                color: PC.muted,
                whiteSpace: 'pre-wrap',
              }}
            >
              {item.evidence}
            </div>
          ) : null}
          {item.fixRecommendation ? (
            <p style={{ margin: '12px 0 0', fontSize: 14, lineHeight: 1.5, color: PC.ink }}>
              {item.fixRecommendation}
            </p>
          ) : null}
          {canFix ? (
            <form
              action={fixAction}
              style={{
                marginTop: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="submit"
                disabled={fixing}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 14px',
                  height: 36,
                  background: PC.ink,
                  borderRadius: 6,
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FAFAF8',
                  border: 'none',
                  cursor: fixing ? 'wait' : 'pointer',
                  marginLeft: 'auto',
                  opacity: fixing ? 0.7 : 1,
                }}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FAFAF8"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="18" cy="18" r="3" />
                  <circle cx="6" cy="6" r="3" />
                  <path d="M13 6h3a2 2 0 0 1 2 2v7" />
                  <line x1="6" x2="6" y1="9" y2="21" />
                </svg>
                {fixing ? 'Generating…' : 'Generate fix'}
              </button>
            </form>
          ) : null}
          <FixResult state={fix} />
        </div>
      ) : null}
    </div>
  );
}

function FixResult({ state }: { readonly state: GenerateAiFixState }) {
  if (state.status === 'idle') return null;
  if (state.status === 'quota-exceeded') {
    return (
      <Note tone={PC.amber}>
        Monthly fix quota reached ({state.used}/{state.quota}). Upgrade to keep generating.
      </Note>
    );
  }
  if (state.status === 'failed') {
    return <Note tone={PC.red}>{state.error}</Note>;
  }
  const a = state.artifact;
  const code = 'snippet' in a ? a.snippet : 'diff' in a ? a.diff : JSON.stringify(a, null, 2);
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ margin: '0 0 8px', fontSize: 13, color: PC.muted }}>{a.explanation}</p>
      <pre
        style={{
          margin: 0,
          background: '#1C1C19',
          color: '#E8E6E1',
          borderRadius: 8,
          padding: '12px 14px',
          fontFamily: MONO,
          fontSize: 12,
          lineHeight: 1.6,
          overflow: 'auto',
        }}
      >
        {code}
      </pre>
      <p style={{ margin: '8px 0 0', fontFamily: MONO, fontSize: 11, color: PC.dim }}>
        {state.remaining} fixes left this month
      </p>
    </div>
  );
}

function Note({ tone, children }: { readonly tone: string; readonly children: React.ReactNode }) {
  return (
    <div
      style={{
        marginTop: 12,
        background: `${tone}14`,
        borderRadius: 8,
        padding: '10px 12px',
        fontFamily: MONO,
        fontSize: 12,
        color: tone,
      }}
    >
      {children}
    </div>
  );
}

function StatusIcon({ status, color }: { readonly status: string; readonly color: string }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flex: '0 0 auto' },
  };
  if (status === 'pass') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    );
  }
  if (status === 'warn') {
    return (
      <svg {...common} aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (status === 'skip') {
    return (
      <svg {...common} aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function Chevron({ open, small }: { readonly open: boolean; readonly small?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.dim2}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flex: '0 0 auto',
        transform: open ? 'rotate(90deg)' : 'none',
        transition: 'transform 160ms cubic-bezier(.4,0,.2,1)',
        opacity: small ? 0.8 : 1,
      }}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
