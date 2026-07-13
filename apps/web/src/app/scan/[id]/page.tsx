import { ScanResult } from '@/components/scan/scan-result';
import { type StoredPublicScan, getPublicScanById } from '@/lib/db/queries/public-scans';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Agent Answer scan result | Answerfox',
  description: 'What an AI coding agent can and cannot answer about this site.',
};

interface PageProps {
  readonly params: Promise<{ readonly id: string }>;
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

  return (
    <main className="mx-auto min-h-screen max-w-[640px] px-6 py-16 text-ink">
      <Link href="/" className="font-mono text-[12.5px] text-ink-muted hover:underline">
        Answerfox
      </Link>

      <p className="mt-6 font-mono text-[12px] uppercase tracking-wide text-ink-muted">
        Agent Answer scan
      </p>
      <h1 className="t-hero mt-2 break-words text-3xl">{scan.url}</h1>

      <section className="mt-8">
        <ScanResult report={scan.report} />
      </section>

      <div className="mt-10">
        <Link
          href="/scan"
          className="rounded-md border border-ember/40 bg-ember/10 px-4 py-2 text-[14px] font-medium hover:bg-ember/20"
        >
          Scan your own site
        </Link>
      </div>
    </main>
  );
}
