/**
 * SVG badge renderer for /badge/[domain].
 *
 * Two visual styles, picked via `?style=`:
 *   - `ar` (default): leads with Agent Readiness x/8 — the wedge metric.
 *   - `score`: leads with overall 0-100 score + band.
 *
 * Hand-rolled SVG with no deps. Geometric, brand-aligned slate + ember.
 * Sized to look at home next to shields.io badges in a README.
 */

const TOTAL_AR_CHECKS = 8;

const BAND_COLORS: Record<string, string> = {
  critical: '#dc2626', // red-600
  weak: '#ea580c', // orange-600
  average: '#d97706', // amber-600
  strong: '#16a34a', // green-600
  excellent: '#15803d', // green-700
};

const AR_COLOR_FOR_COUNT: ReadonlyArray<{ readonly max: number; readonly color: string }> = [
  { max: 0, color: '#dc2626' },
  { max: 2, color: '#ea580c' },
  { max: 5, color: '#d97706' },
  { max: 7, color: '#16a34a' },
  { max: 8, color: '#15803d' },
];

function colorForAr(count: number): string {
  for (const tier of AR_COLOR_FOR_COUNT) {
    if (count <= tier.max) return tier.color;
  }
  return '#15803d';
}

function capitalize(word: string): string {
  if (word.length === 0) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

interface BadgeText {
  readonly leftLabel: string;
  readonly rightLabel: string;
  readonly rightColor: string;
}

function badgeTextForStyle(input: {
  readonly style: 'ar' | 'score';
  readonly score?: number;
  readonly band?: string;
  readonly agentReadinessScore?: number;
  readonly noAudit: boolean;
}): BadgeText {
  if (input.noAudit) {
    return {
      leftLabel: 'answerfox',
      rightLabel: 'no audit yet',
      rightColor: '#94a3b8', // slate-400
    };
  }
  if (input.style === 'score') {
    const score = input.score ?? 0;
    const bandLabel = input.band !== undefined ? capitalize(input.band) : '';
    return {
      leftLabel: 'answerfox',
      rightLabel: `${score}/100 ${bandLabel}`.trim(),
      rightColor: BAND_COLORS[input.band ?? 'weak'] ?? '#64748b',
    };
  }
  // Default: AR
  const ar = input.agentReadinessScore ?? 0;
  return {
    leftLabel: 'agent readiness',
    rightLabel: `${ar} / ${TOTAL_AR_CHECKS}`,
    rightColor: colorForAr(ar),
  };
}

/**
 * Verdana 11px approximation. Real shields.io measures glyphs; we
 * approximate to keep this dependency-free. Close enough for the
 * widths a README badge needs.
 */
function approxTextWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    if ('ilrt.,:;|! '.includes(ch)) w += 4;
    else if ('mw'.includes(ch)) w += 9;
    else w += 7;
  }
  return w;
}

export interface RenderBadgeInput {
  readonly style: 'ar' | 'score';
  readonly score?: number;
  readonly band?: string;
  readonly agentReadinessScore?: number;
  readonly noAudit?: boolean;
}

export function renderBadgeSvg(input: RenderBadgeInput): string {
  const text = badgeTextForStyle({
    style: input.style,
    ...(input.score !== undefined && { score: input.score }),
    ...(input.band !== undefined && { band: input.band }),
    ...(input.agentReadinessScore !== undefined && {
      agentReadinessScore: input.agentReadinessScore,
    }),
    noAudit: input.noAudit ?? false,
  });

  const PAD = 10;
  const HEIGHT = 28;
  const leftWidth = approxTextWidth(text.leftLabel) + PAD * 2;
  const rightWidth = approxTextWidth(text.rightLabel) + PAD * 2;
  const totalWidth = leftWidth + rightWidth;

  // Brand: slate ink for left half, band color for right half.
  const LEFT_BG = '#1e293b'; // slate-800

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${HEIGHT}" viewBox="0 0 ${totalWidth} ${HEIGHT}" role="img" aria-label="${text.leftLabel}: ${text.rightLabel}">
  <title>${text.leftLabel}: ${text.rightLabel}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".10"/>
    <stop offset="1" stop-opacity=".10"/>
  </linearGradient>
  <mask id="m"><rect width="${totalWidth}" height="${HEIGHT}" rx="5" fill="#fff"/></mask>
  <g mask="url(#m)">
    <rect width="${leftWidth}" height="${HEIGHT}" fill="${LEFT_BG}"/>
    <rect x="${leftWidth}" width="${rightWidth}" height="${HEIGHT}" fill="${text.rightColor}"/>
    <rect width="${totalWidth}" height="${HEIGHT}" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="12">
    <text x="${leftWidth / 2}" y="${HEIGHT / 2 + 4}" fill="#0f172a" fill-opacity=".25">${text.leftLabel}</text>
    <text x="${leftWidth / 2}" y="${HEIGHT / 2 + 3}">${text.leftLabel}</text>
    <text x="${leftWidth + rightWidth / 2}" y="${HEIGHT / 2 + 4}" fill="#0f172a" fill-opacity=".25">${text.rightLabel}</text>
    <text x="${leftWidth + rightWidth / 2}" y="${HEIGHT / 2 + 3}">${text.rightLabel}</text>
  </g>
</svg>`;
}
