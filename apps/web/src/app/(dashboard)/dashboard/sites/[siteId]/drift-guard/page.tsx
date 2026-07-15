import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

/**
 * Functional Drift Guard page, ported from Drift-Guard.dc.html.
 *
 * Drift Guard is a webhook-driven engine (`check-drift`): a deploy or a
 * push to the default branch on a linked repo re-audits the live site and
 * opens a fix-PR for every check that regressed. There is no drift-events
 * table, so the design's per-deploy "watch history" timeline and open-
 * regression hero have no backing store yet. This page shows what IS real:
 * whether Drift Guard is armed for this site (linked repo + installation +
 * verified), exactly how it fires, and the score-drop threshold — with the
 * re-audit results linked out to History and current regressions to
 * Findings. The event timeline lands when drift runs are persisted.
 */
export default async function DriftGuardPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  const verified = site.verificationStatusValue === 'verified';
  const linked = site.repoFullName !== null && site.installationId !== null;
  const armed = verified && linked;
  const host = stripScheme(site.url);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* PAGE HEADER */}
      <div style={{ animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both', maxWidth: 640 }}>
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
          Drift Guard
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.5, color: PC.muted }}>
          Every deploy is watched. When something regresses, the alert arrives with its fix-PR
          already open.
        </p>
      </div>

      {/* STATUS HERO */}
      <StatusHero
        armed={armed}
        verified={verified}
        linked={linked}
        repo={site.repoFullName}
        host={host}
        siteId={site.id}
      />

      {/* HOW IT FIRES */}
      <Card delay={80}>
        <CardHead title="How Drift Guard fires" />
        <div style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column' }}>
          <TriggerRow
            title="A deploy succeeds"
            body={`A GitHub deployment_status of "success" on ${site.repoFullName ?? 'your repo'} re-audits ${host}.`}
          />
          <TriggerRow
            title="A push lands on the default branch"
            body="The fallback for repos that deploy on push. Pushes to Answerfox's own fix branches are ignored."
          />
          <TriggerRow
            title="Bursts are debounced"
            body="Five pushes in three minutes on one repo collapse into a single check, run after things settle."
          />
          <TriggerRow
            title="Every regression arrives with its fix"
            body="Each check that passed before the deploy and fails now enqueues a fix-PR through the same throttled queue. The open-PR cap and idempotent branches prevent PR spam."
            last
          />
        </div>
      </Card>

      {/* THRESHOLD + WHERE RESULTS LAND */}
      <Card delay={120}>
        <CardHead title="Alerting & results" />
        <div
          style={{ padding: '4px 20px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: PC.ink }}>
                Score-drop alert
              </span>
              <span style={{ fontSize: 12.5, color: PC.muted }}>
                {site.alertThreshold === null
                  ? 'Off. Arm it to get one email per regression crossing.'
                  : `Emails you when a run drops below ${site.alertThreshold} / 100.`}
              </span>
            </div>
            <Link href={`/dashboard/sites/${site.id}/settings`} style={quietLink}>
              Change on Settings →
            </Link>
          </div>
          <div style={{ height: 1, background: PC.line }} />
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <ResultLink
              href={`/dashboard/sites/${site.id}/history`}
              label="Re-audit history"
              sub="Every drift re-audit is a run on the timeline."
            />
            <ResultLink
              href={`/dashboard/sites/${site.id}/findings`}
              label="Current regressions"
              sub="Open findings, each with a Generate-fix control."
            />
          </div>
        </div>
      </Card>

      {/* HONEST SCOPE NOTE */}
      <div
        style={{
          animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
          animationDelay: '160ms',
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '16px 20px',
          fontSize: 13,
          lineHeight: 1.5,
          color: PC.muted,
        }}
      >
        <span style={{ fontFamily: BODY, fontWeight: 600, color: PC.ink }}>
          No per-deploy timeline yet.
        </span>{' '}
        Drift runs are not persisted as their own events, so the deploy-by-deploy watch history
        lands once they are. Today the re-audit shows up in History and any regression in Findings.
      </div>
    </div>
  );
}

/* ============================================================
   STATUS HERO
   ============================================================ */

function StatusHero({
  armed,
  verified,
  linked,
  repo,
  host,
  siteId,
}: {
  armed: boolean;
  verified: boolean;
  linked: boolean;
  repo: string | null;
  host: string;
  siteId: string;
}) {
  const tone = armed ? PC.green : verified ? PC.dim : PC.amber;
  const wash = armed ? PC.greenWash : verified ? PC.hover : PC.amberWash;

  let label: string;
  let body: ReactNode;
  let cta: ReactNode = null;
  if (armed) {
    label = 'watching';
    body = (
      <>
        Drift Guard is watching <strong style={{ color: PC.ink, fontWeight: 600 }}>{repo}</strong>.
        Every deploy or default-branch push re-audits {host} and opens a fix-PR for anything that
        regressed.
      </>
    );
  } else if (!verified) {
    label = 'needs verification';
    body = (
      <>
        Audits are gated until you verify ownership of {host}. Drift Guard arms once the site is
        verified.
      </>
    );
    cta = (
      <Link href={`/dashboard/sites/${siteId}/settings`} style={darkCta}>
        Verify ownership →
      </Link>
    );
  } else {
    label = 'needs a repo';
    body =
      'Drift Guard fires on deploy and push webhooks, so it needs a linked GitHub repo and installation. Connect one to arm it.';
    cta = (
      <Link href="/dashboard/sites/new" style={darkCta}>
        Connect a repo →
      </Link>
    );
  }

  return (
    <div
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: '40ms',
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        boxShadow: `inset 4px 0 0 ${tone}`,
        padding: '20px 22px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 38,
          height: 38,
          borderRadius: 9,
          background: wash,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ShieldIcon color={tone} />
      </span>
      <div
        style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}
      >
        <span
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: MONO,
            fontSize: 10.5,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: tone,
            background: wash,
            borderRadius: 5,
            padding: '2px 7px',
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: tone }} />
          {label}
        </span>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: PC.ink2 }}>{body}</p>
      </div>
      {cta}
    </div>
  );
}

/* ============================================================
   PIECES
   ============================================================ */

function Card({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <div
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: `${delay}ms`,
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function CardHead({ title }: { title: string }) {
  return (
    <div style={{ padding: '18px 20px 8px' }}>
      <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
        {title}
      </span>
    </div>
  );
}

function TriggerRow({
  title,
  body,
  last,
}: {
  title: string;
  body: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 0',
        borderBottom: last ? 'none' : `1px solid ${PC.line}`,
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          marginTop: 5,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: PC.blaze,
        }}
      />
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: PC.ink }}>{title}</span>
        <span style={{ fontSize: 13, lineHeight: 1.5, color: PC.muted }}>{body}</span>
      </div>
    </div>
  );
}

function ResultLink({ href, label, sub }: { href: string; label: string; sub: string }) {
  return (
    <Link
      href={href}
      style={{
        flex: '1 1 240px',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        padding: '12px 14px',
        border: `1px solid ${PC.line}`,
        borderRadius: 8,
        background: PC.sidebar,
        textDecoration: 'none',
      }}
    >
      <span style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 500, color: PC.blazeDeep }}>
        {label} →
      </span>
      <span style={{ fontSize: 12.5, color: PC.muted }}>{sub}</span>
    </Link>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/* ============================================================
   STYLES + HELPERS
   ============================================================ */

const quietLink: CSSProperties = {
  fontFamily: BODY,
  fontSize: 12.5,
  fontWeight: 500,
  color: PC.blazeDeep,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const darkCta: CSSProperties = {
  flex: '0 0 auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 16px',
  height: 38,
  background: PC.ink,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  color: '#FAFAF8',
  textDecoration: 'none',
};

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}
