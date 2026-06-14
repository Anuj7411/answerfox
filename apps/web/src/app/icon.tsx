import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/**
 * Favicon (32x32 PNG).
 *
 * Renders the pixel-solid Answerfox mark on the locked Cool Slate
 * background so it pops in the browser tab regardless of the user's
 * theme.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '7px',
      }}
    >
      <svg
        width="26"
        height="26"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Answerfox"
      >
        <title>Answerfox</title>
        <path
          d="M4 4 H12 V12 H20 V20 H44 V12 H52 V4 H60 V36 H52 V44 H44 V52 H36 V60 H28 V52 H20 V44 H12 V36 H4 Z"
          fill="#F2EFE9"
        />
        <rect x="28" y="44" width="8" height="8" fill="#F97316" />
      </svg>
    </div>,
    size,
  );
}
