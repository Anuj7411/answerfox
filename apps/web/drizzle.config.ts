import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config for migration generation and pushes.
 *
 * Uses `DIRECT_URL` (not `DATABASE_URL`) because migrations need
 * to bypass the Supabase pooler. Transaction-mode poolers don't
 * support DDL statements like CREATE TABLE.
 *
 * Local dev: `pnpm drizzle-kit generate` produces a new migration
 * file under `drizzle/` after editing `src/lib/db/schema/`.
 * `pnpm drizzle-kit migrate` applies pending migrations.
 *
 * See `.env.example` for the required env vars.
 */
export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL ?? '',
  },
  // Verbose output during generation makes diffs easier to review.
  verbose: true,
  // Strict mode catches schema-drift between code and DB at push.
  strict: true,
});
