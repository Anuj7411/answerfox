import { classifyAgent } from '@/lib/analytics/classify-agent';
import { getDb } from '@/lib/db/client';
import { recordAgentVisit } from '@/lib/db/mutations/agent-visits';
import { sites } from '@/lib/db/schema/sites';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SHORT_FIELD_MAX = 1500;

interface IngestPayload {
  siteId?: unknown;
  userAgent?: unknown;
  referrer?: unknown;
  path?: unknown;
}

/**
 * Ingest a single visit from the customer's own server-side middleware.
 *
 * Auth: the site's `ingest_token` (rotated from the dashboard) must
 * appear as a bearer header. We do NOT trust user-controlled JSON
 * fields for auth — the token never travels in the body.
 *
 * Classification happens server-side here, never on the client, so
 * label drift can be fixed by a Vercel deploy without asking every
 * customer to re-roll their integration.
 *
 * Returns 204 on success (no body, fewer bytes on the wire — this
 * endpoint will be hit on every request the customer wants to record).
 * Never returns the row id; this is fire-and-forget by design.
 */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }
  const token = auth.slice('Bearer '.length).trim();
  if (token.length === 0) {
    return NextResponse.json({ error: 'Empty bearer token.' }, { status: 401 });
  }

  let payload: IngestPayload;
  try {
    payload = (await request.json()) as IngestPayload;
  } catch {
    return NextResponse.json({ error: 'Body must be JSON.' }, { status: 400 });
  }

  const siteId = typeof payload.siteId === 'string' ? payload.siteId : '';
  const userAgent = typeof payload.userAgent === 'string' ? payload.userAgent : '';
  const referrer = typeof payload.referrer === 'string' ? payload.referrer : null;
  const path = typeof payload.path === 'string' ? payload.path : null;

  if (siteId.length === 0 || siteId.length > SHORT_FIELD_MAX) {
    return NextResponse.json({ error: 'siteId required.' }, { status: 400 });
  }
  if (userAgent.length === 0 || userAgent.length > SHORT_FIELD_MAX) {
    return NextResponse.json({ error: 'userAgent required.' }, { status: 400 });
  }

  const [site] = await getDb()
    .select({ id: sites.id, ingestToken: sites.ingestToken })
    .from(sites)
    .where(eq(sites.id, siteId))
    .limit(1);

  if (site === undefined) {
    // 401 not 404: don't reveal whether a given UUID is a real site to
    // an unauthenticated caller.
    return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
  }
  if (site.ingestToken === null || site.ingestToken !== token) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
  }

  const label = classifyAgent({ userAgent, referrer });
  await recordAgentVisit({ siteId, label, userAgent, referrer, path });

  return new NextResponse(null, { status: 204 });
}
