import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { MarketingFooter, MarketingNav } from '@/components/marketing/marketing-chrome';
import { ScanResult } from '@/components/scan/scan-result';
import { type StoredPublicScan, getPublicScanById } from '@/lib/db/queries/public-scans';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Public audit | Answerfox',
  description: 'How much of this site can an AI crawler actually read?',
};

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default async function SharedScanPage({ params }: PageProps) {
  const { id } = await params;

  // Guarded: an un-migrated public_scans table must 404, not crash.
  let scan: StoredPublicScan | null = null;
  try {
    scan = await getPublicScanById(id);
  } catch {
    scan = null;
  }
  if (scan === null) notFound();

  const host = hostOf(scan.url);

  return (
    <div style={{ minHeight: '100vh', background: PC.bg, color: PC.ink, fontFamily: BODY }}>
      <style>
        {
          '@media(max-width:900px){.afx-score{grid-template-columns:1fr!important;justify-items:center;text-align:center}.afx-tiles{grid-template-columns:repeat(2,1fr)!important}}'
        }
      </style>
      <MarketingNav />

      <main style={{ maxWidth: 1080, margin: '0 auto', padding: '0 32px' }}>
        {/* BREADCRUMB */}
        <div style={{ padding: '24px 0 0', fontFamily: MONO, fontSize: 12, color: PC.dim }}>
          audit <span style={{ color: PC.faint }}>/</span>{' '}
          <span style={{ color: PC.ink }}>{host}</span>
        </div>

        {/* HERO */}
        <section
          style={{ padding: '36px 0 32px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: '.16em',
              color: PC.blaze,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PC.blaze }} />
            PUBLIC AUDIT · READ-ONLY
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: PC.ink,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: '0 0 auto',
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="#FAFAF8" aria-hidden="true">
                <path d="M12 2 22 20H2z" />
              </svg>
            </span>
            <h1
              style={{
                margin: 0,
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 36,
                letterSpacing: '-.03em',
                color: PC.ink,
                lineHeight: 1.1,
                wordBreak: 'break-word',
              }}
            >
              {host}
            </h1>
            <a
              href={scan.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: MONO,
                fontSize: 12,
                color: PC.dim,
                textDecoration: 'none',
              }}
            >
              visit site
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PC.dim}
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 3h6v6" />
                <path d="M10 14 21 3" />
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              </svg>
            </a>
          </div>
          <p style={{ margin: 0, fontSize: 17, color: PC.muted, maxWidth: 680, lineHeight: 1.5 }}>
            How much of{' '}
            <span style={{ fontFamily: MONO, fontSize: 15, color: PC.ink }}>{host}</span> can an AI
            coding agent actually use?
          </p>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.dim }}>
            read-only public scan
          </span>
        </section>

        <ScanResult report={scan.report} />
      </main>

      <MarketingFooter />
    </div>
  );
}
