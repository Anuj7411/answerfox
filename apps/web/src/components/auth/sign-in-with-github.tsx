'use client';

import { BODY } from '@/components/dashboard/site-overview/porcelain';
import { createBrowserSupabaseClient } from '@/lib/supabase/browser-client';
import { useState } from 'react';

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
      style={{
        width: '100%',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 46,
        background: '#1C1C19',
        border: 'none',
        borderRadius: 9,
        fontFamily: BODY,
        fontSize: 14,
        fontWeight: 500,
        color: '#FAFAF8',
        whiteSpace: 'nowrap',
        cursor: pending ? 'progress' : 'pointer',
        opacity: pending ? 0.75 : 1,
      }}
    >
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="#FAFAF8"
        stroke="none"
        aria-hidden="true"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
      </svg>
      {pending ? 'Redirecting…' : 'Continue with GitHub'}
    </button>
  );
}
