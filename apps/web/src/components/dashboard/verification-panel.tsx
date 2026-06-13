'use client';

import {
  type VerificationActionState,
  checkVerificationAction,
  initiateVerificationAction,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/verification-actions';
import { useActionState } from 'react';

interface VerificationPanelProps {
  readonly siteId: string;
  readonly siteUrl: string;
  readonly status: 'unverified' | 'pending' | 'verified' | 'failed';
  readonly token: string | null;
  readonly verifiedMethod: 'meta' | 'file' | 'dns' | null;
  readonly verifiedAt: Date | null;
}

const initialState: VerificationActionState = { status: 'idle' };

/**
 * Site-ownership verification panel. Renders the appropriate UI for
 * each lifecycle state (unverified / pending / verified / failed).
 *
 * Audits are gated upstream — the site detail page only renders the
 * AuditNowButton when the site is verified. This panel is the only
 * surface the user can verify from for now.
 */
export function VerificationPanel({
  siteId,
  siteUrl,
  status,
  token,
  verifiedMethod,
  verifiedAt,
}: VerificationPanelProps) {
  const [initState, initAction, initPending] = useActionState(
    async () => initiateVerificationAction(siteId),
    initialState,
  );
  const [checkState, checkAction, checkPending] = useActionState(
    async () => checkVerificationAction(siteId),
    initialState,
  );

  // After initiate or check runs, those states override the row-state
  // we were rendered with. Token from the latest initiate wins.
  const effectiveStatus =
    checkState.status !== 'idle'
      ? checkState.status
      : initState.status !== 'idle'
        ? initState.status
        : status;
  const effectiveToken = initState.token ?? token;

  if (effectiveStatus === 'verified') {
    const method = checkState.method ?? verifiedMethod;
    return (
      <section className="rounded-2xl border border-emerald-300 bg-emerald-50 p-6">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[12px] uppercase tracking-wide text-emerald-700">
            Verified
          </span>
          <span className="text-[12.5px] text-emerald-900/80">
            via {method ?? '—'} method
            {verifiedAt !== null ? ` on ${verifiedAt.toISOString().slice(0, 10)}` : ''}
          </span>
        </div>
        <p className="mt-2 font-body text-[14px] text-emerald-900">
          You own this site. Audits run against {siteUrl} are attributed to your account.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-amber-300 bg-amber-50/70 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-amber-950">Verify ownership of {siteUrl}</h2>
          <p className="mt-1 max-w-[60ch] font-body text-[14px] text-amber-950/85">
            Audits are gated until we can confirm you control the origin. Pick any one of the three
            methods below — whichever fits your stack.
          </p>
        </div>
        {effectiveStatus === 'unverified' ? (
          <form action={initAction}>
            <button type="submit" disabled={initPending} className="btn btn-solid">
              {initPending ? 'Issuing token...' : 'Start verification'}
            </button>
          </form>
        ) : null}
      </div>

      {effectiveStatus !== 'unverified' && effectiveToken !== null ? (
        <div className="mt-6 space-y-6">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-wide text-amber-900">
              Your token
            </p>
            <code className="mt-2 block break-all rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-[13px]">
              {effectiveToken}
            </code>
            <p className="mt-1 text-[12px] text-amber-900/80">
              Valid for 7 days. Pick one method, deploy the token, then click "Check now".
            </p>
          </div>

          <Method
            title="Method 1: meta tag"
            blurb="Paste in your site's <head>. Easiest for sites you control the HTML for."
            code={`<meta name="answerfox-verify" content="${effectiveToken}">`}
          />
          <Method
            title="Method 2: file at /.well-known/answerfox-verify"
            blurb="Serve a plain text file with the token as the body. Next.js: drop the file under public/.well-known/."
            code={`# /.well-known/answerfox-verify\n${effectiveToken}`}
          />
          <Method
            title="Method 3: DNS TXT record"
            blurb="Add a TXT record to your domain. Slower (DNS propagation), but doesn't touch your code."
            code={`Name:  @\nType:  TXT\nValue: answerfox-verify=${effectiveToken}`}
          />

          <form action={checkAction}>
            <button type="submit" disabled={checkPending} className="btn btn-solid">
              {checkPending ? 'Checking all three methods...' : 'Check now'}
            </button>
          </form>

          {checkState.status === 'failed' && checkState.attempts !== undefined ? (
            <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3">
              <p className="font-semibold text-red-900">Token not found yet.</p>
              <ul className="mt-2 space-y-1 text-[13px] text-red-900/90">
                {checkState.attempts.map((a) => (
                  <li key={a.method}>
                    <span className="font-mono">{a.method}</span>: {a.detail}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-red-900/80">
                If you just deployed, give it 1-2 minutes for caches/DNS to propagate and try again.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Method({
  title,
  blurb,
  code,
}: {
  readonly title: string;
  readonly blurb: string;
  readonly code: string;
}) {
  return (
    <div>
      <p className="font-semibold text-amber-950">{title}</p>
      <p className="mt-1 text-[13px] text-amber-950/85">{blurb}</p>
      <pre className="mt-2 overflow-x-auto rounded-lg border border-amber-300 bg-white px-3 py-2 font-mono text-[12.5px] leading-relaxed">
        {code}
      </pre>
    </div>
  );
}
