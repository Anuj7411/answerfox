import { BODY, DISPLAY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import Link from 'next/link';

/**
 * Billing (Porcelain). Placeholder until the Billing.dc.html design is
 * wired in its Phase 2 slot — present so the workspace nav item resolves
 * instead of 404ing. Per-site upgrade still lives on each site's page.
 */
export default function BillingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h1 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: '-.02em', color: PC.ink }}>
          Billing
        </h1>
        <p style={{ margin: '6px 0 0', fontFamily: MONO, fontSize: 13, color: PC.muted }}>
          per-repo fix-PR plan
        </p>
      </div>
      <div style={{ background: PC.card, border: `1px solid ${PC.line}`, borderRadius: 12, padding: 32 }}>
        <p style={{ margin: 0, maxWidth: 560, fontFamily: BODY, fontSize: 14, lineHeight: 1.6, color: PC.muted }}>
          Public repos are free forever. Private repos get one free fix loop, then $9/mo per repo to
          keep fixes shipping and staying fixed. Upgrade a specific site from its page for now — the
          full billing view lands here next.
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
