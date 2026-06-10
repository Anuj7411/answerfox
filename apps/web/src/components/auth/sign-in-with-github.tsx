'use client';

import { useState } from 'react';
import { GitHubIcon } from '@/components/icons';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser-client';

interface SignInWithGitHubProps {
  /**
   * Path the user should land on after a successful sign-in. The
   * OAuth callback handler will validate this is same-origin to
   * prevent open-redirect.
   */
  readonly redirectTo?: string | undefined;
}

/**
 * GitHub OAuth sign-in button. Triggers the redirect flow:
 * 1. User clicks button
 * 2. Browser → Supabase → GitHub OAuth screen
 * 3. GitHub → Supabase /auth/v1/callback (configured in Supabase dashboard)
 * 4. Supabase → our /auth/callback?code=... route
 * 5. Our callback exchanges the code for a session and redirects to `next`
 */
export function SignInWithGitHub({ redirectTo }: SignInWithGitHubProps) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    const supabase = createBrowserSupabaseClient();
    const next = redirectTo ?? '/dashboard';
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    callbackUrl.searchParams.set('next', next);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error !== null) {
      // Supabase already logged it; surface to user.
      console.error('OAuth sign-in failed:', error.message);
      setPending(false);
    }
    // On success, browser navigates away. No need to clear pending.
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="btn btn-solid w-full"
    >
      <GitHubIcon />
      {pending ? 'Redirecting...' : 'Continue with GitHub'}
    </button>
  );
}
