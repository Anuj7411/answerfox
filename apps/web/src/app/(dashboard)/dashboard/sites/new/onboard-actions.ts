'use server';

import { getActiveInstallationForLogin } from '@/lib/db/queries/github-installations';
import { getInstallationClient } from '@/lib/github/app-client';
import { type InstalledRepo, listInstalledRepos } from '@/lib/github/list-installed-repos';
import { resolveGithubLogin } from '@/lib/github/resolve-github-login';
import { onboardSiteFromRepo } from '@/lib/onboarding/onboard-site';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';

/**
 * Server actions behind the onboarding repo-picker. They resolve the
 * signed-in user's GitHub identity to their App installation, list the
 * repos it grants, and onboard a chosen repo (create + link + audit)
 * through the existing `onboardSiteFromRepo` orchestrator. This is the
 * caller that engine was built for but never had.
 */

export type ConnectableReposState =
  | { readonly status: 'no-github'; readonly reason: string }
  | { readonly status: 'no-installation'; readonly reason: string }
  | { readonly status: 'ready'; readonly repos: readonly InstalledRepo[] }
  | { readonly status: 'error'; readonly error: string };

export async function listConnectableReposAction(): Promise<ConnectableReposState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const login = resolveGithubLogin(user);
  if (login === null) {
    return { status: 'no-github', reason: 'Sign in with GitHub to connect a repo.' };
  }

  const installation = await getActiveInstallationForLogin(login);
  if (installation === null) {
    return {
      status: 'no-installation',
      reason: 'Install the Answerfox GitHub App on your account to connect a repo.',
    };
  }

  try {
    const client = await getInstallationClient(installation.installationId);
    const repos = await listInstalledRepos(client);
    return { status: 'ready', repos };
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : 'Could not list your repositories.',
    };
  }
}

export type OnboardRepoState =
  | { readonly status: 'idle' }
  | {
      readonly status: 'onboarded';
      readonly siteId: string;
      readonly auditScore: number;
      readonly alreadyLinked: boolean;
    }
  | { readonly status: 'error'; readonly error: string };

export async function onboardRepoAction(input: {
  readonly repoFullName: string;
  readonly siteUrl: string;
  readonly siteName: string;
}): Promise<OnboardRepoState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'error', error: 'Sign in to onboard a repo.' };

  const login = resolveGithubLogin(user);
  if (login === null) return { status: 'error', error: 'Sign in with GitHub to connect a repo.' };

  const installation = await getActiveInstallationForLogin(login);
  if (installation === null) {
    return { status: 'error', error: 'No live Answerfox App installation found for your account.' };
  }

  try {
    // Verify the repo is actually granted by this installation before
    // onboarding, so a forged form value cannot link a repo the user's
    // install does not cover.
    const client = await getInstallationClient(installation.installationId);
    const repos = await listInstalledRepos(client);
    if (!repos.some((r) => r.fullName === input.repoFullName)) {
      return { status: 'error', error: 'That repo is not covered by your App installation.' };
    }

    const result = await onboardSiteFromRepo({
      userId: user.id,
      installationId: installation.installationId,
      repoFullName: input.repoFullName,
      siteUrl: input.siteUrl,
      siteName: input.siteName,
    });

    return {
      status: 'onboarded',
      siteId: result.site.id,
      auditScore: result.auditScore,
      alreadyLinked: result.alreadyLinked,
    };
  } catch (err) {
    return {
      status: 'error',
      error: err instanceof Error ? err.message : 'Onboarding failed.',
    };
  }
}
