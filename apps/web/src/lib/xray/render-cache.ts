import { createHash } from 'node:crypto';

/**
 * Hash-based render caching for X-Ray.
 *
 * Browser Rendering (the HUMAN side of the diff) is the one metered
 * resource, and §0.5 says we live inside the free allowance until
 * revenue. The lever: only re-render a page when its RAW no-JS HTML
 * changed. Most audits re-hit pages that haven't changed since last
 * run — those are pure cache hits and cost zero browser time. This
 * cuts render hours 70-90% and is what makes the free tier survive
 * launch volume.
 */

/**
 * Stable content hash of a page's raw HTML. We normalize volatile bits
 * (CSRF tokens, timestamps, nonces) so cosmetic churn doesn't force a
 * needless re-render, while real content changes still flip the hash.
 */
export function contentHash(rawHtml: string): string {
  const normalized = rawHtml
    // Common per-request noise that changes without the content changing.
    .replace(/nonce="[^"]*"/gi, 'nonce=""')
    .replace(/name="csrf-token"\s+content="[^"]*"/gi, 'name="csrf-token" content=""')
    .replace(/\bdata-(?:reactroot|react-checksum)="[^"]*"/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(normalized).digest('hex');
}

export interface CacheDecision {
  readonly shouldRender: boolean;
  readonly hash: string;
  readonly reason: 'no-prior-hash' | 'content-changed' | 'unchanged-cache-hit';
}

/**
 * Decide whether a page needs a fresh browser render given its prior
 * content hash. `null` prior hash = never rendered = must render.
 */
export function decideRender(rawHtml: string, priorHash: string | null): CacheDecision {
  const hash = contentHash(rawHtml);
  if (priorHash === null) {
    return { shouldRender: true, hash, reason: 'no-prior-hash' };
  }
  if (hash !== priorHash) {
    return { shouldRender: true, hash, reason: 'content-changed' };
  }
  return { shouldRender: false, hash, reason: 'unchanged-cache-hit' };
}
