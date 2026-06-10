import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { NextResponse } from 'next/server';

/**
 * Sign-out handler.
 *
 * POST request from the dashboard's "Sign out" button. Clears the
 * Supabase session cookie and redirects to the landing page.
 *
 * POST only (not GET) so a logged-out link in a malicious page
 * can't sign you out via image preload.
 */
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
