import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { MarketingFooter, MarketingNav } from '@/components/marketing/marketing-chrome';
import { ScanForm } from '@/components/scan/scan-form';

export const metadata = {
  title: 'Free scan: is your site answerable by AI agents? | Answerfox',
  description:
    'See what an AI coding agent can and cannot answer about your site from what it actually reads. Free, no login.',
};

export default function ScanPage() {
  return (
    <div style={{ minHeight: '100vh', background: PC.bg, color: PC.ink, fontFamily: BODY }}>
      <style>
        {
          '@media(max-width:900px){.afx-score{grid-template-columns:1fr!important;justify-items:center;text-align:center}.afx-tiles{grid-template-columns:repeat(2,1fr)!important}}'
        }
      </style>
      <MarketingNav />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '0 32px' }}>
        <section
          style={{ padding: '64px 0 8px', display: 'flex', flexDirection: 'column', gap: 16 }}
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
            FREE PUBLIC SCAN
          </span>
          <h1
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 38,
              letterSpacing: '-.03em',
              color: PC.ink,
              lineHeight: 1.1,
            }}
          >
            Can an AI agent actually use your site?
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: PC.muted, lineHeight: 1.55 }}>
            We fetch your site the way an AI crawler does (no JavaScript), ask a coding agent real
            developer questions, and score whether it could answer. Free, no login.
          </p>
        </section>

        <section style={{ padding: '20px 0 0' }}>
          <ScanForm />
        </section>

        <p style={{ margin: '28px 0 96px', fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
          The score reflects only what an AI crawler receives. AI crawlers do not execute
          JavaScript.
        </p>
      </main>

      <MarketingFooter />
    </div>
  );
}
