import { AddSiteForm } from '@/components/dashboard/add-site-form';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

export default function NewSitePage() {
  return (
    <div
      style={{
        maxWidth: 560,
        width: '100%',
        margin: '0 auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      {/* HEADER */}
      <div>
        <Link
          href="/dashboard/sites"
          style={{ fontFamily: MONO, fontSize: 12.5, color: PC.dim, textDecoration: 'none' }}
        >
          ← Sites
        </Link>
        <h1
          style={{
            margin: '12px 0 0',
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '-.02em',
            color: PC.ink,
          }}
        >
          Add a site
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted, lineHeight: 1.5 }}>
          Drop a URL for Answerfox to audit. You can run an on-demand audit, schedule weekly runs,
          and get alerted when the score drops.
        </p>
      </div>

      {/* ADD BY URL */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: 24,
        }}
      >
        <AddSiteForm />
      </div>

      {/* CONNECT A REPO → onboarding wizard */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
            Connect a GitHub repo instead
          </span>
          <span style={{ fontSize: 13.5, color: PC.muted, lineHeight: 1.5 }}>
            Pick a repo the Answerfox App can see and we'll create the site, link the repo, and run
            the first audit in one step — so fixes can ship as pull requests.
          </span>
        </div>
        <Link
          href="/dashboard/onboarding"
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 38,
            padding: '0 14px',
            background: PC.card,
            border: `1px solid ${PC.line}`,
            borderRadius: 8,
            fontFamily: BODY,
            fontSize: 13,
            fontWeight: 500,
            color: PC.ink,
            textDecoration: 'none',
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={PC.ink}
            stroke="none"
            aria-hidden="true"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
          </svg>
          Open the repo wizard
          <span style={{ color: PC.dim }}>→</span>
        </Link>
      </div>
    </div>
  );
}
