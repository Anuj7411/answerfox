import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Public profile for an authenticated user.
 *
 * `id` is a UUID that references `auth.users.id` (Supabase's
 * managed auth schema). We don't declare an explicit foreign key
 * here because the `auth` schema is owned by Supabase, but the
 * RLS policy on this table joins against auth.users so deletes
 * cascade in practice.
 *
 * One profile row per signed-in user. Created lazily on first
 * sign-in via a Supabase function trigger (see migration 0000).
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
