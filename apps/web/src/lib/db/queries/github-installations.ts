import 'server-only';
import { getDb } from '@/lib/db/client';
import { githubInstallations, githubRepositories } from '@/lib/db/schema/github-installations';
import { and, asc, eq, isNull } from 'drizzle-orm';

export interface ActiveInstallation {
  readonly installationId: number;
  readonly accountLogin: string;
}

/**
 * The live Answerfox App installation on a given GitHub account login,
 * or null if none. "Live" excludes uninstalled (`deletedAt`) and
 * suspended (`suspendedAt`) rows, so a user who removed the App cannot
 * onboard through a stale installation.
 *
 * Matches on `accountLogin` because that is the GitHub identity the
 * OAuth session already carries (`user_metadata.user_name`). This
 * resolves personal-account installs cleanly; org installs (where the
 * account is the org, not the signed-in user) are a follow-up.
 */
export async function getActiveInstallationForLogin(
  login: string,
): Promise<ActiveInstallation | null> {
  const [row] = await getDb()
    .select({
      installationId: githubInstallations.installationId,
      accountLogin: githubInstallations.accountLogin,
    })
    .from(githubInstallations)
    .where(
      and(
        eq(githubInstallations.accountLogin, login),
        isNull(githubInstallations.deletedAt),
        isNull(githubInstallations.suspendedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export interface InstallationRow {
  readonly installationId: number;
  readonly accountLogin: string;
  readonly accountType: string;
  readonly repositorySelection: string;
  readonly createdAt: Date;
}

/**
 * The full live installation row for a given GitHub installation id, or
 * null if none is live (uninstalled/suspended excluded). Used by the
 * Integrations view to render each installation card (account, type,
 * repo-selection scope, installed date) once the page has resolved which
 * installation ids are relevant to the signed-in user.
 */
export async function getInstallationByInstallationId(
  installationId: number,
): Promise<InstallationRow | null> {
  const [row] = await getDb()
    .select({
      installationId: githubInstallations.installationId,
      accountLogin: githubInstallations.accountLogin,
      accountType: githubInstallations.accountType,
      repositorySelection: githubInstallations.repositorySelection,
      createdAt: githubInstallations.createdAt,
    })
    .from(githubInstallations)
    .where(
      and(
        eq(githubInstallations.installationId, installationId),
        isNull(githubInstallations.deletedAt),
        isNull(githubInstallations.suspendedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export interface InstallationRepoRow {
  readonly repoId: number;
  readonly fullName: string;
  readonly private: boolean;
}

/**
 * Repositories an installation currently grants (the `github_repositories`
 * cache, filled by installation webhooks), ordered by name. Removed rows
 * (`removedAt`) are excluded so a repo dropped from the installation stops
 * showing. The cache can lag webhook delivery, so the Integrations view
 * unions this with the user's linked sites — a repo Answerfox already
 * watches always appears even if the cache has not caught up.
 */
export async function listActiveRepositoriesForInstallation(
  installationId: number,
): Promise<readonly InstallationRepoRow[]> {
  return getDb()
    .select({
      repoId: githubRepositories.repoId,
      fullName: githubRepositories.fullName,
      private: githubRepositories.private,
    })
    .from(githubRepositories)
    .where(
      and(
        eq(githubRepositories.installationId, installationId),
        isNull(githubRepositories.removedAt),
      ),
    )
    .orderBy(asc(githubRepositories.fullName));
}
