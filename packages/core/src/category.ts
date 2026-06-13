import { z } from 'zod';

/**
 * The seven audit categories defined in AUDIT-FRAMEWORK.md.
 * Stored as kebab-case for use in config files; the public-facing
 * single-letter prefix (A/B/C/D/E/F/G) lives on each check's `id`.
 *
 * `agent-readiness` (G) is the v0.3.0 addition: detects AI-agent-era
 * manifests like MCP Server Card, A2A agent-card.json, llms.txt,
 * RFC 9727 API Catalog, agent-permissions.json, OAuth discovery,
 * and WebMCP form annotations. Currently INFORMATIONAL (points: 0
 * per check) so the SEO/AEO/GEO base score stays comparable across
 * versions. Future v0.4+ may roll into scoring once standards stabilize.
 */
export const CategorySchema = z.enum([
  'meta-and-technical',
  'content-structure',
  'structured-data',
  'eeat-and-authority',
  'offsite-citations',
  'og-and-social',
  'agent-readiness',
  'agentic-commerce',
]);
export type Category = z.infer<typeof CategorySchema>;

/**
 * Maps each category to the single-letter prefix used in check IDs.
 * Example: `B5` → `content-structure`, `G2` → `agent-readiness`.
 */
export const CATEGORY_ID_PREFIX = {
  'meta-and-technical': 'A',
  'content-structure': 'B',
  'structured-data': 'C',
  'eeat-and-authority': 'D',
  'offsite-citations': 'E',
  'og-and-social': 'F',
  'agent-readiness': 'G',
  'agentic-commerce': 'H',
} as const satisfies Record<Category, string>;

export type CategoryIdPrefix = (typeof CATEGORY_ID_PREFIX)[Category];

/**
 * Per-category point budget. Categories A through F sum to exactly 100
 * (the base SEO/AEO/GEO score). Category G (agent-readiness) gets 0
 * because v0.3.0 ships these checks as informational only. They show up
 * in the report but don't move the score.
 * Source: docs/internal/AUDIT-FRAMEWORK.md §1 + ROADMAP.md (v0.3.0 entry).
 */
export const CATEGORY_POINT_BUDGET = {
  'meta-and-technical': 21,
  'content-structure': 20,
  'structured-data': 9,
  'eeat-and-authority': 22,
  'offsite-citations': 12,
  'og-and-social': 8,
  'agent-readiness': 39,
  'agentic-commerce': 12,
} as const satisfies Record<Category, number>;
