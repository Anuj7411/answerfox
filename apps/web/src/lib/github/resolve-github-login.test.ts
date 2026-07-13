import { describe, expect, it } from 'vitest';
import { resolveGithubLogin } from './resolve-github-login';

describe('resolveGithubLogin', () => {
  it('reads user_name first (Supabase GitHub provider default)', () => {
    expect(resolveGithubLogin({ user_metadata: { user_name: 'octocat' } })).toBe('octocat');
  });

  it('falls back to preferred_username, then login', () => {
    expect(resolveGithubLogin({ user_metadata: { preferred_username: 'octo' } })).toBe('octo');
    expect(resolveGithubLogin({ user_metadata: { login: 'octo2' } })).toBe('octo2');
  });

  it('prefers user_name over the fallbacks', () => {
    expect(
      resolveGithubLogin({ user_metadata: { user_name: 'first', login: 'second' } }),
    ).toBe('first');
  });

  it('returns null for a session with no GitHub identity', () => {
    expect(resolveGithubLogin(null)).toBeNull();
    expect(resolveGithubLogin({ user_metadata: null })).toBeNull();
    expect(resolveGithubLogin({ user_metadata: {} })).toBeNull();
    expect(resolveGithubLogin({})).toBeNull();
  });

  it('ignores non-string or empty values', () => {
    expect(resolveGithubLogin({ user_metadata: { user_name: 123 } })).toBeNull();
    expect(resolveGithubLogin({ user_metadata: { user_name: '' } })).toBeNull();
  });
});
