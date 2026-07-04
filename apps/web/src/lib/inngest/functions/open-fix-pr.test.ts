import { describe, expect, it } from 'vitest';
import { openFixPr } from './open-fix-pr';

/**
 * The queue's rate-limit posture is configuration, and misconfiguring
 * it IS the failure mode (403 storms on GitHub's secondary limits).
 * Lock the config in a test so a refactor can't silently drop it.
 */
describe('openFixPr queue configuration', () => {
  const config = (
    openFixPr as unknown as {
      opts: {
        concurrency?: Array<{ key?: string; limit?: number }>;
        throttle?: { key?: string; limit?: number; period?: string };
        retries?: number;
      };
    }
  ).opts;

  it('serializes per installation (concurrency limit 1 keyed on installationId)', () => {
    expect(config.concurrency).toEqual([{ key: 'event.data.installationId', limit: 1 }]);
  });

  it('paces PRs well under the ~80/min secondary write limit', () => {
    expect(config.throttle?.key).toBe('event.data.installationId');
    expect(config.throttle?.limit).toBeLessThanOrEqual(30);
    expect(config.throttle?.period).toBe('1m');
  });

  it('retries transient failures', () => {
    expect(config.retries).toBeGreaterThanOrEqual(1);
  });
});
