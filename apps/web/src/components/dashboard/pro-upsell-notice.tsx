import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

/**
 * Contextual Pro upsell. Renders when there's a real reason to nudge:
 * - `variant="quota-heavy"` → 75-89% of monthly AI-fix quota used.
 * - `variant="quota-near"` → 90-99% used. Stronger tone.
 * - `variant="quota-reached"` → 100% used. Blocking tone; link to billing.
 * - `variant="site-free"` → this private site is still on the free tier.
 *
 * The intent stays honest: we quote the REAL remaining count / free-loop
 * state, not a fabricated one, and every button links to a real route.
 */
export interface ProUpsellProps {
  readonly variant: 'quota-heavy' | 'quota-near' | 'quota-reached' | 'site-free';
  readonly remaining?: number;
  readonly quota?: number;
  readonly resetLabel?: string;
  /** Site id, for the site-free variant CTA. */
  readonly siteId?: string;
}

export function ProUpsellNotice(props: ProUpsellProps) {
  const { variant, remaining, quota, resetLabel, siteId } = props;

  if (variant === 'quota-reached') {
    return (
      <NoticeShell tone="red" icon={<AlertIcon color={PC.red} />}>
        <div style={line}>
          <b style={strong}>Monthly AI-fix quota reached.</b> You've used {quota ?? 90} of{' '}
          {quota ?? 90} this month. New AI-generated fixes resume{' '}
          {resetLabel !== undefined ? `on ${resetLabel}` : 'next month'} — or upgrade for a fresh
          quota.
        </div>
        <div style={ctaRow}>
          <Link href="/dashboard/billing" style={primaryBtn}>
            Manage billing
          </Link>
          <Link href="/pricing" style={ghostLink}>
            See pricing →
          </Link>
        </div>
      </NoticeShell>
    );
  }

  if (variant === 'quota-near') {
    return (
      <NoticeShell tone="amber" icon={<AlertIcon color={PC.amber} />}>
        <div style={line}>
          <b style={strong}>Almost out of AI fixes.</b> {remaining ?? 0} left this month
          {resetLabel !== undefined ? ` · resets ${resetLabel}` : ''}. Upgrade to lift the ceiling
          on fix-PR generation.
        </div>
        <div style={ctaRow}>
          <Link href="/dashboard/billing" style={secondaryBtn}>
            Manage billing →
          </Link>
        </div>
      </NoticeShell>
    );
  }

  if (variant === 'quota-heavy') {
    return (
      <NoticeShell tone="amber" icon={<GaugeIcon color={PC.amber} />}>
        <div style={line}>
          Heavy month — {remaining ?? 0} AI fixes remaining
          {resetLabel !== undefined ? ` before the ${resetLabel} reset` : ''}. Consider Pro if you
          need headroom.
        </div>
      </NoticeShell>
    );
  }

  // site-free
  return (
    <NoticeShell tone="blue" icon={<SparkIcon color="#2F6FED" />}>
      <div style={line}>
        <b style={strong}>Private repo · one free fix-to-proof loop.</b> After the first merged fix,
        upgrade to Pro to keep Drift Guard watching and fix-PRs flowing on this site.
      </div>
      <div style={ctaRow}>
        {siteId !== undefined ? (
          <Link href={`/dashboard/sites/${siteId}`} style={ghostLink}>
            View site →
          </Link>
        ) : null}
        <Link href="/pricing" style={ghostLink}>
          See pricing →
        </Link>
      </div>
    </NoticeShell>
  );
}

/* ── shells + shared style ── */

function NoticeShell({
  tone,
  icon,
  children,
}: {
  tone: 'amber' | 'red' | 'blue';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const border = tone === 'red' ? '#F5C0C0' : tone === 'amber' ? '#F3D8A6' : '#D8E3FA';
  const bg = tone === 'red' ? PC.redWash : tone === 'amber' ? '#FEF7E6' : '#F1F5FE';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        border: `1px solid ${border}`,
        background: bg,
        borderRadius: 10,
      }}
    >
      <span style={{ flex: '0 0 auto', marginTop: 2 }}>{icon}</span>
      <div
        style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {children}
      </div>
    </div>
  );
}

const line = { fontSize: 13.5, color: PC.ink, lineHeight: 1.55 } as const;
const strong = { fontWeight: 600, color: PC.ink } as const;
const ctaRow = { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const };
const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 32,
  padding: '0 12px',
  background: PC.ink,
  borderRadius: 7,
  fontFamily: BODY,
  fontSize: 12.5,
  fontWeight: 500,
  color: '#FAFAF8',
  textDecoration: 'none',
} as const;
const secondaryBtn = {
  ...primaryBtn,
  background: 'transparent',
  border: `1px solid ${PC.line}`,
  color: PC.ink,
} as const;
const ghostLink = {
  fontFamily: MONO,
  fontSize: 12,
  color: PC.dim,
  textDecoration: 'none',
} as const;

/* ── icons ── */

function AlertIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function GaugeIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 14 4-4" />
      <path d="M3.34 19a10 10 0 1 1 17.32 0" />
    </svg>
  );
}

function SparkIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3v3" />
      <path d="M12 18v3" />
      <path d="M5.6 5.6l2.1 2.1" />
      <path d="M16.3 16.3l2.1 2.1" />
      <path d="M3 12h3" />
      <path d="M18 12h3" />
      <path d="M5.6 18.4l2.1-2.1" />
      <path d="M16.3 7.7l2.1-2.1" />
    </svg>
  );
}
