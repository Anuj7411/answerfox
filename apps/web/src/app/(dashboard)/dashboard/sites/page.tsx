import { BODY, DISPLAY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { type SiteRow, SitesTable } from '@/components/dashboard/sites-table';
import { listLatestAuditsForUser } from '@/lib/db/queries/audits';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';

/**
 * Sites list (Porcelain, functional). Translated from Sites.dc.html: a
 * summary strip over an interactive table (filter chips + sort + search),
 * wired to real sites + latest audits, with a working per-row audit action.
 */
export default async function SitesPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const [sites, latestAudits] = await Promise.all([
    listSitesForUser(user.id),
    listLatestAuditsForUser(user.id),
  ]);
  const auditBySite = new Map(latestAudits.map((a) => [a.siteId, a]));

  const rows: SiteRow[] = sites.map((s) => {
    const audit = auditBySite.get(s.id);
    const auditedAt = s.lastAuditedAt ?? audit?.fetchedAt ?? null;
    return {
      id: s.id,
      name: s.name,
      repo: s.repoFullName ?? s.url,
      initial: s.name.slice(0, 1).toUpperCase(),
      score: audit?.score ?? null,
      band: audit?.band ?? null,
      verif: s.verificationStatusValue,
      plan: s.plan === 'paid' ? 'Paid' : 'Free',
      auditedLabel: auditedAt === null ? 'never' : relativeTime(auditedAt),
      ageMs: auditedAt === null ? Number.MAX_SAFE_INTEGER : Date.now() - auditedAt.getTime(),
      needs:
        audit !== undefined &&
        (audit.band === 'weak' || audit.band === 'critical' || audit.failCount > 0),
    };
  });

  const scored = rows.filter((r) => r.score !== null);
  const avgReadiness =
    scored.length > 0
      ? Math.round(scored.reduce((sum, r) => sum + (r.score ?? 0), 0) / scored.length)
      : 0;
  const needsCount = rows.filter((r) => r.needs).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
            Sites
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
            {sites.length} site{sites.length === 1 ? '' : 's'} tracked
          </p>
        </div>
        <Link href="/dashboard/sites/new" style={connectButton}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FAFAF8"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          Connect a site
        </Link>
      </div>

      {sites.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 10,
              padding: '11px 16px',
              fontFamily: MONO,
              fontSize: 12.5,
              color: PC.muted,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px 8px',
              alignItems: 'center',
            }}
          >
            <span style={{ color: PC.ink, fontWeight: 500 }}>
              {sites.length} site{sites.length === 1 ? '' : 's'}
            </span>
            <Sep />
            <span>
              avg readiness <span style={{ color: PC.ink }}>{avgReadiness}</span>
            </span>
            <Sep />
            <span style={{ color: needsCount > 0 ? PC.amber : PC.muted }}>
              {needsCount} need{needsCount === 1 ? 's' : ''} attention
            </span>
          </div>
          <SitesTable rows={rows} />
        </>
      )}
    </div>
  );
}

function Sep() {
  return <span style={{ color: PC.faint }}>·</span>;
}

const connectButton = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  flex: '0 0 auto',
  padding: '0 15px',
  height: 38,
  background: PC.ink,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  color: '#FAFAF8',
  textDecoration: 'none',
} as const;

function EmptyState() {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        padding: '56px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 16,
      }}
    >
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: PC.hover,
          border: `1px solid ${PC.line}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PC.dim}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <path d="M7 12h10" />
        </svg>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: 400 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 16, color: PC.ink }}>
          Connect your first site
        </span>
        <span style={{ fontSize: 13.5, color: PC.muted }}>
          Point Answerfox at your docs and we'll audit every page for AI readiness.
        </span>
      </div>
      <code
        style={{
          fontFamily: MONO,
          fontSize: 12.5,
          color: PC.ink,
          background: PC.hover,
          border: `1px solid ${PC.line}`,
          borderRadius: 8,
          padding: '9px 14px',
        }}
      >
        npx answerfox audit yourdocs.dev
      </code>
      <Link href="/dashboard/sites/new" style={connectButton}>
        Connect a site
      </Link>
    </div>
  );
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
