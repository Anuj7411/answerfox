/**
 * Local-only auth bypass for fast iteration.
 *
 * When enabled, the middleware sends unauthenticated dashboard requests
 * to `/api/dev-login`, which signs in (and, on first run, provisions) a
 * throwaway dev user via email/password so you land straight on the
 * pages without the GitHub OAuth round-trip every time.
 *
 * SAFETY: this is triple-gated so it can NEVER run on a deployed app.
 * It requires `DEV_AUTH_BYPASS=true` AND that we are not on Vercel AND
 * not a production build. Real GitHub OAuth is untouched in production.
 */
export function devBypassAllowed(): boolean {
  return (
    process.env.DEV_AUTH_BYPASS === 'true' &&
    process.env.VERCEL !== '1' &&
    process.env.NODE_ENV !== 'production'
  );
}

/** The dev user's credentials, read from the local env. */
export function devCredentials(): { email: string; password: string } | null {
  const email = process.env.DEV_AUTH_EMAIL;
  const password = process.env.DEV_AUTH_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}
