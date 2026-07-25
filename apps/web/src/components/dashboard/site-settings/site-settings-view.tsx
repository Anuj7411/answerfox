'use client';

import { updateAlertThreshold } from '@/app/(dashboard)/dashboard/sites/[siteId]/alert-actions';
import { rotateIngestToken } from '@/app/(dashboard)/dashboard/sites/[siteId]/analytics-actions';
import { updateSitePublicListing } from '@/app/(dashboard)/dashboard/sites/[siteId]/listing-actions';
import {
  deleteSite,
  renameSite,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/management-actions';
import { updateAuditSchedule } from '@/app/(dashboard)/dashboard/sites/[siteId]/schedule-actions';
import {
  type VerificationActionState,
  checkVerificationAction,
  initiateVerificationAction,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/verification-actions';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { BadgePickerCard } from '@/components/dashboard/site-settings/badge-picker-card';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react';

/** Local hairlines from the Site-Settings design that aren't in PC. */
const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';
const FIELD_LINE = '#DEDDD7';
const READONLY_BG = '#FCFCFA';

type ScheduleValue = 'off' | 'daily' | 'weekly';
type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed';

export interface SiteSettingsViewProps {
  readonly siteId: string;
  readonly name: string;
  readonly url: string;
  readonly isPublic: boolean;
  readonly auditSchedule: ScheduleValue;
  readonly nextScheduledAuditAt: string | null;
  readonly alertThreshold: number | null;
  readonly hasIngestToken: boolean;
  readonly repoFullName: string | null;
  readonly installationId: number | null;
  readonly verificationStatus: VerificationStatus;
  readonly verificationMethod: 'meta' | 'file' | 'dns' | null;
  readonly verificationToken: string | null;
  readonly verifiedAt: string | null;
}

export function SiteSettingsView(props: SiteSettingsViewProps) {
  return (
    <div
      style={{
        maxWidth: 820,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <PageHeader url={props.url} />
      <SiteDetailsCard
        siteId={props.siteId}
        name={props.name}
        url={props.url}
        verified={props.verificationStatus === 'verified'}
        verificationStatus={props.verificationStatus}
      />
      <AuditScheduleCard
        siteId={props.siteId}
        current={props.auditSchedule}
        nextAt={props.nextScheduledAuditAt}
      />
      <PullRequestsCard repoFullName={props.repoFullName} installationId={props.installationId} />
      <AlertCard siteId={props.siteId} current={props.alertThreshold} />
      <IngestTokenCard siteId={props.siteId} hasToken={props.hasIngestToken} />
      <OwnershipCard
        siteId={props.siteId}
        status={props.verificationStatus}
        method={props.verificationMethod}
        token={props.verificationToken}
        verifiedAt={props.verifiedAt}
      />
      <BadgePickerCard siteUrl={props.url} />
      <LeaderboardCard
        siteId={props.siteId}
        isPublic={props.isPublic}
        verified={props.verificationStatus === 'verified'}
      />
      <DangerZoneCard siteId={props.siteId} name={props.name} />
    </div>
  );
}

/* ============================================================
   PAGE HEADER
   ============================================================ */

function PageHeader({ url }: { readonly url: string }) {
  return (
    <div style={{ animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both' }}>
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
      <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>{stripScheme(url)}</span>
      </p>
    </div>
  );
}

/* ============================================================
   CARD PRIMITIVES (Porcelain, from Site-Settings.dc.html)
   ============================================================ */

function Card({
  children,
  delay,
  dangerTop,
}: { children: ReactNode; delay: number; dangerTop?: boolean }) {
  return (
    <div
      style={{
        animation: 'afxUp .4s cubic-bezier(.16,1,.3,1) both',
        animationDelay: `${delay}ms`,
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderTop: dangerTop ? `2px solid ${PC.red}` : undefined,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

function CardHead({
  title,
  subtitle,
  right,
  titleColor,
}: { title: string; subtitle?: string; right?: ReactNode; titleColor?: string }) {
  return (
    <div
      style={{
        padding: subtitle ? '18px 20px 4px' : '18px 20px 8px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span
          style={{ fontFamily: BODY, fontWeight: 600, fontSize: 15, color: titleColor ?? PC.ink }}
        >
          {title}
        </span>
        {subtitle ? <span style={{ fontSize: 13, color: PC.muted }}>{subtitle}</span> : null}
      </div>
      {right}
    </div>
  );
}

function CardBody({ children, gap = 14 }: { children: ReactNode; gap?: number }) {
  return (
    <div style={{ padding: '14px 20px 18px', display: 'flex', flexDirection: 'column', gap }}>
      {children}
    </div>
  );
}

function CardFoot({ note, children }: { note: ReactNode; children: ReactNode }) {
  return (
    <div
      style={{
        padding: '12px 20px',
        borderTop: `1px solid ${FOOT_LINE}`,
        background: FOOT_BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>{note}</span>
      {children}
    </div>
  );
}

const fieldLabelStyle: CSSProperties = { fontFamily: BODY, fontSize: 13, color: PC.ink };

function SaveButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        height: 34,
        padding: '0 15px',
        background: disabled ? PC.hover : PC.ink,
        border: 'none',
        borderRadius: 6,
        fontFamily: BODY,
        fontSize: 13,
        fontWeight: 500,
        color: disabled ? PC.dim : '#FAFAF8',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}

function QuietButton({
  onClick,
  disabled,
  children,
  danger,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 34,
        padding: '0 13px',
        background: PC.card,
        border: `1px solid ${danger ? '#F0BFBF' : PC.line}`,
        borderRadius: 6,
        fontFamily: BODY,
        fontSize: 12.5,
        fontWeight: 500,
        color: danger ? PC.red : PC.ink,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        background: PC.hover,
        border: `1px solid ${PC.line}`,
        borderRadius: 8,
        padding: 2,
        alignSelf: 'flex-start',
      }}
    >
      {options.map((opt) => {
        const on = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            disabled={disabled}
            aria-pressed={on}
            style={{
              fontFamily: BODY,
              fontSize: 12.5,
              fontWeight: 500,
              height: 28,
              padding: '0 14px',
              border: `1px solid ${on ? FIELD_LINE : 'transparent'}`,
              background: on ? PC.card : 'transparent',
              color: on ? PC.ink : PC.muted,
              borderRadius: 6,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Stepper({
  value,
  onDec,
  onInc,
  disabled,
}: {
  value: ReactNode;
  onDec: () => void;
  onInc: () => void;
  disabled?: boolean;
}) {
  const btn: CSSProperties = {
    width: 30,
    height: 34,
    border: 'none',
    background: PC.card,
    color: PC.muted,
    fontSize: 18,
    lineHeight: 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${FIELD_LINE}`,
        borderRadius: 6,
        overflow: 'hidden',
        background: PC.card,
      }}
    >
      <button
        type="button"
        onClick={onDec}
        disabled={disabled}
        aria-label="decrease"
        style={{ ...btn, borderRight: `1px solid ${PC.line}` }}
      >
        −
      </button>
      <span
        style={{
          minWidth: 44,
          textAlign: 'center',
          fontFamily: MONO,
          fontSize: 13,
          color: PC.ink,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={onInc}
        disabled={disabled}
        aria-label="increase"
        style={{ ...btn, borderLeft: `1px solid ${PC.line}` }}
      >
        +
      </button>
    </div>
  );
}

function StatusNote({
  error,
  savedAt,
  dirty,
}: { error: string | null; savedAt: Date | null; dirty: boolean }) {
  if (error !== null)
    return <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.red }}>{error}</span>;
  if (savedAt !== null && !dirty)
    return <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.green }}>Saved.</span>;
  return null;
}

/* ============================================================
   1) SITE DETAILS — rename + read-only URL + site id
   ============================================================ */

function SiteDetailsCard({
  siteId,
  name,
  url,
  verified,
  verificationStatus,
}: {
  siteId: string;
  name: string;
  url: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
}) {
  const [value, setValue] = useState(name);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  const dirty = value.trim() !== name.trim();

  function save() {
    setError(null);
    start(async () => {
      const res = await renameSite(siteId, value);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <Card delay={20}>
      <CardHead title="Site details" subtitle="The name and canonical URL Answerfox tracks." />
      <CardBody>
        <div
          className="afx-row2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}
        >
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={fieldLabelStyle}>Display name</span>
            <input
              value={value}
              onChange={(e) => setValue(e.currentTarget.value)}
              disabled={pending}
              maxLength={120}
              style={{
                height: 36,
                padding: '0 12px',
                border: `1px solid ${FIELD_LINE}`,
                borderRadius: 6,
                background: PC.card,
                fontSize: 13.5,
                color: PC.ink,
                outline: 'none',
              }}
            />
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={fieldLabelStyle}>Canonical URL</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 36,
                padding: '0 12px',
                border: `1px solid ${PC.line}`,
                background: READONLY_BG,
                borderRadius: 6,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color: PC.muted,
                  flex: '1 1 auto',
                  minWidth: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {url}
              </span>
              <VerificationBadge status={verificationStatus} compact />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={fieldLabelStyle}>Site ID</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <code
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontFamily: MONO,
                fontSize: 13,
                color: PC.ink,
                background: PC.hover,
                border: `1px solid ${PC.line}`,
                borderRadius: 6,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {siteId}
            </code>
            <QuietButton
              onClick={() => {
                void copyText(siteId).then((ok) => {
                  if (!ok) return;
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              <CopyIcon />
              {copied ? 'Copied' : 'Copy'}
            </QuietButton>
          </div>
        </div>
      </CardBody>
      <CardFoot note="Changes apply to the next audit.">
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusNote error={error} savedAt={savedAt} dirty={dirty} />
          <SaveButton
            onClick={save}
            disabled={pending || !dirty || value.trim().length === 0}
            label={pending ? 'Saving…' : 'Save'}
          />
        </span>
      </CardFoot>
    </Card>
  );
}

/* ============================================================
   2) AUDIT SCHEDULE
   ============================================================ */

function AuditScheduleCard({
  siteId,
  current,
  nextAt,
}: {
  siteId: string;
  current: ScheduleValue;
  nextAt: string | null;
}) {
  const [selected, setSelected] = useState<ScheduleValue>(current);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = selected !== current;

  function save() {
    setError(null);
    start(async () => {
      const res = await updateAuditSchedule(siteId, selected);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <Card delay={40}>
      <CardHead title="Audit schedule" subtitle="When we re-audit this site on a cadence." />
      <CardBody gap={16}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={fieldLabelStyle}>Schedule</span>
          <Segmented
            options={[
              { value: 'off', label: 'Off' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
            ]}
            value={selected}
            onChange={setSelected}
            disabled={pending}
          />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
            The scheduler picks up changes on the next hourly sweep.
          </span>
        </div>
      </CardBody>
      <CardFoot note={`Next audit: ${nextAuditLabel(selected, current, nextAt)}.`}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusNote error={error} savedAt={savedAt} dirty={dirty} />
          <SaveButton
            onClick={save}
            disabled={pending || !dirty}
            label={pending ? 'Saving…' : 'Save'}
          />
        </span>
      </CardFoot>
    </Card>
  );
}

/* ============================================================
   3) PULL REQUESTS — read-only linked repo
   ============================================================ */

function PullRequestsCard({
  repoFullName,
  installationId,
}: { repoFullName: string | null; installationId: number | null }) {
  const linked = repoFullName !== null;
  return (
    <Card delay={60}>
      <CardHead title="Pull requests" subtitle="How Answerfox opens fixes on your repo." />
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={fieldLabelStyle}>Linked repository</span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              border: `1px solid ${PC.line}`,
              background: READONLY_BG,
              borderRadius: 8,
              flexWrap: 'wrap',
            }}
          >
            <GitHubIcon />
            {linked ? (
              <>
                <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
                  {repoFullName}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
                  {installationId !== null ? `installation #${installationId}` : 'no installation'}
                </span>
              </>
            ) : (
              <span style={{ fontSize: 13, color: PC.muted }}>
                No repo linked — fixes stay advisory (copy-paste snippets) until you connect one.
              </span>
            )}
          </div>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
            {linked
              ? 'Fixes ship as pull requests against this repository.'
              : 'Connect a repo from Add a site to switch on the fix-PR loop.'}
          </span>
        </div>
      </CardBody>
    </Card>
  );
}

/* ============================================================
   4) SCORE-DROP ALERT — real alertThreshold
   ============================================================ */

const ALERT_PRESETS: ReadonlyArray<number> = [60, 70, 80, 90];

function AlertCard({ siteId, current }: { siteId: string; current: number | null }) {
  const [armed, setArmed] = useState(current !== null);
  const [value, setValue] = useState<number>(current ?? 80);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const target = armed ? value : null;
  const dirty = target !== current;

  function save() {
    setError(null);
    start(async () => {
      const res = await updateAlertThreshold(siteId, armed ? value : null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <Card delay={80}>
      <CardHead
        title="Score-drop alert"
        subtitle="Email me when a run drops below a score, so regressions don't slip by."
        right={<Toggle on={armed} onToggle={() => setArmed((a) => !a)} disabled={pending} />}
      />
      <CardBody gap={14}>
        {armed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13.5, color: PC.muted }}>
                Alert when the score drops below
              </span>
              <Stepper
                value={value}
                onDec={() => setValue((v) => Math.max(0, v - 5))}
                onInc={() => setValue((v) => Math.min(100, v + 5))}
                disabled={pending}
              />
              <span style={{ fontSize: 13.5, color: PC.muted }}>/ 100</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {ALERT_PRESETS.map((p) => {
                const active = value === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setValue(p)}
                    disabled={pending}
                    aria-pressed={active}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 999,
                      border: `1px solid ${active ? PC.blaze : PC.line16}`,
                      background: active ? PC.blazeWash : PC.card,
                      fontFamily: MONO,
                      fontSize: 12.5,
                      color: active ? PC.ink : PC.muted,
                      cursor: pending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <span style={{ fontSize: 13.5, color: PC.muted }}>
            Score-drop alerts are off. Turn them on to get one email per crossing.
          </span>
        )}
      </CardBody>
      <CardFoot note="One email per crossing, sent to your account email.">
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <StatusNote error={error} savedAt={savedAt} dirty={dirty} />
          <SaveButton
            onClick={save}
            disabled={pending || !dirty}
            label={pending ? 'Saving…' : 'Save'}
          />
        </span>
      </CardFoot>
    </Card>
  );
}

/* ============================================================
   5) AGENT TRAFFIC — ingest token status + rotate
   ============================================================ */

function IngestTokenCard({ siteId, hasToken }: { siteId: string; hasToken: boolean }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [freshToken, setFreshToken] = useState<string | null>(null);
  const [everSet, setEverSet] = useState(hasToken);
  const [copied, setCopied] = useState(false);

  function rotate() {
    setError(null);
    start(async () => {
      const res = await rotateIngestToken(siteId);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setFreshToken(res.token);
      setEverSet(true);
    });
  }

  return (
    <Card delay={100}>
      <CardHead
        title="Agent traffic tracking"
        subtitle="Classify which AI agents fetch this site. Free, server-side, no client script."
      />
      <CardBody gap={14}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            height: 36,
            padding: '0 12px',
            border: `1px solid ${PC.line}`,
            background: everSet ? PC.greenWash : READONLY_BG,
            borderRadius: 6,
            alignSelf: 'flex-start',
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: everSet ? PC.greenBright : PC.dim,
              flex: '0 0 auto',
            }}
          />
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: everSet ? PC.green : PC.muted }}>
            {everSet
              ? 'token active · point your ingest at /api/ingest'
              : 'no token yet · mint one to start receiving events'}
          </span>
        </div>

        {freshToken !== null ? (
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
              New token · shown once
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <code
                style={{
                  flex: '1 1 240px',
                  minWidth: 0,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  fontFamily: MONO,
                  fontSize: 13,
                  color: PC.ink,
                  background: PC.hover,
                  border: `1px solid ${PC.line}`,
                  borderRadius: 6,
                  whiteSpace: 'nowrap',
                  overflow: 'auto',
                }}
              >
                {freshToken}
              </code>
              <button
                type="button"
                onClick={() => {
                  void copyText(freshToken).then((ok) => {
                    if (!ok) return;
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
                style={{
                  height: 36,
                  padding: '0 14px',
                  background: PC.ink,
                  border: 'none',
                  borderRadius: 6,
                  fontFamily: BODY,
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#FAFAF8',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
              Copy it now — we never show a token again after it's minted.
            </span>
          </div>
        ) : null}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <QuietButton onClick={rotate} disabled={pending}>
            {pending ? 'Working…' : everSet ? 'Rotate token' : 'Generate token'}
          </QuietButton>
          {everSet ? (
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
              Rotating invalidates the old token immediately.
            </span>
          ) : null}
          {error !== null ? (
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.red }}>{error}</span>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

/* ============================================================
   6) OWNERSHIP — verification flow
   ============================================================ */

const VERIF_IDLE: VerificationActionState = { status: 'idle' };

function OwnershipCard({
  siteId,
  status,
  method,
  token,
  verifiedAt,
}: {
  siteId: string;
  status: VerificationStatus;
  method: 'meta' | 'file' | 'dns' | null;
  token: string | null;
  verifiedAt: string | null;
}) {
  const [pending, start] = useTransition();
  const [action, setAction] = useState<VerificationActionState>(VERIF_IDLE);
  const [copied, setCopied] = useState(false);

  const effectiveStatus: VerificationStatus =
    action.status !== 'idle' ? (action.status as VerificationStatus) : status;
  const effectiveToken = action.token ?? token;
  const effectiveMethod = action.method ?? method;
  const verified = effectiveStatus === 'verified';

  function initiate() {
    start(async () => setAction(await initiateVerificationAction(siteId)));
  }
  function check() {
    start(async () => setAction(await checkVerificationAction(siteId)));
  }

  const metaSnippet =
    effectiveToken !== null ? `<meta name="answerfox-verify" content="${effectiveToken}">` : null;

  return (
    <Card delay={120}>
      <CardHead
        title="Ownership"
        subtitle="How you proved you control this domain."
        right={<VerificationBadge status={effectiveStatus} />}
      />
      <CardBody gap={12}>
        {verified ? (
          <>
            <VerifMethodRows activeMethod={effectiveMethod} />
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.dim }}>
              {effectiveMethod !== null
                ? `Verified via ${methodLabel(effectiveMethod)}`
                : 'Verified'}
              {verifiedAt !== null ? ` on ${verifiedAt.slice(0, 10)}` : ''}.
            </span>
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: PC.muted }}>
              Audits are gated until we confirm you control the origin. Deploy the token via any one
              method below, then re-check.
            </p>
            {effectiveToken === null ? (
              <QuietButton onClick={initiate} disabled={pending}>
                {pending ? 'Issuing…' : 'Start verification'}
              </QuietButton>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <TokenBlock label="Meta tag · paste in <head>" code={metaSnippet ?? ''} />
                <TokenBlock label="File · /.well-known/answerfox-verify" code={effectiveToken} />
                <TokenBlock label="DNS TXT · @" code={`answerfox-verify=${effectiveToken}`} />
                {effectiveStatus === 'failed' && action.attempts !== undefined ? (
                  <div
                    style={{
                      padding: '10px 12px',
                      border: `1px solid ${PC.line}`,
                      background: PC.redWash,
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: PC.red }}>
                      Token not found yet.
                    </span>
                    <ul
                      style={{
                        margin: '6px 0 0',
                        paddingLeft: 18,
                        fontFamily: MONO,
                        fontSize: 12,
                        color: PC.muted,
                      }}
                    >
                      {action.attempts.map((a) => (
                        <li key={a.method}>
                          {a.method}: {a.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </CardBody>
      {verified && metaSnippet !== null ? (
        <div style={{ padding: '0 20px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            Meta tag
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <code
              style={{
                flex: '1 1 320px',
                minWidth: 0,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                fontFamily: MONO,
                fontSize: 12.5,
                color: PC.ink,
                background: PC.hover,
                border: `1px solid ${PC.line}`,
                borderRadius: 6,
                whiteSpace: 'nowrap',
                overflow: 'auto',
              }}
            >
              {metaSnippet}
            </code>
            <QuietButton
              onClick={() => {
                void copyText(metaSnippet).then((ok) => {
                  if (!ok) return;
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1500);
                });
              }}
            >
              <CopyIcon />
              {copied ? 'Copied' : 'Copy'}
            </QuietButton>
          </div>
        </div>
      ) : null}
      <CardFoot
        note={
          verified
            ? 'Re-check any time to confirm the token is still live.'
            : 'Deploy the token, then re-check.'
        }
      >
        {effectiveToken !== null ? (
          <QuietButton onClick={check} disabled={pending}>
            {pending ? 'Checking…' : verified ? 'Re-verify' : 'Check now'}
          </QuietButton>
        ) : (
          <span />
        )}
      </CardFoot>
    </Card>
  );
}

function VerifMethodRows({ activeMethod }: { activeMethod: 'meta' | 'file' | 'dns' | null }) {
  const rows: ReadonlyArray<{ key: 'meta' | 'file' | 'dns'; label: string }> = [
    { key: 'meta', label: 'Meta tag' },
    { key: 'file', label: 'well-known file' },
    { key: 'dns', label: 'DNS TXT record' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {rows.map((r) => {
        const active = r.key === activeMethod;
        return (
          <div
            key={r.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              border: `1px solid ${active ? '#CDE9D6' : PC.line}`,
              background: active ? '#F1FAF4' : READONLY_BG,
              borderRadius: 8,
            }}
          >
            {active ? <CheckCircleIcon color={PC.green} /> : <MinusCircleIcon color={PC.dim} />}
            <span
              style={{
                flex: '1 1 auto',
                fontSize: 13.5,
                fontWeight: 500,
                color: active ? PC.ink : PC.muted,
              }}
            >
              {r.label}
            </span>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: active ? PC.green : PC.dim }}>
              {active ? 'verified' : 'not used'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function TokenBlock({ label, code }: { label: string; code: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: '.06em',
          textTransform: 'uppercase',
          color: PC.dim,
        }}
      >
        {label}
      </span>
      <code
        style={{
          display: 'block',
          padding: '8px 12px',
          fontFamily: MONO,
          fontSize: 12.5,
          color: PC.ink,
          background: PC.hover,
          border: `1px solid ${PC.line}`,
          borderRadius: 6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
        }}
      >
        {code}
      </code>
    </div>
  );
}

/* ============================================================
   6b) PUBLIC LEADERBOARD — opt-in toggle
   ============================================================ */

function LeaderboardCard({
  siteId,
  isPublic,
  verified,
}: { siteId: string; isPublic: boolean; verified: boolean }) {
  const [on, setOn] = useState(isPublic);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function toggle() {
    const next = !on;
    setError(null);
    setOn(next); // optimistic
    start(async () => {
      const res = await updateSitePublicListing(siteId, next);
      if (!res.ok) {
        setOn(!next); // revert
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <Card delay={90}>
      <CardHead
        title="Public leaderboard"
        subtitle="List this site on the public board — domain, score, and band only."
        right={<Toggle on={on} onToggle={toggle} disabled={pending || !verified} />}
      />
      <CardBody>
        {!verified ? (
          <span style={{ fontSize: 13.5, color: PC.muted }}>
            Verify ownership above to make this site eligible for the leaderboard.
          </span>
        ) : on ? (
          <span style={{ fontSize: 13.5, color: PC.muted }}>
            Listed. Your domain and latest score are public. Findings, agent traffic, and the linked
            repo stay private.
          </span>
        ) : (
          <span style={{ fontSize: 13.5, color: PC.muted }}>
            Not listed. Turn this on to show your domain and score publicly and benchmark against
            other sites.
          </span>
        )}
      </CardBody>
      <CardFoot
        note={
          <a href="/leaderboard" style={{ color: PC.muted, textDecoration: 'underline' }}>
            View the leaderboard
          </a>
        }
      >
        <StatusNote error={error} savedAt={savedAt} dirty={false} />
      </CardFoot>
    </Card>
  );
}

/* ============================================================
   7) DANGER ZONE — delete with typed confirm modal
   ============================================================ */

function DangerZoneCard({ siteId, name }: { siteId: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Drive the native <dialog> from React state so we get the browser's
  // focus trap, Escape-to-close, and inert backdrop for free.
  useEffect(() => {
    const el = dialogRef.current;
    if (el === null) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const canDelete = confirmText.trim() === name.trim() && name.length > 0;

  function handleDelete() {
    if (!canDelete) return;
    setError(null);
    start(async () => {
      const res = await deleteSite(siteId);
      // deleteSite redirects on success; a returned value means it failed.
      if (res !== undefined && !res.ok) setError(res.error);
    });
  }

  return (
    <>
      <Card delay={140} dangerTop>
        <CardHead title="Danger zone" titleColor={PC.red} />
        <div style={{ padding: '6px 20px 18px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 0',
              borderTop: `1px solid ${FOOT_LINE}`,
            }}
          >
            <div
              style={{
                flex: '1 1 auto',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 500, color: PC.ink }}>Delete site</span>
              <span style={{ fontSize: 12.5, color: PC.muted }}>
                Removes {name}, its audit history, findings, and all monitoring. Can't be undone.
              </span>
            </div>
            <QuietButton
              onClick={() => {
                setOpen(true);
                setConfirmText('');
                setError(null);
              }}
              danger
            >
              Delete site
            </QuietButton>
          </div>
        </div>
      </Card>

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
              Delete {name}
            </span>
            <span style={{ fontSize: 13.5, color: PC.muted }}>
              Removes the site, its audit history, and all monitoring. Type{' '}
              <span style={{ fontFamily: MONO, color: PC.ink }}>{name}</span> to confirm.
            </span>
          </div>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            placeholder={name}
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
              {pending ? 'Deleting…' : 'Delete site'}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

/* ============================================================
   SMALL SHARED BITS
   ============================================================ */

function VerificationBadge({ status, compact }: { status: VerificationStatus; compact?: boolean }) {
  const verified = status === 'verified';
  const color = verified ? PC.green : status === 'failed' ? PC.red : PC.amber;
  const bg = verified ? PC.greenWash : status === 'failed' ? PC.redWash : PC.amberWash;
  const label = verified ? 'verified' : status;
  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color,
          background: bg,
          borderRadius: 5,
          padding: '2px 7px',
          flex: '0 0 auto',
        }}
      >
        {label}
      </span>
    );
  }
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: MONO,
        fontSize: 11,
        color,
        background: bg,
        borderRadius: 999,
        padding: '3px 11px',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

function Toggle({
  on,
  onToggle,
  disabled,
}: { on: boolean; onToggle: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={on}
      style={{
        flex: '0 0 auto',
        position: 'relative',
        width: 38,
        height: 22,
        border: 'none',
        borderRadius: 999,
        background: on ? PC.greenBright : PC.line16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          transition: 'left .18s ease',
        }}
      />
    </button>
  );
}

function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function CheckCircleIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MinusCircleIcon({ color }: { color: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto' }}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  );
}

/* ============================================================
   PURE HELPERS
   ============================================================ */

function stripScheme(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function methodLabel(m: 'meta' | 'file' | 'dns'): string {
  if (m === 'meta') return 'meta tag';
  if (m === 'file') return 'well-known file';
  return 'DNS TXT record';
}

function nextAuditLabel(
  selected: ScheduleValue,
  current: ScheduleValue,
  nextAt: string | null,
): string {
  if (selected === 'off') return 'paused';
  // If the pending selection matches what's saved, we can show the real time.
  if (selected === current && nextAt !== null) {
    const diff = new Date(nextAt).getTime() - Date.now();
    if (diff <= 0) return 'within the hour';
    const hours = Math.round(diff / 3_600_000);
    if (hours < 36) return `in ${hours}h`;
    return `in ${Math.round(hours / 24)}d`;
  }
  return selected === 'daily' ? 'every 24h once saved' : 'every 7d once saved';
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
