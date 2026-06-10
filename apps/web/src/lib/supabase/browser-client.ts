import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for use in Client Components, hooks, and any
 * `'use client'` boundary. Reads from the public env vars (anon key
 * only, never the service role).
 *
 * Use sparingly: prefer the server client (server-client.ts) when
 * possible because RSCs are faster and don't ship credentials to
 * the browser. Use this when:
 * - User interacts with auth (sign-in button onClick handler)
 * - Realtime subscriptions
 * - Optimistic UI updates
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url === undefined || url.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
  }
  if (anonKey === undefined || anonKey.length === 0) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return createBrowserClient(url, anonKey);
}
