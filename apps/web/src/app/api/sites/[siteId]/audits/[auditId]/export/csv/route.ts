import { getAuditForUser, listFindingsForAudit } from '@/lib/db/queries/audits';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  readonly params: Promise<{ readonly siteId: string; readonly auditId: string }>;
}

/**
 * Download a single audit's findings as a CSV. Owner-scoped: a request
 * that doesn't own the site or audit returns 404 (not 403) so the
 * existence of the resource isn't leaked.
 *
 * Columns match the JSON export (checkId,category,severity,status,evidence,fixRecommendation)
 * so spreadsheet-based triage lines up 1:1 with the API payload.
 */
export async function GET(_request: Request, ctx: RouteParams) {
  const { siteId, auditId } = await ctx.params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const audit = await getAuditForUser(auditId, user.id);
  if (audit === null || audit.siteId !== siteId) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const findings = await listFindingsForAudit(audit.id);

  const header = ['checkId', 'category', 'severity', 'status', 'evidence', 'fixRecommendation'];
  const rows = findings.map((f) => [
    f.checkId,
    f.category,
    f.severity,
    f.status,
    f.evidence ?? '',
    f.fixRecommendation ?? '',
  ]);

  const body = [header, ...rows].map(rowToCsv).join('\r\n');
  const filename = `audit-${safeFilename(site.name)}-${audit.fetchedAt.toISOString().slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

/** RFC 4180: quote every field, escape internal quotes by doubling. */
function rowToCsv(cells: readonly string[]): string {
  return cells.map(csvCell).join(',');
}

function csvCell(cell: string): string {
  const s = cell.replace(/\r?\n/g, ' ');
  return `"${s.replace(/"/g, '""')}"`;
}

function safeFilename(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'site'
  );
}
