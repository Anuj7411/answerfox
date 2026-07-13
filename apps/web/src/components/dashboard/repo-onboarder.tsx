'use client';

import {
  type ConnectableReposState,
  type OnboardRepoState,
  listConnectableReposAction,
  onboardRepoAction,
} from '@/app/(dashboard)/dashboard/sites/new/onboard-actions';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
const installUrl = appSlug ? `https://github.com/apps/${appSlug}/installations/new` : null;

/**
 * Repo-picker onboarding: lists the repos the Answerfox App installation
 * grants, then creates + links + audits the chosen one in a single
 * action. This is the UI the onboarding orchestrator was built to sit
 * behind ("install to audited site").
 */
export function RepoOnboarder() {
  const router = useRouter();
  const [repoState, setRepoState] = useState<ConnectableReposState | null>(null);
  const [onboardState, setOnboardState] = useState<OnboardRepoState>({ status: 'idle' });
  const [selected, setSelected] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [siteName, setSiteName] = useState('');
  const [loadingRepos, startLoad] = useTransition();
  const [onboarding, startOnboard] = useTransition();

  function loadRepos() {
    startLoad(async () => setRepoState(await listConnectableReposAction()));
  }

  function onPick(fullName: string) {
    setSelected(fullName);
    // Prefill the site name with the repo's short name for convenience.
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
      if (res.status === 'onboarded') router.push(`/dashboard/sites/${res.siteId}`);
    });
  }

  if (repoState === null) {
    return (
      <button
        type="button"
        onClick={loadRepos}
        disabled={loadingRepos}
        className="mt-4 rounded-md border border-ember/40 bg-ember/10 px-3 py-1.5 text-[13px] font-medium hover:bg-ember/20 disabled:opacity-60"
      >
        {loadingRepos ? 'Loading your repos...' : 'Load my repos'}
      </button>
    );
  }

  if (repoState.status === 'no-github' || repoState.status === 'error') {
    return <Notice tone="amber" title="Cannot list repos" body={reason(repoState)} />;
  }

  if (repoState.status === 'no-installation') {
    return (
      <div className="mt-4">
        <Notice tone="amber" title="No installation found" body={repoState.reason} />
        {installUrl ? (
          <a
            href={installUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex rounded-md border border-ink/15 bg-white/60 px-3 py-1.5 text-[13px] font-mono hover:border-ember/40 hover:bg-white"
          >
            Install the Answerfox App
          </a>
        ) : null}
      </div>
    );
  }

  if (repoState.repos.length === 0) {
    return (
      <Notice
        tone="amber"
        title="No repos granted"
        body="Your installation does not grant access to any repos yet. Add one to the App's repo access, then reload."
      />
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <label className="block">
        <span className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">Repo</span>
        <select
          value={selected}
          onChange={(e) => onPick(e.target.value)}
          className="mt-1 w-full rounded-md border border-ink/15 bg-white/70 px-3 py-2 font-mono text-[13px]"
        >
          <option value="">Select a repo...</option>
          {repoState.repos.map((r) => (
            <option key={r.repoId} value={r.fullName}>
              {r.fullName}
              {r.private ? ' (private)' : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
          Site URL
        </span>
        <input
          type="url"
          required
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          placeholder="https://your-site.com"
          className="mt-1 w-full rounded-md border border-ink/15 bg-white/70 px-3 py-2 font-mono text-[13px]"
        />
      </label>

      <label className="block">
        <span className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
          Site name
        </span>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="My site"
          className="mt-1 w-full rounded-md border border-ink/15 bg-white/70 px-3 py-2 font-mono text-[13px]"
        />
      </label>

      <button
        type="submit"
        disabled={onboarding || selected.length === 0}
        className="rounded-md border border-ember/40 bg-ember/10 px-3 py-1.5 text-[13px] font-medium hover:bg-ember/20 disabled:opacity-60"
      >
        {onboarding ? 'Onboarding + running first audit...' : 'Connect + audit'}
      </button>

      {onboardState.status === 'error' ? (
        <Notice tone="red" title="Onboarding failed" body={onboardState.error} />
      ) : null}
      {onboardState.status === 'onboarded' && onboardState.alreadyLinked ? (
        <Notice
          tone="amber"
          title="Already connected"
          body="That repo is already linked to a site. Taking you there."
        />
      ) : null}
    </form>
  );
}

function reason(state: ConnectableReposState): string {
  if (state.status === 'error') return state.error;
  if (state.status === 'no-github') return state.reason;
  return '';
}

function Notice({
  tone,
  title,
  body,
}: {
  readonly tone: 'amber' | 'red';
  readonly title: string;
  readonly body: string;
}) {
  const styles =
    tone === 'red' ? 'border-red-300 bg-red-50 text-red-900' : 'border-amber-300 bg-amber-50 text-amber-950';
  return (
    <div className={`mt-4 rounded-md border p-3 ${styles}`}>
      <p className="text-[13px] font-semibold">{title}</p>
      <p className="mt-1 font-mono text-[12px] opacity-90">{body}</p>
    </div>
  );
}
