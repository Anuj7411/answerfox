import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import {
  type SiteAiFixRow,
  listAiFixesForSite,
  listMonthlyAiFixUsage,
} from '@/lib/db/queries/ai-fixes';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
  readonly searchParams: Promise<{ readonly status?: string }>;
}

type FixFilter = 'all' | 'succeeded' | 'pending' | 'failed';

const FILTERS: ReadonlyArray<{ key: FixFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'succeeded', label: 'Generated' },
  { key: 'pending', label: 'Pending' },
  { key: 'failed', label: 'Failed' },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  succeeded: { label: 'generated', color: '#7C3AED', bg: 'rgba(124,58,237,.10)' },
  pending: { label: 'pending', color: '#B45309', bg: '#FBEFD6' },
  failed: { label: 'failed', color: '#9C9C95', bg: '#F5F5F2' },
};

const CATEGORY_LABEL: Record<string, string> = {
  'meta-and-technical': 'Meta & Technical',
  'content-structure': 'Content Structure',
  'structured-data': 'Structured Data',
  'eeat-and-authority': 'E-E-A-T & Authority',
  'offsite-citations': 'Off-site Citations',
  'og-and-social': 'Open Graph & Social',
};

const SEVERITY_STYLE: Record<string, { color: string; bg: string }> = {
  critical: { color: '#DC2626', bg: '#FBE9E9' },
  high: { color: '#B23A08', bg: 'rgba(243,69,4,.08)' },
  medium: { color: '#B45309', bg: '#FBEFD6' },
  low: { color: '#9C9C95', bg: '#F5F5F2' },
};

export default async function FixPrsPage({ params, searchParams }: PageProps) {
  const { siteId } = await params;
  const { status: statusRaw } = await searchParams;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const [fixes, quota] = await Promise.all([
    listAiFixesForSite({ siteId, userId: user.id }),
    listMonthlyAiFixUsage(user.id),
  ]);

  const filter = parseFilter(statusRaw);
  const repoConnected = site.repoFullName !== null;

  const succeeded = fixes.filter((f) => f.status === 'succeeded');
  const pending = fixes.filter((f) => f.status === 'pending');
  const failed = fixes.filter((f) => f.status === 'failed');

  const sections: ReadonlyArray<{
    status: FixFilter;
    heading: string;
    sub: string;
    items: ReadonlyArray<SiteAiFixRow>;
  }> = [
    {
      status: 'succeeded',
      heading: 'Generated',
      sub: `patches ready · ${succeeded.length}`,
      items: succeeded,
    },
    {
      status: 'pending',
      heading: 'Pending',
      sub: `generating · ${pending.length}`,
      items: pending,
    },
    {
      status: 'failed',
      heading: 'Failed',
      sub: `${failed.length}`,
      items: failed,
    },
  ];

  const quotaPct =
    quota.quota > 0 ? Math.min(100, Math.round((quota.used / quota.quota) * 100)) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* PAGE HEADER */}
      <div
        className="afx-phead"
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            Fix-PRs
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontSize: 14,
              lineHeight: 1.5,
              color: PC.muted,
              maxWidth: '54ch',
            }}
          >
            {repoConnected ? (
              <>
                Every fix Answerfox generated for{' '}
                <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
                  {site.repoFullName}
                </span>
              </>
            ) : (
              <>
                AI-generated fixes for findings on{' '}
                <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
                  {stripScheme(site.url)}
                </span>
              </>
            )}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                display: 'block',
                width: 80,
                height: 6,
                background: '#F0F0EC',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  display: 'block',
                  height: '100%',
                  width: `${quotaPct}%`,
                  background: quotaPct > 80 ? '#B45309' : '#15803D',
                  borderRadius: 999,
                }}
              />
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: PC.muted,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {quota.used} of {quota.quota} this month
            </span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              background: PC.hover,
              border: `1px solid ${PC.line}`,
              borderRadius: 6,
              padding: 2,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            {FILTERS.map((f) => {
              const on = f.key === filter;
              return (
                <Link
                  key={f.key}
                  href={`/dashboard/sites/${siteId}/fix-prs${f.key === 'all' ? '' : `?status=${f.key}`}`}
                  style={{
                    fontFamily: BODY,
                    fontSize: 13,
                    fontWeight: 500,
                    height: 28,
                    padding: '0 12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: `1px solid ${on ? '#DEDDD7' : 'transparent'}`,
                    background: on ? PC.card : 'transparent',
                    color: on ? PC.ink : PC.muted,
                    borderRadius: 4,
                    textDecoration: 'none',
                  }}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* HERO CARD */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '40ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {fixes.length === 0 ? (
          repoConnected ? (
            <>
              <span style={{ fontSize: 15, color: PC.ink }}>
                No fixes generated yet. Start from the Findings page.
              </span>
              <Link
                href={`/dashboard/sites/${siteId}/findings`}
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
                  textDecoration: 'none',
                }}
              >
                Go to Findings
              </Link>
            </>
          ) : (
            <>
              <span style={{ fontSize: 15, color: PC.ink }}>
                Connect a GitHub repo on Settings to enable automated fix-PRs.
              </span>
              <Link
                href={`/dashboard/sites/${siteId}/settings`}
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
                  textDecoration: 'none',
                }}
              >
                Go to Settings
              </Link>
            </>
          )
        ) : (
          <>
            <span style={{ fontSize: 15, color: PC.ink }}>
              {succeeded.length} fix{succeeded.length === 1 ? '' : 'es'} generated
              {pending.length > 0 ? `, ${pending.length} pending` : ''}.
            </span>
            {repoConnected ? (
              <a
                href={`https://github.com/${site.repoFullName}/pulls`}
                target="_blank"
                rel="noopener noreferrer"
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
                  textDecoration: 'none',
                }}
              >
                <ExternalLinkIcon />
                Review on GitHub
              </a>
            ) : null}
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: PC.dim,
                marginLeft: 'auto',
              }}
            >
              {quota.remaining} remaining this month.
            </span>
          </>
        )}
      </div>

      {/* FIX LIST */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '80ms',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {sections.map(({ status, heading, sub, items }) => {
          if (filter !== 'all' && filter !== status) return null;
          if (items.length === 0) return null;
          return (
            <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  padding: '0 2px',
                }}
              >
                <span
                  style={{
                    fontFamily: BODY,
                    fontWeight: 600,
                    fontSize: 13,
                    color: PC.ink,
                  }}
                >
                  {heading}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: '.06em',
                    textTransform: 'uppercase',
                    color: PC.dim,
                  }}
                >
                  {sub}
                </span>
              </div>
              <div
                style={{
                  background: PC.card,
                  border: `1px solid ${PC.line}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                {items.map((fix, i) => (
                  <FixRow key={fix.id} fix={fix} siteId={siteId} last={i === items.length - 1} />
                ))}
              </div>
            </div>
          );
        })}

        {filter !== 'all' &&
          fixes.length > 0 &&
          sections.find((s) => s.status === filter)?.items.length === 0 && (
            <div
              style={{
                background: PC.card,
                border: `1px solid ${PC.line}`,
                borderRadius: 12,
                padding: '32px 20px',
                textAlign: 'center',
                fontSize: 14,
                color: PC.muted,
              }}
            >
              No {FILTERS.find((f) => f.key === filter)?.label.toLowerCase()} fixes.
            </div>
          )}
      </div>

      {/* SCOPE NOTE */}
      {fixes.length > 0 ? (
        <div
          style={{
            animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
            animationDelay: '120ms',
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.6,
            color: PC.dim,
            maxWidth: '72ch',
          }}
        >
          Today this page shows every AI-fix generation and its outcome. PR tracking — pull request
          numbers, merge/close lifecycle, and before → after score deltas — lands when the
          webhook-to-PR pipeline exposes that data.
        </div>
      ) : null}
    </div>
  );
}

function FixRow({
  fix,
  siteId,
  last,
}: {
  readonly fix: SiteAiFixRow;
  readonly siteId: string;
  readonly last: boolean;
}) {
  const st = STATUS_STYLE[fix.status] ?? STATUS_STYLE.failed;
  const sev = SEVERITY_STYLE[fix.severity] ?? SEVERITY_STYLE.low;
  const catLabel = CATEGORY_LABEL[fix.category] ?? fix.category;

  return (
    <div
      className="afx-row"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 18px',
        borderBottom: last ? 'none' : `1px solid ${PC.line}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: PC.muted }}>{fix.checkId}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: '.04em',
            textTransform: 'uppercase',
            color: st.color,
            background: st.bg,
            borderRadius: 6,
            padding: '2px 8px',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: st.color,
            }}
          />
          {st.label}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flex: '1 1 auto',
          minWidth: 0,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: PC.ink }}>{catLabel}</span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontFamily: MONO,
            fontSize: 11,
            color: sev.color,
            background: sev.bg,
            border: fix.severity === 'low' ? `1px solid ${PC.line}` : 'none',
            borderRadius: 6,
            padding: '2px 8px',
          }}
        >
          {fix.severity}
        </span>
        {fix.status === 'failed' && fix.errorMessage ? (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              color: PC.dim,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 200,
            }}
          >
            {fix.errorMessage}
          </span>
        ) : null}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '0 0 auto' }}>
        {fix.status === 'succeeded' ? (
          <Link
            href={`/dashboard/sites/${siteId}/findings`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.04em',
              textTransform: 'uppercase',
              color: '#15803D',
              background: '#E7F6EC',
              borderRadius: 6,
              padding: '2px 8px',
              textDecoration: 'none',
            }}
          >
            patch
          </Link>
        ) : fix.status === 'pending' ? (
          <span style={{ fontFamily: MONO, fontSize: 12, color: '#B45309' }}>generating…</span>
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>errored</span>
        )}
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            color: PC.dim,
            width: 28,
            textAlign: 'right',
          }}
        >
          {timeAgo(fix.createdAt)}
        </span>
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FAFAF8"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="External link"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function timeAgo(date: Date): string {
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

function parseFilter(raw: string | undefined): FixFilter {
  if (raw === 'succeeded' || raw === 'pending' || raw === 'failed') return raw;
  return 'all';
}

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

export const dynamic = 'force-dynamic';
