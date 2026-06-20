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
 * Download a single audit + its findings as JSON.
 *
 * Auth: requires a signed-in session. Both site and audit are owner-
 * scoped — a request that doesn't match returns 404 so the existence
 * of the resource isn't leaked.
 *
 * Filename: `audit-<siteName>-<isoDate>.json`. Lowercased and stripped
 * of unsafe filesystem chars so OS download dialogs are happy.
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

  const payload = {
    site: {
      id: site.id,
      name: site.name,
      url: site.url,
    },
    audit: {
      id: audit.id,
      fetchedAt: audit.fetchedAt,
      score: audit.score,
      band: audit.band,
      agentReadinessScore: audit.agentReadinessScore,
      counts: {
        pass: audit.passCount,
        fail: audit.failCount,
        warn: audit.warnCount,
        skip: audit.skipCount,
      },
      gatePageDetected: audit.gatePageDetected,
    },
    findings: findings.map((f) => ({
      checkId: f.checkId,
      category: f.category,
      severity: f.severity,
      status: f.status,
      evidence: f.evidence,
      fixRecommendation: f.fixRecommendation,
    })),
    exportedAt: new Date().toISOString(),
    exportedBy: user.email,
  };

  const filename = `audit-${safeFilename(site.name)}-${audit.fetchedAt.toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
    },
  });
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
