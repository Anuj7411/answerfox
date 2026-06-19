/**
 * Drizzle schema for the Answerfox SaaS database (Postgres on
 * Supabase). Re-exports every table so consumers (queries, the
 * Drizzle Studio, the dashboard) can import from one path.
 *
 * Conventions:
 * - Snake_case column names in Postgres, camelCase TS field names.
 * - UUIDs everywhere (matches Supabase auth.users.id).
 * - All timestamps are `timestamptz`, never naive.
 * - Indexes are declared in the table files alongside their
 *   intended query.
 *
 * See `drizzle/0000_initial.sql` for the first migration.
 */

export * from './profiles';
export * from './sites';
export * from './audits';
export * from './findings';
export * from './ai-fixes';
