import { getLatestAuditForDomain, parseDomainForBadge } from '@/lib/db/queries/public-audit';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteParams {
  readonly params: Promise<{ readonly domain: string }>;
}

/**
 * Public "Answerfox agent-readiness" SVG badge.
 *
 * Design mirrors shields.io: a two-part rounded rectangle with a dark
 * left label ("answerfox") and a band-colored right value ("<score>/100")
 * for the given domain. If there's no audit yet we render an honest
 * "no audit" state instead of a fake score.
 *
 * Cache-Control keeps CDN latency low while still respecting the freshest
 * audit (60s stale-while-revalidate). No auth — anyone who embeds the
 * badge on their site gets the same output.
 */
export async function GET(_request: Request, ctx: RouteParams) {
  const { domain: raw } = await ctx.params;
  const domain = parseDomainForBadge(raw);

  let value = 'no audit';
  let color = '#8C8C85';
  let score: number | null = null;
  let band: string | null = null;

  if (domain !== null) {
    const summary = await getLatestAuditForDomain(domain);
    if (summary !== null) {
      score = summary.score;
      band = summary.band;
      value = `${summary.score}/100`;
      color = colorForBand(summary.band);
    }
  }

  const svg = buildSvg({ label: 'answerfox', value, color });

  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      // Public CDN cache: 60s fresh + 5min stale-while-revalidate.
      'Cache-Control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=300',
      // Prevent MIME sniffing to text/html on some proxies.
      'X-Content-Type-Options': 'nosniff',
      // Expose the score/band as headers for programmatic checks.
      ...(score !== null ? { 'X-Score': String(score) } : {}),
      ...(band !== null ? { 'X-Band': band } : {}),
    },
  });
}

function colorForBand(band: string): string {
  switch (band) {
    case 'excellent':
    case 'strong':
      return '#15803D';
    case 'average':
      return '#B45309';
    case 'weak':
      return '#DC2626';
    case 'critical':
      return '#9B1C1C';
    default:
      return '#8C8C85';
  }
}

/**
 * Approximate text width in a 11px sans-serif — tuned to avoid
 * clipping on typical scores/labels without shipping a full font metrics
 * table. Add 20px of horizontal padding per side.
 */
function textWidth(s: string): number {
  return Math.round(s.length * 6.6 + 20);
}

function buildSvg({
  label,
  value,
  color,
}: {
  readonly label: string;
  readonly value: string;
  readonly color: string;
}): string {
  const labelW = textWidth(label);
  const valueW = textWidth(value);
  const totalW = labelW + valueW;
  const labelX = labelW / 2;
  const valueX = labelW + valueW / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="answerfox agent-readiness: ${escapeXml(value)}">
  <title>answerfox agent-readiness: ${escapeXml(value)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r"><rect width="${totalW}" height="20" rx="3" fill="#fff"/></clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#1C1C19"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="${color}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif" font-size="11">
    <text x="${labelX}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(label)}</text>
    <text x="${labelX}" y="14">${escapeXml(label)}</text>
    <text x="${valueX}" y="15" fill="#010101" fill-opacity=".3">${escapeXml(value)}</text>
    <text x="${valueX}" y="14">${escapeXml(value)}</text>
  </g>
</svg>`;
}

function escapeXml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&quot;',
  );
}
