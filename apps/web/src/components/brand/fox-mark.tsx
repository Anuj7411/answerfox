/**
 * Answerfox brand mark — Path A (pixel-solid).
 *
 * One welded stepped silhouette on a 64x64 grid. Single ember pixel at
 * the snout. Designed to scale cleanly from 16px favicon to display.
 *
 * Two cuts:
 *  - `solid` (default): the fused single-path silhouette. Use everywhere
 *    that isn't terminal-coded.
 *  - `grid`: separated rounded cells. Reserved for terminal / mono /
 *    nostalgic contexts (CLI, mono wordmark surfaces).
 *
 * Geometry is locked. Do not adjust path data without a brand review —
 * the file fox-marks2.jsx in the design handoff is the source of truth.
 */

interface FoxMarkProps {
  readonly size?: number;
  readonly variant?: 'solid' | 'grid';
  readonly inkColor?: string;
  readonly emberColor?: string;
  readonly className?: string;
  readonly title?: string;
}

const COOL_INK = '#0F172A';
const COOL_EMBER = '#F97316';

const GRID_CELLS: ReadonlyArray<readonly [number, number, boolean]> = [
  [1, 1, false],
  [7, 1, false],
  [1, 2, false],
  [2, 2, false],
  [6, 2, false],
  [7, 2, false],
  [1, 3, false],
  [2, 3, false],
  [3, 3, false],
  [4, 3, false],
  [5, 3, false],
  [6, 3, false],
  [7, 3, false],
  [1, 4, false],
  [2, 4, false],
  [3, 4, false],
  [4, 4, false],
  [5, 4, false],
  [6, 4, false],
  [7, 4, false],
  [2, 5, false],
  [3, 5, false],
  [4, 5, false],
  [5, 5, false],
  [6, 5, false],
  [3, 6, false],
  [4, 6, true],
  [5, 6, false],
  [4, 7, false],
];

export function FoxMark({
  size = 32,
  variant = 'solid',
  inkColor = COOL_INK,
  emberColor = COOL_EMBER,
  className,
  title = 'Answerfox',
}: FoxMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {variant === 'solid' ? (
        <>
          <path
            d="M4 4 H12 V12 H20 V20 H44 V12 H52 V4 H60 V36 H52 V44 H44 V52 H36 V60 H28 V52 H20 V44 H12 V36 H4 Z"
            fill={inkColor}
          />
          <rect x="28" y="44" width="8" height="8" fill={emberColor} />
        </>
      ) : (
        GRID_CELLS.map(([c, r, ember]) => {
          const x = 4 + (c - 1) * 8;
          const y = 4 + (r - 1) * 8;
          return (
            <rect
              key={`${c}-${r}`}
              x={x}
              y={y}
              width="7.3"
              height="7.3"
              rx="1.4"
              fill={ember ? emberColor : inkColor}
            />
          );
        })
      )}
    </svg>
  );
}
