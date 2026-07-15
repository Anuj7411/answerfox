import type { User } from '@supabase/supabase-js';

/**
 * Local-only auth bypass for testing/iteration.
 *
 * When enabled, the Supabase client factories make `auth.getUser()` return
 * a dev user (impersonating a real profile from the DB) so every authed page
 * renders with real data WITHOUT a Supabase login — email/password auth is
 * off in this project and OAuth can't run headlessly. This is purely
 * app-level; it never touches Supabase auth config.
 *
 * SAFETY: triple-gated so it can NEVER run on a deployed app — requires
 * `DEV_AUTH_BYPASS=true` AND not on Vercel AND not a production build.
 */
export function devBypassAllowed(): boolean {
  return (
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.VERCEL !== '1' &&
    process.env.NODE_ENV !== 'production'
  );
}

/** Build a minimal Supabase User the app's call sites can use (id/email/name). */
export function buildDevUser(id: string, email: string, name: string | null): User {
  return {
    id,
    email,
    app_metadata: {},
    user_metadata: name ? { name } : {},
    aud: 'authenticated',
    created_at: new Date(0).toISOString(),
  } as User;
}
