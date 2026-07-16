import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

/**
 * AI-fix monthly quota widget. Wired to the real quota shape returned by
 * `listMonthlyAiFixUsage(userId)`: `{ used, remaining, quota, resetAt }`.
 *
 * Two visual densities:
 * - `variant="compact"` — one-row strip for the Overview home.
 * - `variant="card"` — full card with reset line, for Account Settings.
 *
 * Empty of any local "band" fabrication: the color band comes purely from
 * the real used / quota ratio.
 */
export interface AiFixQuotaProps {
  readonly used: number;
  readonly quota: number;
  readonly remaining: number;
  readonly resetAt: Date;
  readonly variant?: 'card' | 'compact';
}

export function AiFixQuotaCard({
  used,
  quota,
  remaining,
  resetAt,
  variant = 'card',
}: AiFixQuotaProps) {
  const pct = quota > 0 ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const { bar, tone, label } = tierFor(pct);
  const resetLabel = resetAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const barBg = PC.hover;

  if (variant === 'compact') {
    return (
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 10,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: PC.dim,
            whiteSpace: 'nowrap',
          }}
        >
          AI fixes · month
        </span>
        <div
          style={{
            flex: '1 1 160px',
            minWidth: 120,
            height: 6,
            borderRadius: 999,
            background: barBg,
            overflow: 'hidden',
          }}
          aria-label={`Used ${used} of ${quota}`}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: bar, borderRadius: 999 }} />
        </div>
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.ink, whiteSpace: 'nowrap' }}>
          {used}
          <span style={{ color: PC.dim }}> / {quota}</span>
        </span>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: tone,
            background: barBg,
            borderRadius: 5,
            padding: '2px 8px',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <Link
          href="/dashboard/billing"
          style={{
            marginLeft: 'auto',
            fontFamily: MONO,
            fontSize: 11.5,
            color: PC.dim,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          resets {resetLabel} →
        </Link>
      </div>
    );
  }

  return (
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
          padding: '18px 20px',
          borderBottom: `1px solid ${PC.line}`,
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            AI fixes this month
          </span>
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
            Monthly generation quota
          </span>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO,
            fontSize: 11,
            color: tone,
            background: barBg,
            borderRadius: 5,
            padding: '3px 9px',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: bar }} />
          {label}
        </span>
      </div>

      <div
        style={{
          padding: '18px 20px 6px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 28,
              letterSpacing: '-.02em',
              color: PC.ink,
              lineHeight: 1,
            }}
          >
            {used}
            <span style={{ fontFamily: BODY, fontSize: 15, fontWeight: 500, color: PC.muted }}>
              {' '}
              / {quota}
            </span>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.muted }}>
            {remaining} remaining
          </span>
        </div>

        <div
          style={{ height: 8, borderRadius: 999, background: barBg, overflow: 'hidden' }}
          aria-label={`Used ${used} of ${quota}`}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: bar, borderRadius: 999 }} />
        </div>
      </div>

      <div
        style={{
          padding: '12px 20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
          Resets on {resetLabel}. Failed attempts don't count.
        </span>
      </div>

      <div
        style={{
          padding: '11px 20px',
          borderTop: `1px solid ${PC.line}`,
          background: '#FCFCFA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
          Pro tier: {quota} AI-generated fixes per month.
        </span>
        <Link
          href="/dashboard/billing"
          style={{
            fontFamily: BODY,
            fontSize: 12.5,
            color: PC.blazeDeep,
            textDecoration: 'none',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          Manage billing →
        </Link>
      </div>
    </div>
  );
}

function tierFor(pct: number): {
  readonly bar: string;
  readonly tone: string;
  readonly label: string;
} {
  if (pct >= 100) return { bar: PC.red, tone: PC.red, label: 'quota reached' };
  if (pct >= 90) return { bar: PC.red, tone: PC.red, label: 'near limit' };
  if (pct >= 75) return { bar: PC.amber, tone: PC.amber, label: 'heavy use' };
  if (pct >= 50) return { bar: PC.amber, tone: PC.amber, label: 'in flight' };
  return { bar: PC.green, tone: PC.green, label: 'plenty left' };
}
