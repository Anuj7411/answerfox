import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createMiddlewareSupabaseClient } from '@/lib/supabase/middleware-client';

/**
 * Next.js middleware that runs on every request matched by the
 * `config.matcher` below. Does two jobs:
 *
 * 1. Rotates the Supabase session cookie so signed-in users stay
 *    signed in without a forced re-login when the access token
 *    is about to expire.
 * 2. Redirects unauthenticated users away from protected routes
 *    (anything starting with `/dashboard`) to the sign-in page,
 *    preserving the intended destination in `?redirect=`.
 *
 * The matcher excludes static assets and the Next.js internals so
 * we don't pay the middleware cost on every CSS/JS/image fetch.
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabaseClient(request);

  // IMPORTANT: do not put logic between createMiddlewareSupabaseClient
  // and getUser(). Per @supabase/ssr docs, the cookies must flush
  // before any conditional work runs.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');

  // Protected route, no user → redirect to sign-in.
  if (isProtected && user === null) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  // Signed-in user on auth page → bounce to dashboard.
  if (isAuthPage && user !== null) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Run on everything EXCEPT:
    // - Next.js internals (_next/static, _next/image)
    // - Static files (favicon, robots, sitemap, etc.)
    // - Image extensions
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
