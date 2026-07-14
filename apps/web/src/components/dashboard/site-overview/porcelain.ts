/**
 * Shared Porcelain design tokens for the Site Detail Overview blocks.
 *
 * The .dc.html source uses literal font families ('Archivo Expanded',
 * 'JetBrains Mono'). In-app those are wired through next/font CSS vars,
 * and "Archivo Expanded" is aliased to Archivo (see globals.css). We
 * keep the palette as literal hex to match the delivered design exactly
 * rather than reaching for the half-migrated Tailwind tokens.
 */
export const PC = {
  bg: '#F4F5F3',
  sidebar: '#ECEEEB',
  card: '#FFFFFF',
  ink: '#14150F',
  ink2: '#2A2E29',
  muted: '#5C625B',
  dim: '#767B73',
  faint: '#C7CCC6',
  blaze: '#F34504',
  blazeDeep: '#B23A08',
  green: '#2C8C4E',
  red: '#C4362B',
  amber: '#B8801C',
  line: 'rgba(20,22,16,.10)',
  line16: 'rgba(20,22,16,.16)',
  greenWash: 'rgba(44,140,78,.12)',
  blazeWash: 'rgba(243,69,4,.08)',
} as const;

export const DISPLAY = "var(--font-archivo-expanded), var(--font-archivo), system-ui, sans-serif";
export const BODY = 'var(--font-archivo), system-ui, sans-serif';
export const MONO = 'var(--font-jetbrains), ui-monospace, monospace';

/** Label used above every card: uppercase mono, tracked out. */
export const cardLabel = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: PC.dim,
} as const;

/** Tone → color for score bands and status pills. */
export function bandTone(band: string): { readonly label: string; readonly color: string } {
  switch (band) {
    case 'excellent':
    case 'strong':
      return { label: band, color: PC.green };
    case 'average':
      return { label: band, color: PC.amber };
    default:
      return { label: band, color: PC.red };
  }
}
