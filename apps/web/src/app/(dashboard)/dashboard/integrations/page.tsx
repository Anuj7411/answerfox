import { BODY, DISPLAY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

/**
 * Integrations (Porcelain). Placeholder until the Integrations.dc.html
 * design is wired in its Phase 2 slot — present so the workspace nav item
 * resolves instead of 404ing.
 */
export default function IntegrationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: PC.ink }}>
          Integrations
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: MONO, fontSize: 13, color: PC.muted }}>
          GitHub · analytics · CI
        </p>
      </div>
      <div style={{ background: PC.card, border: `1px solid ${PC.line}`, borderRadius: 12, padding: 32 }}>
        <p style={{ margin: 0, maxWidth: 560, fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: PC.muted }}>
          Connect the GitHub App to ship fixes as pull requests, and mint an ingest token per site to
          record which AI engines read it. Both are wired from each site's page today — the unified
          integrations view lands here next.
        </p>
        <Link
          href="/dashboard/sites"
          style={{ display: 'inline-flex', marginTop: 16, fontFamily: MONO, fontSize: 12, color: PC.blazeDeep, textDecoration: 'none' }}
        >
          Go to your sites →
        </Link>
      </div>
    </div>
  );
}
