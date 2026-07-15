'use client';

import {
  deleteAccountAction,
  updateDisplayName,
} from '@/app/(dashboard)/dashboard/settings/actions';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useEffect, useRef, useState, useTransition } from 'react';

/* ─── shared constants (match design hex) ─── */
const FIELD_LINE = '#DEDDD7';
const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';

/* ─── props ─── */

export interface AccountSettingsProps {
  readonly profile: {
    readonly name: string | null;
    readonly email: string;
    readonly createdAt: string;
    readonly siteCount: number;
  };
  readonly githubLogin: string | null;
  readonly planLabel: string;
  readonly paidSiteCount: number;
}

/* ============================================================
   ROOT
   ============================================================ */

export function AccountSettingsView({
  profile,
  githubLogin,
  planLabel,
  paidSiteCount,
}: AccountSettingsProps) {
  return (
    <div
      style={{
        maxWidth: 820,
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
          Settings
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>Your account</p>
      </div>

      <ProfileCard name={profile.name} email={profile.email} />
      <GitHubAccountCard login={githubLogin} />
      <BillingCard planLabel={planLabel} paidSiteCount={paidSiteCount} />
      <DangerZoneCard />
    </div>
  );
}

/* ============================================================
   1) PROFILE CARD
   ============================================================ */

function ProfileCard({ name, email }: { name: string | null; email: string }) {
  const [displayName, setDisplayName] = useState(name ?? '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const normalized = displayName.trim();
  const dirty = normalized !== (name ?? '');

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateDisplayName(displayName);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  }

  const initials = computeInitials(name ?? email);

  return (
    <Card>
      <CardHead title="Profile" subtitle="How you appear and where we reach you." />
      <div style={{ padding: '14px 20px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              flex: '0 0 auto',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: PC.ink,
                color: '#FAFAF8',
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 24,
              }}
            >
              {initials}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: PC.dim,
              }}
            >
              synced from GitHub
            </span>
          </div>

          {/* Fields */}
          <div
            style={{
              flex: '1 1 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            {/* Display name */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: PC.ink }}>Display name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.currentTarget.value);
                  setSaved(false);
                }}
                disabled={pending}
                maxLength={80}
                placeholder={email}
                style={{
                  height: 36,
                  padding: '0 12px',
                  border: `1px solid ${FIELD_LINE}`,
                  borderRadius: 6,
                  background: PC.card,
                  fontSize: 13.5,
                  color: PC.ink,
                  outline: 'none',
                  fontFamily: BODY,
                }}
              />
            </label>

            {/* Email (read-only) */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ fontFamily: BODY, fontSize: 13, color: PC.ink }}>Email</span>
              <input
                type="email"
                value={email}
                disabled
                style={{
                  height: 36,
                  padding: '0 12px',
                  border: `1px solid ${FIELD_LINE}`,
                  borderRadius: 6,
                  background: PC.hover,
                  fontFamily: MONO,
                  fontSize: 13,
                  color: PC.muted,
                  outline: 'none',
                  cursor: 'not-allowed',
                }}
              />
            </label>
          </div>
        </div>

        {/* Feedback */}
        {error !== null ? (
          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: PC.red }}>{error}</div>
        ) : null}
        {saved && !dirty ? (
          <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 12, color: PC.green }}>
            Saved.
          </div>
        ) : null}
      </div>

      {/* Footer with Save button */}
      <div
        style={{
          padding: '12px 20px',
          borderTop: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        <button
          type="button"
          onClick={save}
          disabled={pending || !dirty}
          style={{
            height: 34,
            padding: '0 15px',
            background: dirty ? PC.ink : PC.dim,
            border: 'none',
            borderRadius: 6,
            fontFamily: BODY,
            fontSize: 13,
            fontWeight: 500,
            color: '#FAFAF8',
            cursor: dirty && !pending ? 'pointer' : 'not-allowed',
            opacity: dirty ? 1 : 0.6,
          }}
        >
          {pending ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>
    </Card>
  );
}

/* ============================================================
   2) GITHUB ACCOUNT CARD
   ============================================================ */

function GitHubAccountCard({ login }: { login: string | null }) {
  return (
    <Card>
      <CardHead title="GitHub account" subtitle="Used to sign in and to open pull requests." />
      <div
        style={{
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        {/* GitHub icon */}
        <span
          style={{
            flex: '0 0 auto',
            width: 36,
            height: 36,
            borderRadius: 9,
            background: PC.hover,
            border: `1px solid ${PC.line}`,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={PC.ink}
            stroke="none"
            role="img"
            aria-label="GitHub"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
          </svg>
        </span>

        {/* Login + badge */}
        <span
          style={{
            flex: '1 1 auto',
            minWidth: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
            {login !== null ? `@${login}` : 'GitHub'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: MONO,
              fontSize: 11,
              color: PC.green,
              background: PC.greenWash,
              borderRadius: 999,
              padding: '2px 10px',
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: PC.greenBright,
              }}
            />
            connected
          </span>
        </span>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '11px 20px',
          borderTop: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PC.dim}
          strokeWidth="1.85"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Security"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
        </svg>
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11.5,
            color: PC.dim,
            flex: '1 1 auto',
            minWidth: 0,
          }}
        >
          Password &amp; two-factor are secured by your GitHub account.
        </span>
        <a
          href="https://github.com/settings/security"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: BODY,
            fontSize: 12.5,
            color: PC.dim,
            whiteSpace: 'nowrap',
            flex: '0 0 auto',
            textDecoration: 'none',
          }}
        >
          Manage on GitHub &rarr;
        </a>
      </div>
    </Card>
  );
}

/* ============================================================
   3) BILLING CARD
   ============================================================ */

function BillingCard({
  planLabel,
  paidSiteCount,
}: {
  planLabel: string;
  paidSiteCount: number;
}) {
  const isPaid = planLabel === 'Paid';
  return (
    <Card>
      <CardHead title="Billing" subtitle="Plan and payment." />
      <div
        style={{
          padding: '14px 20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 13.5,
            color: PC.ink,
            flex: '1 1 auto',
            minWidth: 200,
          }}
        >
          Plan <span style={{ fontWeight: 500 }}>{planLabel}</span>
          {isPaid && paidSiteCount > 0 ? (
            <>
              <span style={{ color: FIELD_LINE }}> · </span>
              <span style={{ color: PC.muted }}>
                {paidSiteCount} paid private site{paidSiteCount === 1 ? '' : 's'}
              </span>
            </>
          ) : null}
        </span>
        <a
          href="/dashboard/billing"
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '0 15px',
            height: 36,
            background: PC.ink,
            borderRadius: 8,
            fontFamily: BODY,
            fontSize: 13,
            fontWeight: 500,
            color: '#FAFAF8',
            textDecoration: 'none',
          }}
        >
          Manage billing
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
            aria-label="Arrow"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </a>
      </div>
      <div
        style={{
          padding: '11px 20px',
          borderTop: `1px solid ${FOOT_LINE}`,
          background: FOOT_BG,
          fontFamily: MONO,
          fontSize: 11.5,
          color: PC.dim,
        }}
      >
        Public repos are always free.
      </div>
    </Card>
  );
}

/* ============================================================
   4) DANGER ZONE — delete account with typed confirm
   ============================================================ */

function DangerZoneCard() {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (el === null) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const canDelete = confirmText.trim().toLowerCase() === 'delete my account';

  function handleDelete() {
    if (!canDelete) return;
    setError(null);
    start(async () => {
      const res = await deleteAccountAction();
      if (res !== undefined && !res.ok) setError(res.error);
    });
  }

  return (
    <>
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          overflow: 'hidden',
          borderTop: `2px solid ${PC.red}`,
        }}
      >
        <div style={{ padding: '18px 20px 8px' }}>
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.red }}>
            Danger zone
          </span>
        </div>
        <div
          style={{
            padding: '6px 20px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: '1 1 260px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 500, color: PC.ink }}>Delete account</span>
            <span style={{ fontSize: 12.5, color: PC.muted }}>
              Deletes your account, every site, all audit history, and revokes the GitHub App.
              Can&apos;t be undone.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setConfirmText('');
              setError(null);
            }}
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 34,
              padding: '0 14px',
              background: PC.card,
              border: '1px solid #F0BFBF',
              borderRadius: 8,
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 500,
              color: PC.red,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PC.red}
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="Delete"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            </svg>
            Delete account
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="afx-modal"
        style={{
          border: `1px solid ${PC.line}`,
          borderRadius: 14,
          maxWidth: 460,
          width: '100%',
          padding: '22px 22px 18px',
          background: PC.card,
          color: PC.ink,
          boxShadow: '0 20px 40px rgba(0,0,0,.14)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 16, color: PC.red }}>
              Delete account
            </span>
            <span style={{ fontSize: 13.5, color: PC.muted }}>
              To confirm, type{' '}
              <span style={{ fontFamily: MONO, color: PC.ink }}>delete my account</span> below.
            </span>
          </div>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            placeholder="delete my account"
            disabled={pending}
            style={{
              height: 38,
              padding: '0 12px',
              border: `1px solid ${FIELD_LINE}`,
              borderRadius: 8,
              background: PC.card,
              fontFamily: MONO,
              fontSize: 13,
              color: PC.ink,
              outline: 'none',
            }}
          />
          {error !== null ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.red }}>{error}</span>
          ) : null}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              style={{
                height: 36,
                padding: '0 14px',
                background: PC.card,
                border: `1px solid ${PC.line}`,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: PC.ink,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={pending || !canDelete}
              style={{
                height: 36,
                padding: '0 14px',
                background: canDelete ? PC.red : '#EDA4A4',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#FFFFFF',
                cursor: canDelete && !pending ? 'pointer' : 'not-allowed',
                opacity: canDelete ? 1 : 0.9,
              }}
            >
              {pending ? 'Deleting…' : 'Delete account'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */

function Card({ children, dangerTop }: { children: React.ReactNode; dangerTop?: boolean }) {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
        ...(dangerTop ? { borderTop: `2px solid ${PC.red}` } : {}),
      }}
    >
      {children}
    </div>
  );
}

function CardHead({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        padding: '18px 20px 4px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: PC.ink }}>
        {title}
      </span>
      <span style={{ fontSize: 13, color: PC.muted }}>{subtitle}</span>
    </div>
  );
}

function computeInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (name[0] ?? '?').toUpperCase();
}
