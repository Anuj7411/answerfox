'use client';

import posthog from 'posthog-js';

/**
 * Initialize PostHog on the client. Called once from
 * `PostHogProvider`. No-op if `NEXT_PUBLIC_POSTHOG_KEY` isn't set,
 * which is the local-dev default until you wire up an account.
 *
 * Why client-only: PostHog's autocapture (clicks, pageviews) is
 * inherently browser-side. Server-side events go through
 * `posthog-node` (separate package, wired in later when we add
 * server-side events like "audit completed").
 */
export function initPostHog() {
  if (typeof window === 'undefined') return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

  if (key === undefined || key.length === 0) {
    // Silent no-op for local dev without an account.
    return;
  }

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: false, // we'll fire pageviews manually in the provider
    capture_pageleave: true,
  });
}

export { posthog };
