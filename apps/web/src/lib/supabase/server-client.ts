import { buildDevUser, devBypassAllowed } from '@/lib/auth/dev-bypass';
import { getDb } from '@/lib/db/client';
import { profiles } from '@/lib/db/schema/profiles';
import { createServerClient } from '@supabase/ssr';
import { eq } from 'drizzle-orm';
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

  const client = createServerClient(url, anonKey, {
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

  // Local-only impersonation: make getUser() return a real profile so authed
  // pages render with real data without a Supabase login. Gated to dev.
  if (devBypassAllowed()) {
    const dev = await resolveDevUser();
    if (dev !== null) {
      client.auth.getUser = (async () => ({
        data: { user: dev },
        error: null,
      })) as typeof client.auth.getUser;
    }
  }

  return client;
}

async function resolveDevUser() {
  try {
    const envId = process.env.DEV_AUTH_USER_ID;
    const rows = envId
      ? await getDb().select().from(profiles).where(eq(profiles.id, envId)).limit(1)
      : await getDb().select().from(profiles).limit(1);
    const p = rows[0];
    return p ? buildDevUser(p.id, p.email, p.name) : null;
  } catch {
    return null;
  }
}
