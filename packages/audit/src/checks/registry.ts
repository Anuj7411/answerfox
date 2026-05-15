import type { Check } from '@answerable/core';
import type { AuditDom } from '../parser.js';
import { a1Title } from './a1-title.js';
import { a3Description } from './a3-description.js';
import { a4Canonical } from './a4-canonical.js';
import { a5HtmlLang } from './a5-html-lang.js';
import { c1JsonLd } from './c1-json-ld.js';

/**
 * Every check registered with the audit engine, in stable AUDIT-FRAMEWORK
 * order. Subsequent PRs append to this list — never reorder, never
 * renumber. Stable IDs (`A1`, `A3`, ...) are part of the public API
 * (users pin `--ignore A4` in CI).
 */
export const DEFAULT_CHECKS: readonly Check<AuditDom>[] = [
  a1Title,
  a3Description,
  a4Canonical,
  a5HtmlLang,
  c1JsonLd,
];
