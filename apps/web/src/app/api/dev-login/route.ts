import { devBypassAllowed, devCredentials } from '@/lib/auth/dev-bypass';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Local dev login. Signs a throwaway dev user in via email/password
 * (auto-provisioning it with the service-role key on first run) and
 * redirects to the requested page with a real Supabase session, so
 * every existing auth check keeps working unchanged.
 *
 * Hard-gated by `devBypassAllowed()` — returns 404 anywhere it isn't a
 * local dev machine, so it can never be reached on a deploy.
 */
export async function GET(request: Request) {
  if (!devBypassAllowed()) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get('next') ?? '/dashboard';
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  const creds = devCredentials();
  if (creds === null) {
    const signIn = new URL('/sign-in', origin);
    signIn.searchParams.set('error', 'Set DEV_AUTH_EMAIL and DEV_AUTH_PASSWORD in .env.local');
    return NextResponse.redirect(signIn);
  }

  const supabase = await createServerSupabaseClient();

  // Try to sign in; if the dev user does not exist yet, provision it
  // (email pre-confirmed) with the service-role key, then retry.
  let { error } = await supabase.auth.signInWithPassword(creds);
  if (error !== null) {
    const provisioned = await provisionDevUser(creds.email, creds.password);
    if (!provisioned.ok) {
      const signIn = new URL('/sign-in', origin);
      signIn.searchParams.set('error', `Dev login failed: ${provisioned.error}`);
      return NextResponse.redirect(signIn);
    }
    ({ error } = await supabase.auth.signInWithPassword(creds));
  }

  if (error !== null) {
    const signIn = new URL('/sign-in', origin);
    signIn.searchParams.set('error', `Dev login failed: ${error.message}`);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.redirect(new URL(safeNext, origin));
}

async function provisionDevUser(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return { ok: false, error: 'Missing SUPABASE_SERVICE_ROLE_KEY to auto-create the dev user' };
  }
  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  // A duplicate means the user already exists (bad password, most likely).
  if (error !== null && !/already/i.test(error.message)) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
