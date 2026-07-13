import { ScanForm } from '@/components/scan/scan-form';
import Link from 'next/link';

export const metadata = {
  title: 'Free scan: is your site answerable by AI agents? | Answerfox',
  description:
    'See what an AI coding agent can and cannot answer about your site from what it actually reads. Free, no login.',
};

export default function ScanPage() {
  return (
    <main className="mx-auto min-h-screen max-w-[640px] px-6 py-16 text-ink">
      <Link href="/" className="font-mono text-[12.5px] text-ink-muted hover:underline">
        Answerfox
      </Link>

      <h1 className="t-hero mt-6 text-4xl">Can an AI agent actually use your site?</h1>
      <p className="mt-4 font-body text-ink-muted">
        We fetch your site the way an AI crawler does (no JavaScript), ask a coding agent real
        developer questions, and score whether it could answer. Free, no login.
      </p>

      <section className="mt-8">
        <ScanForm />
      </section>

      <p className="mt-10 font-mono text-[11.5px] text-ink-muted">
        The score reflects only what an AI crawler receives. AI crawlers do not execute JavaScript.
      </p>
    </main>
  );
}
