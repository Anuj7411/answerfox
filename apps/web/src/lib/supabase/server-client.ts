import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for use in React Server Components, Route Handlers,
 * and Server Actions. Reads the session cookie via Next's `cookies()`
 * helper and writes any rotated tokens back.
 *
 * Why not export a singleton: `cookies()` is request-scoped and async,
 * so we create a fresh client per request. The factory function shape
 * matches the @supabase/ssr docs.
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url === undefined || url.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (anonKey === undefined || anonKey.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: object }>) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // In Server Components, the cookies() store is read-only.
          // That's fine because the middleware will rotate the cookies
          // on the next request via createServerClient in middleware.ts.
        }
      },
    },
  });
}
