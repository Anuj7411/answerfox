import { describe, expect, it } from 'vitest';
import { mapWebhookToActions } from './webhook-events';

const account = { login: 'acme', id: 42, type: 'Organization' };
const installation = { id: 777, account, repository_selection: 'selected' };

describe('mapWebhookToActions', () => {
  it('maps installation.created to an upsert plus its repositories', () => {
    const actions = mapWebhookToActions('installation', {
      action: 'created',
      installation,
      repositories: [
        { id: 1, full_name: 'acme/docs', private: false },
        { id: 2, full_name: 'acme/api', private: true },
      ],
    });
    expect(actions).toEqual([
      {
        kind: 'upsert-installation',
        installationId: 777,
        accountLogin: 'acme',
        accountId: 42,
        accountType: 'Organization',
        repositorySelection: 'selected',
      },
      {
        kind: 'upsert-repositories',
        installationId: 777,
        repos: [
          { repoId: 1, fullName: 'acme/docs', private: false },
          { repoId: 2, fullName: 'acme/api', private: true },
        ],
      },
    ]);
  });

  it('maps installation.created with no repositories to just the upsert', () => {
    const actions = mapWebhookToActions('installation', { action: 'created', installation });
    expect(actions).toHaveLength(1);
    expect(actions[0]?.kind).toBe('upsert-installation');
  });

  it('maps installation.deleted to a soft delete', () => {
    expect(mapWebhookToActions('installation', { action: 'deleted', installation })).toEqual([
      { kind: 'mark-installation-deleted', installationId: 777 },
    ]);
  });

  it('maps suspend and unsuspend to the suspended flag', () => {
    expect(mapWebhookToActions('installation', { action: 'suspend', installation })).toEqual([
      { kind: 'set-installation-suspended', installationId: 777, suspended: true },
    ]);
    expect(mapWebhookToActions('installation', { action: 'unsuspend', installation })).toEqual([
      { kind: 'set-installation-suspended', installationId: 777, suspended: false },
    ]);
  });

  it('maps installation_repositories added and removed in one delivery', () => {
    const actions = mapWebhookToActions('installation_repositories', {
      action: 'added',
      installation,
      repositories_added: [{ id: 3, full_name: 'acme/blog', private: false }],
      repositories_removed: [{ id: 1, full_name: 'acme/docs', private: false }],
    });
    expect(actions).toEqual([
      {
        kind: 'upsert-repositories',
        installationId: 777,
        repos: [{ repoId: 3, fullName: 'acme/blog', private: false }],
      },
      { kind: 'mark-repositories-removed', installationId: 777, repoIds: [1] },
    ]);
  });

  it('ignores unknown events, unknown actions, and malformed payloads', () => {
    expect(mapWebhookToActions('push', { installation })).toEqual([]);
    expect(
      mapWebhookToActions('installation', { action: 'new_permissions_accepted', installation }),
    ).toEqual([]);
    expect(mapWebhookToActions('installation', { action: 'created' })).toEqual([]);
    expect(mapWebhookToActions('installation', null)).toEqual([]);
    expect(mapWebhookToActions('installation', 'garbage')).toEqual([]);
  });

  it('skips malformed repository entries instead of failing the delivery', () => {
    const actions = mapWebhookToActions('installation', {
      action: 'created',
      installation,
      repositories: [
        { id: 'not-a-number', full_name: 'acme/bad' },
        { id: 9, full_name: 'acme/ok' },
      ],
    });
    expect(actions[1]).toEqual({
      kind: 'upsert-repositories',
      installationId: 777,
      repos: [{ repoId: 9, fullName: 'acme/ok', private: false }],
    });
  });
});
