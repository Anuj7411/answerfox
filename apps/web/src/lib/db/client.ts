import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index';

/**
 * Postgres client for the Answerfox SaaS app. Connects to Supabase
 * via the pooled `DATABASE_URL` (transaction-mode for serverless,
 * session-mode for migrations).
 *
 * **Lazy initialization.** The Drizzle/postgres client is created on
 * first use, not at module load. This matters because Next.js
 * collects page data at build time (no env vars in CI), and a
 * module-load `postgres()` call would throw and break the build.
 * Request-time access still works fine on Vercel runtimes.
 *
 * Required env vars (see `apps/web/.env.example`):
 * - DATABASE_URL: pooled connection string from Supabase
 * - DIRECT_URL: direct connection string (drizzle-kit migrations only)
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

type Drizzle = ReturnType<typeof drizzle<typeof schema>>;

let cachedDb: Drizzle | null = null;

/**
 * Get the Drizzle client. Creates the underlying `postgres` connection
 * on first call, caches it for the lifetime of the process / cold
 * start. Safe to call from RSCs, Route Handlers, Server Actions.
 */
export function getDb(): Drizzle {
  if (cachedDb !== null) return cachedDb;
  const queryClient = postgres(requireEnv('DATABASE_URL'), {
    // Match Supabase pooler defaults. Transaction mode prevents
    // PREPARE / DEALLOCATE accumulation across serverless invocations.
    prepare: false,
  });
  cachedDb = drizzle(queryClient, { schema });
  return cachedDb;
}

export type Db = Drizzle;
export { schema };
