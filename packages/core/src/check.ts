import type { Category } from './category.js';
import type { Severity } from './severity.js';
import type { AbsoluteUrl } from './url.js';

/**
 * Input handed to a check's `run` function by the audit engine.
 *
 * Generic over `TDom` so engines built on different parsers (cheerio,
 * playwright, JSDOM) can supply their own typed handle without forcing
 * `@answerfox/core` to depend on a parser.
 */
export interface CheckInput<TDom = unknown> {
  readonly url: AbsoluteUrl;
  readonly html: string;
  readonly dom: TDom;
}

/**
 * Outcome of a single check run.
 */
export interface CheckResult {
  readonly status: 'pass' | 'fail' | 'warn' | 'skip';
  /** Concrete evidence from the page (snippet, count, attribute value). */
  readonly evidence?: string | undefined;
  /** Human-readable next step for the developer. */
  readonly fixRecommendation?: string | undefined;
}

/**
 * Context passed to `autoFix` when the engine writes changes back into
 * the user's project. Filled out further as auto-fix capabilities land.
 */
export interface ProjectContext {
  readonly cwd: string;
  readonly framework: 'nextjs-app' | 'unknown';
}

/**
 * A single audit check. The full set of 50 checks Phase 1 ships with
 * is enumerated in docs/internal/AUDIT-FRAMEWORK.md.
 */
export interface Check<TDom = unknown> {
  /** Stable ID, e.g. `B5`. Part of the public API — never renumbered. */
  readonly id: string;
  readonly category: Category;
  readonly severity: Severity;
  /** Point weight toward the 100-point total. */
  readonly points: number;
  /** One-sentence summary shown in console reports. */
  readonly description: string;
  /** Long-form explanation of why this check matters. */
  readonly rationale: string;
  /** URL to the doc page explaining this check. */
  readonly docsUrl: string;
  /** Runs the check against a parsed page. */
  run: (input: CheckInput<TDom>) => CheckResult | Promise<CheckResult>;
  /** Optional auto-fix that patches the user's project. */
  autoFix?: ((project: ProjectContext) => Promise<void>) | undefined;
}

/**
 * Identity helper that gives TypeScript a chance to infer the generic
 * parameter on `Check` and surface type errors at definition time.
 *
 * @example
 * ```ts
 * import { defineCheck } from '@answerfox/core';
 *
 * export const titlePresent = defineCheck({
 *   id: 'A1',
 *   category: 'meta-and-technical',
 *   severity: 'critical',
 *   points: 3,
 *   description: '<title> present, 30-60 chars',
 *   rationale: 'Search and AI engines surface the title verbatim.',
 *   docsUrl: 'https://answerfox.dev/docs/checks/A1',
 *   run: ({ html }) => {
 *     const match = html.match(/<title>([^<]*)<\/title>/i);
 *     if (!match) return { status: 'fail', fixRecommendation: 'Add a <title> tag.' };
 *     const len = (match[1] ?? '').trim().length;
 *     if (len < 30 || len > 60) return { status: 'warn', evidence: `Length: ${len}` };
 *     return { status: 'pass' };
 *   },
 * });
 * ```
 */
export function defineCheck<TDom = unknown>(check: Check<TDom>): Check<TDom> {
  return check;
}
