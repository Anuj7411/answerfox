import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * Favicon (64x64 transparent PNG).
 *
 * Renders the pixel-solid Answerfox mark on a TRANSPARENT canvas so the tab
 * icon is the silhouette itself — no slate badge, no inverted variant.
 * The PNG output (64) matches the SVG viewBox (64) exactly, giving 1:1
 * pixel-perfect rendering. shapeRendering="crispEdges" forbids
 * anti-aliasing so the pixel-art stepped silhouette stays sharp at every
 * downscale the browser picks for the tab strip.
 */
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        background: 'transparent',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="crispEdges"
        aria-label="Answerfox"
      >
        <title>Answerfox</title>
        <path
          d="M4 4 H12 V12 H20 V20 H44 V12 H52 V4 H60 V36 H52 V44 H44 V52 H36 V60 H28 V52 H20 V44 H12 V36 H4 Z"
          fill="#0F172A"
        />
        <rect x="28" y="44" width="8" height="8" fill="#F97316" />
      </svg>
    </div>,
    size,
  );
}
