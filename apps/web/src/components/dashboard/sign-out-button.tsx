/**
 * Server-side sign-out form. Submits a POST to /auth/sign-out, which
 * clears the Supabase session cookie and redirects to /.
 *
 * Posting a form (rather than calling an onClick handler) is the
 * progressive-enhancement-friendly path: works without JS, works
 * with prefetch off, no client-component overhead just for one button.
 */
export function SignOutButton() {
  return (
    <form action="/auth/sign-out" method="POST" className="inline">
      <button type="submit" className="btn btn-quiet h-10 text-sm">
        Sign out
      </button>
    </form>
  );
}
