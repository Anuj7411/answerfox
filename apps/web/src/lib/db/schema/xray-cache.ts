import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Render cache for X-Ray, keyed by URL. Stores the content hash of the
 * crawler-view HTML and the comparison it produced, so a repeat X-Ray of
 * an unchanged page costs one plain fetch and zero metered browser
 * renders. This is the lever that keeps X-Ray inside the free Browser
 * Rendering allowance. Written via the service role; RLS denies anon.
 */
export const xrayCache = pgTable('xray_cache', {
  url: text('url').primaryKey(),
  hash: text('hash').notNull(),
  comparison: jsonb('comparison').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type XrayCacheRow = typeof xrayCache.$inferSelect;
export type NewXrayCacheRow = typeof xrayCache.$inferInsert;
