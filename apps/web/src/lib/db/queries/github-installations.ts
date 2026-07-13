import 'server-only';
import { getDb } from '@/lib/db/client';
import { githubInstallations } from '@/lib/db/schema/github-installations';
import { and, eq, isNull } from 'drizzle-orm';

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
