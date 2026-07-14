/**
 * Shared Porcelain design tokens, taken verbatim from the delivered
 * `.dc.html` design set (Overview / Site Detail). These are the exact
 * hex values from the files — do not swap them for the half-migrated
 * Tailwind tokens. Fonts are wired through next/font CSS vars.
 */
export const PC = {
  bg: '#FAFAF8',
  sidebar: '#FFFFFF',
  card: '#FFFFFF',
  ink: '#1C1C19',
  ink2: '#1C1C19',
  muted: '#6B6B65',
  dim: '#9C9C95',
  dim2: '#8C8C85',
  faint: '#DEDDD7',
  blaze: '#F34504',
  blazeDeep: '#B23A08',
  green: '#15803D',
  greenBright: '#16A34A',
  red: '#DC2626',
  amber: '#B45309',
  amberBright: '#D97706',
  line: '#EAE9E5',
  line16: '#DEDDD7',
  hover: '#F5F5F2',
  greenWash: '#E7F6EC',
  amberWash: '#FBEFD6',
  redWash: '#FBE9E9',
  blazeWash: 'rgba(243,69,4,.08)',
} as const;

export const DISPLAY = "var(--font-archivo-expanded), var(--font-archivo), system-ui, sans-serif";
export const BODY = 'var(--font-archivo), system-ui, sans-serif';
export const MONO = 'var(--font-jetbrains), ui-monospace, monospace';

/** Label used above cards: uppercase mono, tracked out. */
export const cardLabel = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: PC.dim,
} as const;

/** Tone (color + wash bg) for score bands and status pills. */
export function bandTone(band: string): {
  readonly label: string;
  readonly color: string;
  readonly bg: string;
} {
  switch (band) {
    case 'excellent':
    case 'strong':
      return { label: band, color: PC.green, bg: PC.greenWash };
    case 'average':
      return { label: band, color: PC.amber, bg: PC.amberWash };
    default:
      return { label: band, color: PC.red, bg: PC.redWash };
  }
}
