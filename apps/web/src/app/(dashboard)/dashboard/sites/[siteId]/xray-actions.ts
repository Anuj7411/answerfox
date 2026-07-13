'use server';

import { getSiteForUser } from '@/lib/db/queries/sites';
import { getXrayCache } from '@/lib/db/queries/xray-cache';
import { setXrayCache } from '@/lib/db/mutations/xray-cache';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import type { XrayComparison } from '@/lib/xray/compare';
import { createCloudflareRender } from '@/lib/xray/cloudflare-render';
import { fetchCrawlerView } from '@/lib/xray/crawler-fetch';
import { runXrayForPage } from '@/lib/xray/run-xray';

/**
 * Run X-Ray on a site's homepage: fetch what the crawler receives, render
 * what a browser produces, and report how much rendered content the
 * crawler never sees. This is the caller the X-Ray orchestrator was built
 * for. Single-page today (the homepage); money-page fan-out over a
 * sitemap is the follow-up.
 */
export type RunXrayState =
  | { readonly status: 'idle' }
  | { readonly status: 'unavailable'; readonly reason: string }
  | {
      readonly status: 'succeeded';
      readonly comparison: XrayComparison;
      /** false = served from the render cache; no browser time spent. */
      readonly rendered: boolean;
    }
  | { readonly status: 'failed'; readonly error: string };

export async function runXrayAction(siteId: string): Promise<RunXrayState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return { status: 'failed', error: 'Sign in to run X-Ray.' };

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) return { status: 'failed', error: 'Site not found.' };

  const render = createCloudflareRender();
  if (render === null) {
    return {
      status: 'unavailable',
      reason:
        'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to run X-Ray (Cloudflare Browser Rendering).',
    };
  }

  try {
    const result = await runXrayForPage(site.url, {
      crawlerFetch: fetchCrawlerView,
      render,
      // Cache is best-effort: if xray_cache is not migrated yet, treat
      // every page as a miss (always render) rather than fail the run.
      getCached: async (url) => {
        try {
          return await getXrayCache(url);
        } catch {
          return null;
        }
      },
      setCached: async (url, entry) => {
        try {
          await setXrayCache(url, entry);
        } catch {
          /* best-effort */
        }
      },
    });
    if (result.ok) {
      return { status: 'succeeded', comparison: result.comparison, rendered: result.rendered };
    }
    return { status: 'failed', error: result.reason };
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : 'X-Ray failed.' };
  }
}
