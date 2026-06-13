import { renderBadgeSvg } from '@/lib/badge/render-svg';
import { getLatestAuditForDomain } from '@/lib/db/queries/public-audit';
import { NextResponse } from 'next/server';

/**
 * GET /badge/[domain]
 *
 * Returns an SVG badge for the latest audit of `domain`, suitable
 * for embedding in a GitHub README:
 *
 *   ![Answerfox](https://answerfox.dev/badge/yoursite.com)
 *
 * Query params:
 *   ?style=ar     (default) — leads with Agent Readiness x/8
 *   ?style=score             — leads with 0-100 score + band
 *
 * Caching: 24 hours public + 12 hours stale-while-revalidate. Vercel's
 * edge respects these on a per-URL basis. Each new audit invalidates
 * naturally on the 24-hour rolling window — we don't want to thrash
 * the cache on every audit, so a stale-for-a-day badge is fine.
 *
 * On miss (no audits for the domain), returns a neutral
 * "no audit yet" badge so the README still renders something useful.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  readonly params: Promise<{ readonly domain: string }>;
}

const CACHE_HEADER = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200';

function badgeResponse(svg: string): NextResponse {
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': CACHE_HEADER,
    },
  });
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
  const { domain } = await context.params;
  const url = new URL(request.url);
  const styleParam = url.searchParams.get('style');
  const style: 'ar' | 'score' = styleParam === 'score' ? 'score' : 'ar';

  const decodedDomain = decodeURIComponent(domain);
  const audit = await getLatestAuditForDomain(decodedDomain);

  if (audit === null) {
    return badgeResponse(renderBadgeSvg({ style, noAudit: true }));
  }

  return badgeResponse(
    renderBadgeSvg({
      style,
      score: audit.score,
      band: audit.band,
      agentReadinessScore: audit.agentReadinessScore,
    }),
  );
}
