import 'server-only';

/**
 * The HUMAN side of X-Ray: fetch a page as a real browser would render
 * it (JS executed). This is the one metered resource in the whole
 * product (§5) — Cloudflare Browser Rendering, bound into the Workers
 * runtime as `env.BROWSER`, NOT callable from a plain Node process.
 *
 * There is no local/dev equivalent of that binding, so this module is
 * a thin injectable seam (same pattern as app-client.ts): production
 * wiring is a Workers-only implementation swapped in at the edge;
 * everything upstream (run-xray.ts) is tested against a fake.
 *
 * The crawler side needs no such seam — it's a plain unauthenticated
 * fetch, real and free, wired directly in run-xray.ts.
 */

export type RenderFn = (url: string) => Promise<string>;

/**
 * Placeholder that fails loudly if called without a real binding
 * wired in. Prevents a misconfigured deploy from silently treating
 * "render unavailable" as "page has no content" (a false X-Ray gap).
 */
export const renderNotConfigured: RenderFn = async (_url: string) => {
  throw new Error(
    'Browser Rendering is not wired in this environment. Requires the Cloudflare Workers `env.BROWSER` binding (see apps/web/wrangler.toml, week 4-5 build task).',
  );
};
