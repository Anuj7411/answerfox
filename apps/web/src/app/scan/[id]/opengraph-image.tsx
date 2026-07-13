import { getPublicScanById } from '@/lib/db/queries/public-scans';
import { ImageResponse } from 'next/og';

/**
 * Dynamic social share-card for a scan result. When a /scan/:id link is
 * posted anywhere, this is the preview image: the site's answerability
 * score, big. A shareable score is the viral unit of the growth loop, so
 * the card leads with the number and the outcome framing.
 *
 * Node runtime because it reads the scan through the Postgres service
 * role. Falls back to a generic card if the scan is missing or the table
 * is not migrated, so the image endpoint never errors a share preview.
 */
export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Answerfox scan result';

const BG = '#F4F1EA';
const INK = '#1A1A1A';
const MUTED = '#6B675F';
const EMBER = '#E8792B';

export default async function ScanOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let score: number | null = null;
  let url = '';
  let gaps = 0;
  try {
    const scan = await getPublicScanById(id);
    if (scan !== null) {
      score = scan.report.answerabilityScore;
      url = scan.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      gaps = scan.report.gaps.length;
    }
  } catch {
    score = null;
  }

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BG,
        padding: '64px 72px',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: EMBER,
            display: 'flex',
          }}
        />
        <div style={{ fontSize: 30, fontWeight: 700, color: INK }}>Answerfox</div>
      </div>

      {score !== null ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 26, color: MUTED, display: 'flex' }}>
            Can an AI agent answer questions about
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: INK,
              display: 'flex',
              maxWidth: 1050,
              overflow: 'hidden',
            }}
          >
            {url}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 12 }}>
            <div style={{ fontSize: 190, fontWeight: 800, color: EMBER, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: 34, color: MUTED, paddingBottom: 28, display: 'flex' }}>
              / 100 answerability
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 56, fontWeight: 700, color: INK, display: 'flex' }}>
            Is your site answerable by AI agents?
          </div>
          <div style={{ fontSize: 30, color: MUTED, marginTop: 16, display: 'flex' }}>
            Free scan. See what AI crawlers can and cannot answer.
          </div>
        </div>
      )}

      <div style={{ fontSize: 26, color: MUTED, display: 'flex' }}>
        {score !== null
          ? `${gaps} question${gaps === 1 ? '' : 's'} an AI agent could not fully answer. Fix them as PRs.`
          : 'answerfox.dev/scan'}
      </div>
    </div>,
    size,
  );
}
