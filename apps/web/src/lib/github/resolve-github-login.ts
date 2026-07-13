/**
 * Pull the GitHub login out of a Supabase user's OAuth metadata.
 *
 * Supabase's GitHub provider stores the login under `user_name`, and
 * some flows also expose `preferred_username` / `login`. We check them
 * in that order and return the first non-empty string. Null means the
 * session has no usable GitHub identity (e.g. a non-GitHub sign-in),
 * which the caller reports rather than guessing an installation.
 *
 * Pure and dependency-free so it is unit-testable without a live
 * Supabase session.
 */
export interface UserWithMetadata {
  readonly user_metadata?: Record<string, unknown> | null;
}

export function resolveGithubLogin(user: UserWithMetadata | null): string | null {
  const meta = user?.user_metadata;
  if (meta === null || meta === undefined) return null;
  for (const key of ['user_name', 'preferred_username', 'login'] as const) {
    const value = meta[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return null;
}
