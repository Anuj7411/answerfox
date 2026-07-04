import 'server-only';
import { getDb } from '@/lib/db/client';
import { githubInstallations, githubRepositories } from '@/lib/db/schema/github-installations';
import type { WebhookAction } from '@/lib/github/webhook-events';
import { eq, inArray } from 'drizzle-orm';

/**
 * Apply one webhook action to the database. The route calls this in a
 * loop over whatever `mapWebhookToActions` produced. Every branch is
 * idempotent — GitHub redelivers webhooks, so running the same action
 * twice must land in the same state.
 */
export async function applyWebhookAction(action: WebhookAction): Promise<void> {
  const db = getDb();

  switch (action.kind) {
    case 'upsert-installation': {
      await db
        .insert(githubInstallations)
        .values({
          installationId: action.installationId,
          accountLogin: action.accountLogin,
          accountId: action.accountId,
          accountType: action.accountType,
          repositorySelection: action.repositorySelection,
        })
        .onConflictDoUpdate({
          target: githubInstallations.installationId,
          set: {
            accountLogin: action.accountLogin,
            accountId: action.accountId,
            accountType: action.accountType,
            repositorySelection: action.repositorySelection,
            // A re-install after uninstall revives the same row.
            deletedAt: null,
            suspendedAt: null,
          },
        });
      return;
    }

    case 'mark-installation-deleted': {
      await db
        .update(githubInstallations)
        .set({ deletedAt: new Date() })
        .where(eq(githubInstallations.installationId, action.installationId));
      return;
    }

    case 'set-installation-suspended': {
      await db
        .update(githubInstallations)
        .set({ suspendedAt: action.suspended ? new Date() : null })
        .where(eq(githubInstallations.installationId, action.installationId));
      return;
    }

    case 'upsert-repositories': {
      for (const repo of action.repos) {
        await db
          .insert(githubRepositories)
          .values({
            installationId: action.installationId,
            repoId: repo.repoId,
            fullName: repo.fullName,
            private: repo.private,
          })
          .onConflictDoUpdate({
            target: githubRepositories.repoId,
            set: {
              installationId: action.installationId,
              fullName: repo.fullName,
              private: repo.private,
              removedAt: null,
            },
          });
      }
      return;
    }

    case 'mark-repositories-removed': {
      if (action.repoIds.length === 0) return;
      await db
        .update(githubRepositories)
        .set({ removedAt: new Date() })
        .where(inArray(githubRepositories.repoId, [...action.repoIds]));
      return;
    }
  }
}
