import {
  type FindingGroup,
  type FindingItem,
  FindingsView,
  ReRunButton,
} from '@/components/dashboard/findings-view';
import { ProUpsellNotice } from '@/components/dashboard/pro-upsell-notice';
import { BODY, DISPLAY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { listMonthlyAiFixUsage } from '@/lib/db/queries/ai-fixes';
import { getAnnotationsForSite } from '@/lib/db/queries/annotations';
import { getLatestAuditForSite, listFindingsForAudit } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { notFound } from 'next/navigation';
import type { CSSProperties } from 'react';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

const CATEGORY_LABELS: Record<string, string> = {
  'agent-readiness': 'Agent readiness',
  'agentic-commerce': 'Agentic commerce',
  'meta-and-technical': 'Meta & technical',
  'content-structure': 'Content & structure',
  'structured-data': 'Structured data',
  'eeat-and-authority': 'E-E-A-T & authority',
  'og-and-social': 'Open Graph & social',
  'offsite-citations': 'Off-site & citations',
};

const STATUS_ORDER: Record<string, number> = { fail: 0, warn: 1, skip: 2, pass: 3 };

/** Sort findings within a group: failing first, then by check id. Server-side. */
function sortItems(items: readonly FindingItem[]): FindingItem[] {
  return [...items].sort(
    (a, b) =>
      (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9) ||
      a.checkId.localeCompare(b.checkId),
  );
}

function labelFor(category: string): string {
  return (
    CATEGORY_LABELS[category] ??
    category
      .split(/[-_\s]+/)
      .map((w) => (w ? w[0]?.toUpperCase() + w.slice(1) : w))
      .join(' ')
  );
}

export default async function FindingsPage({ params }: PageProps) {
  const { siteId } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const audit = await getLatestAuditForSite(site.id);

  if (audit === null) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Header siteId={site.id} title="Findings" subtitle="No audits yet" audit={null} />
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
          Run an audit to see findings for this site.
        </div>
      </div>
    );
  }

  const [findings, quota, notes] = await Promise.all([
    listFindingsForAudit(audit.id),
    listMonthlyAiFixUsage(user.id),
    getAnnotationsForSite(site.id, user.id),
  ]);
  const byCategory = new Map<string, FindingItem[]>();
  for (const f of findings) {
    const item: FindingItem = {
      id: f.id,
      checkId: f.checkId,
      category: f.category,
      severity: f.severity,
      status: f.status,
      evidence: f.evidence,
      fixRecommendation: f.fixRecommendation,
      note: notes[f.checkId] ?? null,
    };
    const arr = byCategory.get(f.category) ?? [];
    arr.push(item);
    byCategory.set(f.category, arr);
  }

  const groups: FindingGroup[] = [...byCategory.entries()]
    .map(([category, items]) => ({
      category,
      label: labelFor(category),
      items: sortItems(items),
      fail: items.filter((i) => i.status === 'fail').length,
    }))
    // failing groups first, then by size
    .sort((a, b) => b.fail - a.fail || b.items.length - a.items.length);

  const total = audit.passCount + audit.failCount + audit.warnCount + audit.skipCount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Header
        siteId={site.id}
        auditId={audit.id}
        title="Findings"
        subtitle={`${total} checks · latest audit ${relativeTime(audit.fetchedAt)}`}
        audit={{
          fail: audit.failCount,
          warn: audit.warnCount,
          pass: audit.passCount,
          skip: audit.skipCount,
        }}
      />
      {(() => {
        const pct = quota.quota > 0 ? Math.round((quota.used / quota.quota) * 100) : 0;
        const resetLabel = quota.resetAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        if (pct >= 100) {
          return (
            <ProUpsellNotice
              variant="quota-reached"
              quota={quota.quota}
              remaining={quota.remaining}
              resetLabel={resetLabel}
            />
          );
        }
        if (pct >= 90) {
          return (
            <ProUpsellNotice
              variant="quota-near"
              remaining={quota.remaining}
              resetLabel={resetLabel}
            />
          );
        }
        if (pct >= 75) {
          return (
            <ProUpsellNotice
              variant="quota-heavy"
              remaining={quota.remaining}
              resetLabel={resetLabel}
            />
          );
        }
        if (site.plan === 'free' && site.repoFullName !== null) {
          return <ProUpsellNotice variant="site-free" siteId={site.id} />;
        }
        return null;
      })()}
      <FindingsView siteId={site.id} groups={groups} />
    </div>
  );
}

function Header({
  siteId,
  auditId,
  title,
  subtitle,
  audit,
}: {
  readonly siteId: string;
  readonly auditId?: string;
  readonly title: string;
  readonly subtitle: string;
  readonly audit: { fail: number; warn: number; pass: number; skip: number } | null;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '-.02em',
            color: PC.ink,
          }}
        >
          {title}
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: MONO, fontSize: 13, color: PC.muted }}>
          {subtitle}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {audit ? (
          <>
            {audit.fail > 0 ? (
              <Pill color={PC.red} bg={PC.redWash}>
                {audit.fail} failing
              </Pill>
            ) : null}
            {audit.warn > 0 ? (
              <Pill color={PC.amber} bg={PC.amberWash}>
                {audit.warn} warnings
              </Pill>
            ) : null}
            <Pill color={PC.green} bg={PC.greenWash}>
              {audit.pass} passed
            </Pill>
            {audit.skip > 0 ? (
              <Pill color={PC.muted} bg={PC.hover}>
                {audit.skip} skipped
              </Pill>
            ) : null}
          </>
        ) : null}
        {auditId !== undefined && (
          <a
            href={`/api/sites/${siteId}/audits/${auditId}/export/csv`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 30,
              padding: '0 10px',
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 7,
              fontFamily: BODY,
              fontSize: 12.5,
              color: PC.ink,
              textDecoration: 'none',
            }}
            download
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PC.muted}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Export CSV
          </a>
        )}
        <ReRunButton siteId={siteId} />
      </div>
    </div>
  );
}

function Pill({
  color,
  bg,
  children,
}: { readonly color: string; readonly bg: string; readonly children: React.ReactNode }) {
  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    background: bg,
    borderRadius: 999,
    fontFamily: MONO,
    fontSize: 12,
    color,
    fontVariantNumeric: 'tabular-nums',
  };
  return <span style={style}>{children}</span>;
}

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}
