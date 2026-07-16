'use client';

import {
  type ConnectableReposState,
  type OnboardRepoState,
  listConnectableReposAction,
  onboardRepoAction,
} from '@/app/(dashboard)/dashboard/sites/new/onboard-actions';
import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useTransition } from 'react';

const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';

type Phase = 'loading' | 'install' | 'pick' | 'running' | 'done' | 'error';

const STEP_LABELS = ['Install', 'Pick repo', 'First audit', 'Done'] as const;

function phaseToStep(phase: Phase): number {
  switch (phase) {
    case 'loading':
    case 'install':
      return 1;
    case 'pick':
      return 2;
    case 'running':
      return 3;
    case 'done':
      return 4;
    default:
      return 1;
  }
}

function scoreBand(score: number): { readonly label: string; readonly color: string } {
  if (score >= 80) return { label: 'excellent', color: PC.green };
  if (score >= 65) return { label: 'strong', color: PC.green };
  if (score >= 50) return { label: 'average', color: PC.amber };
  return { label: 'needs work', color: PC.red };
}

export function OnboardingFlow({ installUrl }: { installUrl: string }) {
  const router = useRouter();
  const [repoState, setRepoState] = useState<ConnectableReposState | null>(null);
  const [onboardState, setOnboardState] = useState<OnboardRepoState>({ status: 'idle' });
  const [selected, setSelected] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [filter, setFilter] = useState('');
  const [loadingRepos, startLoad] = useTransition();
  const [onboarding, startOnboard] = useTransition();
  const didLoad = useRef(false);

  function loadRepos() {
    startLoad(async () => setRepoState(await listConnectableReposAction()));
  }

  // Kick off the GitHub check once on mount so the wizard lands on the
  // right step without a manual "load" click.
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount; the didLoad ref guards re-runs.
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    loadRepos();
  }, []);

  const phase: Phase = useMemo(() => {
    if (onboardState.status === 'onboarded') return 'done';
    if (onboarding) return 'running';
    if (repoState === null || loadingRepos) return 'loading';
    if (repoState.status === 'ready') return 'pick';
    if (repoState.status === 'error') return 'error';
    return 'install';
  }, [onboardState, onboarding, repoState, loadingRepos]);

  const repos = repoState !== null && repoState.status === 'ready' ? repoState.repos : [];
  const visibleRepos = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q.length === 0 ? repos : repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, filter]);

  function onPick(fullName: string) {
    setSelected(fullName);
    if (siteName.length === 0) setSiteName(fullName.split('/').at(-1) ?? fullName);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0 || siteUrl.length === 0) return;
    startOnboard(async () => {
      const res = await onboardRepoAction({
        repoFullName: selected,
        siteUrl,
        siteName: siteName.length > 0 ? siteName : selected,
      });
      setOnboardState(res);
    });
  }

  const currentStep = phaseToStep(phase);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
      }}
    >
      {/* STEP INDICATOR */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          rowGap: 8,
        }}
      >
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const done = n < currentStep;
          const current = n === currentStep;
          return (
            <div key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <StepDot n={n} done={done} current={current} />
              <span
                style={{
                  fontFamily: BODY,
                  fontSize: 12.5,
                  fontWeight: current ? 600 : 500,
                  color: current ? PC.ink : done ? PC.muted : PC.dim,
                }}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <span style={{ width: 20, height: 1, background: PC.faint, margin: '0 10px' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* STEP CARD */}
      <div
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 12,
          padding: '26px 26px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          boxShadow: '0 1px 2px rgba(28,28,25,.03)',
        }}
      >
        {phase === 'loading' && <LoadingBody />}
        {phase === 'install' && (
          <InstallBody
            installUrl={installUrl}
            reason={repoState !== null && 'reason' in repoState ? repoState.reason : undefined}
            onRecheck={loadRepos}
            rechecking={loadingRepos}
          />
        )}
        {phase === 'error' && (
          <ErrorBody
            message={
              repoState !== null && repoState.status === 'error'
                ? repoState.error
                : 'Something went wrong.'
            }
            onRetry={loadRepos}
          />
        )}
        {phase === 'pick' && (
          <PickBody
            repos={visibleRepos}
            totalRepos={repos.length}
            selected={selected}
            onPick={onPick}
            filter={filter}
            setFilter={setFilter}
            siteUrl={siteUrl}
            setSiteUrl={setSiteUrl}
            siteName={siteName}
            setSiteName={setSiteName}
            onSubmit={submit}
            submitting={onboarding}
            error={onboardState.status === 'error' ? onboardState.error : null}
          />
        )}
        {phase === 'running' && <RunningBody siteUrl={siteUrl} />}
        {phase === 'done' && onboardState.status === 'onboarded' && (
          <DoneBody
            siteId={onboardState.siteId}
            score={onboardState.auditScore}
            alreadyLinked={onboardState.alreadyLinked}
            siteName={siteName.length > 0 ? siteName : selected}
            onDashboard={() => router.push(`/dashboard/sites/${onboardState.siteId}`)}
          />
        )}
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
          Step {currentStep} of 4
        </span>
        {phase === 'pick' && (
          <button type="button" onClick={loadRepos} style={linkBtn}>
            Reload repos
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   STEP BODIES
   ============================================================ */

function LoadingBody() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
      <Spinner />
      <span style={{ fontSize: 14, color: PC.muted }}>Checking your GitHub connection…</span>
    </div>
  );
}

function InstallBody({
  installUrl,
  reason,
  onRecheck,
  rechecking,
}: {
  installUrl: string;
  reason?: string;
  onRecheck: () => void;
  rechecking: boolean;
}) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={heading}>Connect Answerfox to GitHub</span>
        <span style={{ fontSize: 14, color: PC.muted }}>
          {reason ??
            'Answerfox reads your repos and opens fix-PRs as code. It runs through the GitHub App.'}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          padding: 14,
          border: `1px solid ${FOOT_LINE}`,
          borderRadius: 10,
          background: FOOT_BG,
        }}
      >
        <PermRow label="Contents: read & write" why="so we can open a branch with the fix." />
        <PermRow label="Pull requests: read & write" why="so the fix arrives as a PR you review." />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
        That's it. No access to your secrets, actions, or other settings.
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <a href={installUrl} style={primaryBtn}>
          <GithubMark fill="#FAFAF8" />
          Install the GitHub App
        </a>
        <button type="button" onClick={onRecheck} disabled={rechecking} style={linkBtn}>
          {rechecking ? 'Checking…' : "I've installed it — check again"}
        </button>
      </div>
    </>
  );
}

function ErrorBody({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={heading}>Couldn't reach GitHub</span>
        <span style={{ fontSize: 14, color: PC.muted }}>{message}</span>
      </div>
      <button type="button" onClick={onRetry} style={{ ...primaryBtn, alignSelf: 'flex-start' }}>
        Try again
      </button>
    </>
  );
}

function PickBody({
  repos,
  totalRepos,
  selected,
  onPick,
  filter,
  setFilter,
  siteUrl,
  setSiteUrl,
  siteName,
  setSiteName,
  onSubmit,
  submitting,
  error,
}: {
  repos: readonly {
    readonly repoId: number;
    readonly fullName: string;
    readonly private: boolean;
    readonly defaultBranch: string;
  }[];
  totalRepos: number;
  selected: string;
  onPick: (fullName: string) => void;
  filter: string;
  setFilter: (v: string) => void;
  siteUrl: string;
  setSiteUrl: (v: string) => void;
  siteName: string;
  setSiteName: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={heading}>Pick a repo to audit</span>
        <span style={{ fontSize: 14, color: PC.muted }}>
          These are the repos the App can see. Choose the one whose docs you want AI to read
          correctly.
        </span>
      </div>

      {totalRepos === 0 ? (
        <div style={{ fontSize: 13.5, color: PC.muted, padding: '10px 0' }}>
          Your installation doesn't grant access to any repos yet. Add one to the App's repo access
          on GitHub, then Reload repos.
        </div>
      ) : (
        <>
          {/* filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              height: 36,
              padding: '0 12px',
              border: `1px solid ${PC.faint}`,
              borderRadius: 8,
              background: PC.card,
            }}
          >
            <SearchIcon />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter repositories…"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13,
                color: PC.ink,
              }}
            />
          </div>

          {/* repo list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              maxHeight: 240,
              overflow: 'auto',
            }}
          >
            {repos.map((r) => {
              const on = r.fullName === selected;
              return (
                <button
                  type="button"
                  key={r.repoId}
                  onClick={() => onPick(r.fullName)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 11,
                    padding: '11px 12px',
                    border: `1px solid ${on ? PC.ink : PC.line}`,
                    background: on ? FOOT_BG : PC.card,
                    borderRadius: 8,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  <RepoIcon />
                  <span
                    style={{
                      flex: '1 1 auto',
                      minWidth: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>
                      {r.fullName}
                    </span>
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 10.5,
                        letterSpacing: '.04em',
                        textTransform: 'uppercase',
                        color: PC.muted,
                        border: `1px solid ${PC.line}`,
                        background: PC.hover,
                        borderRadius: 5,
                        padding: '2px 7px',
                      }}
                    >
                      {r.private ? 'private' : 'public'}
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
                      {r.defaultBranch}
                    </span>
                  </span>
                  <span
                    style={{
                      flex: '0 0 auto',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: `1.5px solid ${on ? PC.ink : '#C4C3BC'}`,
                      background: PC.card,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {on && (
                      <span
                        style={{ width: 9, height: 9, borderRadius: '50%', background: PC.ink }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
            {repos.length === 0 && (
              <span style={{ fontSize: 13, color: PC.dim, padding: '8px 2px' }}>
                No repos match “{filter}”.
              </span>
            )}
          </div>

          {/* site url + name — required by the audit (targets the live site, not the repo) */}
          {selected.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={fieldLabel}>Site URL to audit</span>
                <input
                  type="url"
                  required
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://your-site.com"
                  style={fieldInput}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={fieldLabel}>Site name</span>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="My site"
                  style={fieldInput}
                />
              </label>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.dim }}>
              {selected.length > 0 ? `selected: ${selected}` : 'select a repo'}
            </span>
            <button
              type="submit"
              disabled={submitting || selected.length === 0 || siteUrl.length === 0}
              style={{
                ...primaryBtn,
                height: 38,
                fontSize: 13,
                opacity: submitting || selected.length === 0 || siteUrl.length === 0 ? 0.5 : 1,
                cursor:
                  submitting || selected.length === 0 || siteUrl.length === 0
                    ? 'not-allowed'
                    : 'pointer',
                border: 'none',
              }}
            >
              {submitting ? 'Auditing…' : 'Audit this repo'}
              {!submitting && <ArrowIcon />}
            </button>
          </div>
        </>
      )}

      {error !== null && (
        <div
          style={{
            padding: '10px 12px',
            border: `1px solid ${PC.redWash}`,
            background: PC.redWash,
            borderRadius: 8,
            fontSize: 13,
            color: PC.red,
          }}
        >
          {error}
        </div>
      )}
    </form>
  );
}

function RunningBody({ siteUrl }: { siteUrl: string }) {
  const host = safeHost(siteUrl);
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={heading}>Auditing {host}…</span>
        <span style={{ fontSize: 14, color: PC.muted }}>
          Creating the site, linking the repo, and fetching your pages exactly as an AI crawler
          would. This can take a moment.
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 4,
          borderRadius: 999,
          background: FOOT_LINE,
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '35%',
            height: '100%',
            borderRadius: 999,
            background: PC.blaze,
            animation: 'afxBar 1.4s ease-in-out infinite',
          }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <Spinner />
        <span style={{ fontSize: 13.5, color: PC.ink }}>Running the 53-check audit…</span>
      </div>
      <style>
        {
          '@keyframes afxBar{0%{transform:translateX(-40%)}100%{transform:translateX(140%)}}@keyframes afxSpin{to{transform:rotate(360deg)}}'
        }
      </style>
    </>
  );
}

function DoneBody({
  siteId,
  score,
  alreadyLinked,
  siteName,
  onDashboard,
}: {
  siteId: string;
  score: number;
  alreadyLinked: boolean;
  siteName: string;
  onDashboard: () => void;
}) {
  const band = scoreBand(score);
  const R = 26;
  const C = 2 * Math.PI * R;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            flex: '0 0 auto',
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: PC.greenWash,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={PC.green}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
            aria-label="Done"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={heading}>You're in.</span>
          <span style={{ fontSize: 14, color: PC.muted }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: PC.ink }}>{siteName}</span> is now
            being watched.
          </span>
        </div>
      </div>

      {alreadyLinked && (
        <div style={{ fontFamily: MONO, fontSize: 12, color: PC.amber }}>
          That repo was already linked — we took you to the existing site's latest audit.
        </div>
      )}

      {/* score */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: 14,
          border: `1px solid ${PC.line}`,
          background: FOOT_BG,
          borderRadius: 10,
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          style={{ transform: 'rotate(-90deg)' }}
          role="img"
          aria-label={`Score ${score}`}
        >
          <circle cx="36" cy="36" r={R} fill="none" stroke={FOOT_LINE} strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={R}
            fill="none"
            stroke={band.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - Math.max(0, Math.min(100, score)) / 100)}
          />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span
            style={{
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 26,
              color: PC.ink,
              lineHeight: 1,
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.05em',
              textTransform: 'uppercase',
              color: band.color,
            }}
          >
            {band.label}
          </span>
        </div>
        <span style={{ width: 1, alignSelf: 'stretch', background: PC.line }} />
        <span style={{ fontSize: 13, color: PC.muted, flex: 1 }}>
          Your first audit is done. Open the findings to see what to fix — private repos get one
          free fix-to-proof loop.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <a href={`/dashboard/sites/${siteId}/findings`} style={primaryBtn}>
          See your findings
          <ArrowIcon />
        </a>
        <button type="button" onClick={onDashboard} style={linkBtn}>
          Go to the site
        </button>
      </div>
    </>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */

const heading = {
  fontFamily: BODY,
  fontWeight: 600,
  fontSize: 20,
  letterSpacing: '-.01em',
  color: PC.ink,
} as const;

const fieldLabel = {
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: '.06em',
  textTransform: 'uppercase' as const,
  color: PC.dim,
};

const fieldInput = {
  height: 38,
  padding: '0 12px',
  border: `1px solid ${PC.faint}`,
  borderRadius: 8,
  background: PC.card,
  fontFamily: MONO,
  fontSize: 13,
  color: PC.ink,
  outline: 'none',
} as const;

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 16px',
  height: 40,
  background: PC.ink,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 13.5,
  fontWeight: 500,
  color: '#FAFAF8',
  textDecoration: 'none',
  border: 'none',
  whiteSpace: 'nowrap' as const,
} as const;

const linkBtn = {
  fontFamily: BODY,
  fontSize: 12.5,
  color: PC.dim,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
} as const;

function StepDot({ n, done, current }: { n: number; done: boolean; current: boolean }) {
  if (done) {
    return (
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: PC.ink,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FAFAF8"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="done"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    );
  }
  if (current) {
    return (
      <span style={{ position: 'relative', width: 20, height: 20, flex: '0 0 auto' }}>
        <span
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: PC.blaze,
            opacity: 0.18,
          }}
        />
        <span
          style={{ position: 'absolute', inset: 5, borderRadius: '50%', background: PC.blaze }}
        />
      </span>
    );
  }
  return (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: PC.card,
        border: `1.5px solid ${PC.faint}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto',
        fontFamily: MONO,
        fontSize: 10,
        color: PC.dim,
      }}
    >
      {n}
    </span>
  );
}

function PermRow({ label, why }: { label: string; why: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          flex: '0 0 auto',
          width: 28,
          height: 28,
          borderRadius: 8,
          background: PC.hover,
          border: `1px solid ${PC.line}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={PC.muted}
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="permission"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.ink, fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: 13, color: PC.muted }}>{why}</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        flex: '0 0 auto',
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: `2px solid ${PC.line}`,
        borderTopColor: PC.blaze,
        animation: 'afxSpin 0.8s linear infinite',
        display: 'inline-block',
      }}
    >
      <style>{'@keyframes afxSpin{to{transform:rotate(360deg)}}'}</style>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.dim}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Search"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function RepoIcon() {
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
      style={{ flex: '0 0 auto' }}
      role="img"
      aria-label="Repository"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function ArrowIcon() {
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
      aria-label="next"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function GithubMark({ fill = PC.ink }: { fill?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={fill}
      stroke="none"
      role="img"
      aria-label="GitHub"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}

function safeHost(url: string): string {
  try {
    return new URL(url).host || url;
  } catch {
    return url.length > 0 ? url : 'your site';
  }
}
