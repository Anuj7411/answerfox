import type { ScoreBand } from '@answerfox/audit';

interface ScoreBandChipProps {
  readonly score: number;
  readonly band: ScoreBand;
  readonly size?: 'sm' | 'md';
}

const bandStyles: Record<ScoreBand, string> = {
  critical: 'bg-red-100 text-red-900 ring-red-200',
  weak: 'bg-orange-100 text-orange-900 ring-orange-200',
  average: 'bg-amber-100 text-amber-900 ring-amber-200',
  strong: 'bg-emerald-100 text-emerald-900 ring-emerald-200',
  excellent: 'bg-emerald-200 text-emerald-950 ring-emerald-300',
};

/**
 * Score chip with band-colored background. Used on site cards and
 * the detail page header. The band name is the source of truth for
 * color (per AUDIT-FRAMEWORK.md bands); the numeric score is shown
 * inline so users don't have to learn the band mapping.
 */
export function ScoreBandChip({ score, band, size = 'sm' }: ScoreBandChipProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-1 text-[12px]' : 'px-3 py-1.5 text-sm';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-mono ring-1 ring-inset ${bandStyles[band]} ${sizeClass}`}
    >
      <span className="font-semibold">{score}</span>
      <span className="opacity-70">·</span>
      <span className="capitalize">{band}</span>
    </span>
  );
}
