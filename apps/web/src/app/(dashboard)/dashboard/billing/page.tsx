import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

const PRICE_PER_REPO = 29;
const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';

export default async function BillingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard/billing');

  const sites = await listSitesForUser(user.id);
  const userEmail = user.email ?? '';

  const paidSites = sites.filter((s) => s.plan === 'paid');
  const freeSites = sites.filter((s) => s.plan === 'free');
  const spend = paidSites.length * PRICE_PER_REPO;

  const polarProductId = process.env.POLAR_PRODUCT_ID ?? '';
  const polarConfigured = process.env.POLAR_ACCESS_TOKEN !== undefined && polarProductId.length > 0;

  return (
    <div
      style={{
        maxWidth: 1240,
        width: '100%',
        margin: '0 auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* PAGE HEADER */}
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '-.02em',
            color: PC.ink,
          }}
        >
          Billing
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
          Pay per private repo. Public repos are always free.
        </p>
      </div>

      {/* 1) PLAN SUMMARY */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          display: 'grid',
          gridTemplateColumns: '1.15fr 1fr',
          overflow: 'hidden',
        }}
      >
        {/* Left: current spend */}
        <div
          style={{
            padding: '22px 24px',
            borderRight: `1px solid ${PC.line}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            Current spend
          </span>
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: '-.02em',
              color: PC.ink,
              lineHeight: 1.1,
            }}
          >
            ${spend}{' '}
            <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: 14, color: PC.muted }}>
              / month
            </span>
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.muted }}>
            {paidSites.length} paid private site{paidSites.length === 1 ? '' : 's'} &middot;{' '}
            {freeSites.length} free
          </span>
        </div>

        {/* Right: pricing */}
        <div
          style={{
            padding: '22px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: FOOT_BG,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                color: PC.dim,
              }}
            >
              Pricing
            </span>
            <span
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 22,
                letterSpacing: '-.01em',
                color: PC.ink,
              }}
            >
              ${PRICE_PER_REPO}{' '}
              <span style={{ fontFamily: BODY, fontWeight: 500, fontSize: 13, color: PC.muted }}>
                / repo / month
              </span>
            </span>
          </div>
          {polarConfigured ? (
            <a
              href="/api/checkout"
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 15px',
                height: 38,
                background: PC.ink,
                borderRadius: 8,
                fontFamily: BODY,
                fontSize: 13,
                fontWeight: 500,
                color: '#FAFAF8',
                textDecoration: 'none',
              }}
            >
              Manage payment
              <ExternalLinkIcon />
            </a>
          ) : (
            <span
              style={{
                fontFamily: MONO,
                fontSize: 12,
                color: PC.dim,
              }}
            >
              Payment provider not yet configured.
            </span>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            gridColumn: '1 / -1',
            borderTop: `1px solid ${FOOT_LINE}`,
            padding: '11px 24px',
            fontFamily: MONO,
            fontSize: 12,
            color: PC.dim,
            background: PC.card,
          }}
        >
          Public repos are free, in full, forever.
        </div>
      </div>

      {/* 2) PLANS BY SITE */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${PC.line}`,
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
            Plans by site
          </span>
        </div>

        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px,1.9fr) 0.9fr 2fr 130px',
            gap: 14,
            alignItems: 'center',
            padding: '11px 20px',
            borderBottom: `1px solid ${PC.line}`,
            background: FOOT_BG,
          }}
        >
          <span style={colHeaderStyle}>Site</span>
          <span style={colHeaderStyle}>Plan</span>
          <span style={colHeaderStyle}>Free loop</span>
          <span style={{ ...colHeaderStyle, textAlign: 'right' as const }}>Action</span>
        </div>

        {/* Rows */}
        {sites.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
              No sites yet.
            </span>
            <span style={{ fontSize: 13.5, color: PC.muted }}>
              Add a site from the dashboard to get started.
            </span>
          </div>
        ) : (
          sites.map((site) => (
            <SiteRow
              key={site.id}
              site={site}
              polarConfigured={polarConfigured}
              polarProductId={polarProductId}
              userEmail={userEmail}
            />
          ))
        )}
      </div>

      {/* 3) RECEIPTS — no backend, honest empty state */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${PC.line}`,
            display: 'flex',
            alignItems: 'baseline',
            gap: 10,
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
            Receipts
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            newest first
          </span>
        </div>
        <div
          style={{
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 10,
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
            No charges yet.
          </span>
          <span style={{ fontSize: 13.5, color: PC.muted, maxWidth: 360 }}>
            Your first paid loop starts when you upgrade a private site.
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PER-SITE ROW
   ============================================================ */

interface SiteRowSite {
  readonly id: string;
  readonly name: string;
  readonly repoFullName: string | null;
  readonly plan: 'free' | 'paid';
  readonly freeLoopConsumedAt: Date | null;
}

function SiteRow({
  site,
  polarConfigured,
  polarProductId,
  userEmail,
}: {
  site: SiteRowSite;
  polarConfigured: boolean;
  polarProductId: string;
  userEmail: string;
}) {
  const isPaid = site.plan === 'paid';
  const freeUsed = site.freeLoopConsumedAt !== null;

  const freeLoopText = isPaid
    ? '—'
    : freeUsed
      ? `free loop used ${formatDate(site.freeLoopConsumedAt)}`
      : 'free loop: not yet used';
  const freeLoopColor = isPaid ? '#C4C3BC' : freeUsed ? PC.amber : PC.muted;
  const freeLoopFont = isPaid || freeUsed ? BODY : MONO;

  const checkoutHref =
    polarConfigured && polarProductId.length > 0
      ? `/api/checkout?products=${encodeURIComponent(polarProductId)}&customerEmail=${encodeURIComponent(userEmail)}&metadata=${encodeURIComponent(JSON.stringify({ site_id: site.id }))}`
      : null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(200px,1.9fr) 0.9fr 2fr 130px',
        gap: 14,
        alignItems: 'center',
        padding: '13px 20px',
        borderTop: `1px solid ${FOOT_LINE}`,
      }}
    >
      {/* Site name + repo */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          lineHeight: 1.3,
          minWidth: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 500, color: PC.ink }}>{site.name}</span>
        {site.repoFullName ? (
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
            {site.repoFullName}
          </span>
        ) : (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              color: PC.dim,
              fontStyle: 'italic',
            }}
          >
            no repo linked
          </span>
        )}
      </div>

      {/* Plan badge */}
      <div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO,
            fontSize: 11.5,
            color: isPaid ? PC.green : PC.dim,
            border: `1px solid ${isPaid ? '#CDE9D6' : PC.line}`,
            background: isPaid ? '#F1FAF4' : '#F7F7F4',
            borderRadius: 999,
            padding: '2px 10px',
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: isPaid ? PC.greenBright : '#C4C3BC',
            }}
          />
          {isPaid ? 'Paid' : 'Free'}
        </span>
      </div>

      {/* Free loop status */}
      <div style={{ fontSize: 12.5, color: freeLoopColor, fontFamily: freeLoopFont }}>
        {freeLoopText}
      </div>

      {/* Action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        {isPaid ? (
          <span style={{ fontFamily: MONO, fontSize: 13, color: '#C4C3BC' }}>&mdash;</span>
        ) : checkoutHref !== null ? (
          <a
            href={checkoutHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 32,
              padding: '0 13px',
              background: PC.ink,
              border: 'none',
              borderRadius: 7,
              fontFamily: BODY,
              fontSize: 12.5,
              fontWeight: 500,
              color: '#FAFAF8',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Upgrade ${PRICE_PER_REPO}/mo
          </a>
        ) : (
          <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>&mdash;</span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */

const colHeaderStyle = {
  fontFamily: MONO,
  fontSize: 10.5,
  letterSpacing: '.09em',
  textTransform: 'uppercase' as const,
  color: PC.dim,
};

function formatDate(d: Date | null): string {
  if (d === null) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ExternalLinkIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FAFAF8"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="External link"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}
