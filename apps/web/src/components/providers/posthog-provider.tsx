'use client';

import { initPostHog, posthog } from '@/lib/observability/posthog-client';
import { usePathname, useSearchParams } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

/**
 * Wraps the app to:
 * 1. Initialize PostHog once on mount.
 * 2. Fire a $pageview event on every client-side navigation
 *    (Next.js App Router doesn't trigger window navigation, so
 *    autocapture's default pageview handler misses route changes).
 *
 * Silent no-op when NEXT_PUBLIC_POSTHOG_KEY isn't set.
 */
export function PostHogProvider({ children }: { readonly children: ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname === null) return;
    const url =
      searchParams !== null && searchParams.toString().length > 0
        ? `${pathname}?${searchParams.toString()}`
        : pathname;
    posthog.capture?.('$pageview', { $current_url: url });
  }, [pathname, searchParams]);

  return <>{children}</>;
}
