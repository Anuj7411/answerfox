import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Supabase client used inside Next.js middleware. Rotates the
 * session cookie if Supabase's auth token is about to expire,
 * keeping users signed in across requests without a page refresh.
 *
 * Returns BOTH the supabase client (in case the caller wants to
 * inspect the user) AND the augmented response that has any
 * rotated cookies attached. Pattern matches @supabase/ssr docs.
 */
export function createMiddlewareSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url === undefined || url.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (anonKey === undefined || anonKey.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: object }>) {
        // Mirror the new cookies onto the request (for downstream
        // RSCs in the same render pass) AND the response (for the
        // client to receive and persist).
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  return { supabase, response };
}
