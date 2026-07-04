/**
 * Pure mapping from a GitHub webhook (event name + parsed payload) to
 * the actions AnswerFox should take. No I/O here — the route applies
 * the returned actions against the DB and the Inngest queue. Keeping
 * this pure means every event shape is unit-testable without HTTP,
 * Postgres, or GitHub.
 *
 * Week-1 scope: the installation handshake. Later weeks add mappings
 * for `pull_request` (proof-of-fix, week 3) and `deployment_status` /
 * `push` (drift guard, week 6) — as new action kinds, not new routes.
 */

export interface RepoRef {
  readonly repoId: number;
  readonly fullName: string;
  readonly private: boolean;
}

export type WebhookAction =
  | {
      readonly kind: 'upsert-installation';
      readonly installationId: number;
      readonly accountLogin: string;
      readonly accountId: number;
      readonly accountType: string;
      readonly repositorySelection: string;
    }
  | { readonly kind: 'mark-installation-deleted'; readonly installationId: number }
  | {
      readonly kind: 'set-installation-suspended';
      readonly installationId: number;
      readonly suspended: boolean;
    }
  | {
      readonly kind: 'upsert-repositories';
      readonly installationId: number;
      readonly repos: readonly RepoRef[];
    }
  | {
      readonly kind: 'mark-repositories-removed';
      readonly installationId: number;
      readonly repoIds: readonly number[];
    };

interface RawAccount {
  login?: unknown;
  id?: unknown;
  type?: unknown;
}

interface RawRepo {
  id?: unknown;
  full_name?: unknown;
  private?: unknown;
}

interface RawInstallationPayload {
  action?: unknown;
  installation?: {
    id?: unknown;
    account?: RawAccount;
    repository_selection?: unknown;
  };
  repositories?: RawRepo[];
  repositories_added?: RawRepo[];
  repositories_removed?: RawRepo[];
}

function toRepoRefs(raw: RawRepo[] | undefined): RepoRef[] {
  if (!Array.isArray(raw)) return [];
  const refs: RepoRef[] = [];
  for (const r of raw) {
    if (typeof r.id === 'number' && typeof r.full_name === 'string') {
      refs.push({ repoId: r.id, fullName: r.full_name, private: r.private === true });
    }
  }
  return refs;
}

/**
 * Map one webhook delivery to zero or more actions. Unknown events and
 * malformed payloads map to `[]` — the route ACKs them with 202 so
 * GitHub never retries events we simply don't care about.
 */
export function mapWebhookToActions(eventName: string, payload: unknown): WebhookAction[] {
  if (typeof payload !== 'object' || payload === null) return [];
  const p = payload as RawInstallationPayload;

  const installationId = p.installation?.id;
  if (typeof installationId !== 'number') return [];

  if (eventName === 'installation') {
    const account = p.installation?.account ?? {};
    const base = {
      installationId,
      accountLogin: typeof account.login === 'string' ? account.login : '',
      accountId: typeof account.id === 'number' ? account.id : 0,
      accountType: typeof account.type === 'string' ? account.type : 'User',
      repositorySelection:
        typeof p.installation?.repository_selection === 'string'
          ? p.installation.repository_selection
          : 'selected',
    };

    switch (p.action) {
      case 'created': {
        const actions: WebhookAction[] = [{ kind: 'upsert-installation', ...base }];
        const repos = toRepoRefs(p.repositories);
        if (repos.length > 0) {
          actions.push({ kind: 'upsert-repositories', installationId, repos });
        }
        return actions;
      }
      case 'deleted':
        return [{ kind: 'mark-installation-deleted', installationId }];
      case 'suspend':
        return [{ kind: 'set-installation-suspended', installationId, suspended: true }];
      case 'unsuspend':
        return [{ kind: 'set-installation-suspended', installationId, suspended: false }];
      default:
        return [];
    }
  }

  if (eventName === 'installation_repositories') {
    const actions: WebhookAction[] = [];
    const added = toRepoRefs(p.repositories_added);
    if (added.length > 0) {
      actions.push({ kind: 'upsert-repositories', installationId, repos: added });
    }
    const removed = toRepoRefs(p.repositories_removed);
    if (removed.length > 0) {
      actions.push({
        kind: 'mark-repositories-removed',
        installationId,
        repoIds: removed.map((r) => r.repoId),
      });
    }
    return actions;
  }

  return [];
}
