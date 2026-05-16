import { DEFAULT_CHECKS } from '@answerable/audit';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
  return DEFAULT_CHECKS.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const check = DEFAULT_CHECKS.find((c) => c.id === id.toUpperCase());
  if (!check) {
    return { title: 'Check not found' };
  }
  return {
    title: `${check.id} — ${check.description}`,
    description: check.rationale.slice(0, 160),
  };
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const CATEGORY_LABEL: Record<string, string> = {
  'meta-and-technical': 'Meta & technical foundations',
  'content-structure': 'Content structure & chunking',
  'structured-data': 'Structured data',
  'eeat-and-authority': 'E-E-A-T & entity authority',
  'offsite-citations': 'Off-site / citation surface',
  'og-and-social': 'Open Graph & social',
};

export default async function CheckPage({ params }: PageProps) {
  const { id } = await params;
  const upper = id.toUpperCase();
  const check = DEFAULT_CHECKS.find((c) => c.id === upper);
  if (!check) {
    notFound();
  }

  // Compute prev/next IDs for inline navigation.
  const allIds = DEFAULT_CHECKS.map((c) => c.id);
  const idx = allIds.indexOf(check.id);
  const prev = idx > 0 ? allIds[idx - 1] : undefined;
  const next = idx < allIds.length - 1 ? allIds[idx + 1] : undefined;

  return (
    <article>
      <h1>
        {check.id} — {check.description}
      </h1>

      <dl>
        <dt>
          <strong>Category</strong>
        </dt>
        <dd>{CATEGORY_LABEL[check.category] ?? check.category}</dd>
        <dt>
          <strong>Severity</strong>
        </dt>
        <dd>
          {SEVERITY_LABEL[check.severity] ?? check.severity} · {check.points}{' '}
          {check.points === 1 ? 'point' : 'points'}
        </dd>
      </dl>

      <h2>Why it matters</h2>
      <p>{check.rationale}</p>

      <h2>Try it</h2>
      <p>Run an audit and look for this check in the report:</p>
      <pre>
        <code>{'pnpm dlx @answerable/cli audit https://your-site.com'}</code>
      </pre>
      <p>Or print this check's full doc from the terminal without leaving your shell:</p>
      <pre>
        <code>{`pnpm dlx @answerable/cli explain ${check.id}`}</code>
      </pre>

      <hr style={{ margin: '2rem 0' }} />

      <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
        {prev !== undefined ? <Link href={`/docs/checks/${prev}`}>← {prev}</Link> : <span />}
        {next !== undefined ? <Link href={`/docs/checks/${next}`}>{next} →</Link> : <span />}
      </nav>
    </article>
  );
}
