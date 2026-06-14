import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Answerfox — the Agent Readiness toolkit';

/**
 * Open Graph card (1200x630 PNG).
 *
 * Used by social platforms when the site is shared. Wordmark on the
 * locked Cool Slate background with the pixel-solid mark left of
 * "Answerfox" and a one-line strapline below.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: '#0F172A',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '90px 110px',
        color: '#F2EFE9',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
        <svg width="160" height="160" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <title>Answerfox</title>
          <path
            d="M4 4 H12 V12 H20 V20 H44 V12 H52 V4 H60 V36 H52 V44 H44 V52 H36 V60 H28 V52 H20 V44 H12 V36 H4 Z"
            fill="#F2EFE9"
          />
          <rect x="28" y="44" width="8" height="8" fill="#F97316" />
        </svg>
        <span
          style={{
            fontSize: '128px',
            fontWeight: 600,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          Answerfox
        </span>
      </div>
      <p
        style={{
          marginTop: '48px',
          fontSize: '38px',
          maxWidth: '900px',
          lineHeight: 1.35,
          color: 'rgba(242,239,233,0.78)',
        }}
      >
        The Agent Readiness toolkit. Open source. Lives in your repo. Ships fixes as code.
      </p>
      <div
        style={{
          marginTop: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span
          style={{
            background: '#F97316',
            color: '#0F172A',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          v0.6.0
        </span>
        <span style={{ fontSize: '22px', color: 'rgba(242,239,233,0.55)' }}>
          16 of 16 Cloudflare AR Score parity · 50 active checks
        </span>
      </div>
    </div>,
    size,
  );
}
