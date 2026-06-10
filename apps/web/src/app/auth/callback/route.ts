import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

/**
 * OAuth callback handler.
 *
 * GitHub (and any other Supabase Auth provider) redirects here after
 * the user signs in. The `code` query param is a one-time code we
 * exchange for a session via supabase.auth.exchangeCodeForSession.
 *
 * Then we redirect to the `next` param (defaults to /dashboard) so
 * the user lands on the page they were trying to reach before signing
 * in. The middleware will have stashed the intended destination in
 * the OAuth state before the round-trip.
 *
 * Errors (no code, exchange failure, provider error) redirect to the
 * sign-in page with `?error=...` so the UI can show a message.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';
  const providerError = searchParams.get('error_description') ?? searchParams.get('error');

  if (providerError !== null) {
    const signIn = new URL('/sign-in', origin);
    signIn.searchParams.set('error', providerError);
    return NextResponse.redirect(signIn);
  }

  if (code === null) {
    const signIn = new URL('/sign-in', origin);
    signIn.searchParams.set('error', 'Missing authorization code from provider');
    return NextResponse.redirect(signIn);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error !== null) {
    const signIn = new URL('/sign-in', origin);
    signIn.searchParams.set('error', error.message);
    return NextResponse.redirect(signIn);
  }

  // Sanity-check `next` to prevent open-redirect: only allow same-origin paths.
  const safeNext = next.startsWith('/') ? next : '/dashboard';
  return NextResponse.redirect(new URL(safeNext, origin));
}
