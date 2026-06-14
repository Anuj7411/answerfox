/**
 * Terminal banner — the Answerfox pixel-grid fox rendered in ANSI
 * block characters. Printed at the top of the `audit` command's
 * output so the CLI carries the brand without bloating subsequent
 * lines.
 *
 * Geometry mirrors the FoxMark `grid` cut from the brand handoff:
 * 8x8 cell grid, ember pixel at row 6 col 4. Each cell is two
 * characters wide so the printed glyph reads close to square in
 * most monospace fonts. The ember pixel uses ANSI 208 (orange);
 * the ink cells use 235 (slate). Reset codes after every cell.
 *
 * `noColor` returns the same shape with plain Unicode blocks for
 * pipes / log files / `--no-color` mode.
 */

const INK = '[38;5;235m';
const EMBER = '[38;5;208m';
const DIM = '[38;5;245m';
const RESET = '[0m';
const BLOCK = '██';
const SPACE = '  ';

const FOX_GRID: ReadonlyArray<ReadonlyArray<0 | 1 | 2>> = [
  [1, 0, 0, 0, 0, 0, 1, 0],
  [1, 1, 0, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 2, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
];

export interface BannerOptions {
  readonly noColor?: boolean;
  /** Append the version string in dim grey to the right of the mark. */
  readonly version?: string;
}

export function banner(options: BannerOptions = {}): string {
  const useColor = options.noColor !== true;
  const lines: string[] = [];

  for (const row of FOX_GRID) {
    let line = '';
    for (const cell of row) {
      if (cell === 0) {
        line += SPACE;
      } else if (cell === 2) {
        line += useColor ? `${EMBER}${BLOCK}${RESET}` : BLOCK;
      } else {
        line += useColor ? `${INK}${BLOCK}${RESET}` : BLOCK;
      }
    }
    lines.push(line);
  }

  const label = useColor
    ? `${INK}█${RESET} answerfox${options.version ? ` ${DIM}${options.version}${RESET}` : ''}`
    : `# answerfox${options.version ? ` ${options.version}` : ''}`;

  lines.push('');
  lines.push(label);
  return lines.join('\n');
}
