import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

/**
 * Postgres client for the Answerfox SaaS app. Connects to Supabase
 * via the pooled `DATABASE_URL` (transaction-mode for serverless,
 * session-mode for migrations).
 *
 * Two separate connections:
 * - `db` (default export): for query workloads, uses the pooled
 *   `DATABASE_URL`. Safe for Vercel serverless / Edge Functions.
 * - `migrationDb`: for `drizzle-kit` migrations, uses `DIRECT_URL`
 *   which bypasses the pooler. Only used by CLI tooling, never
 *   imported by app code.
 *
 * Required env vars (see `apps/web/.env.example`):
 * - DATABASE_URL: pooled connection string from Supabase
 * - DIRECT_URL: direct connection string (migrations only)
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const queryClient = postgres(requireEnv('DATABASE_URL'), {
  // Match Supabase pooler defaults. Transaction mode prevents
  // PREPARE / DEALLOCATE accumulation across serverless invocations.
  prepare: false,
});

export const db = drizzle(queryClient, { schema });

export type Db = typeof db;
export { schema };
