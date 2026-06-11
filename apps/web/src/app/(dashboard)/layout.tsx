import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

// Every page under /dashboard/* depends on the authenticated session.
// Force per-request rendering so Next doesn't try to prerender these
// at build time (which would fail without env vars set in CI).
export const dynamic = 'force-dynamic';

/**
 * Layout shared across all `/dashboard/*` routes. Renders the top
 * nav (brand, user email, sign-out) and gates the entire route
 * group on an authenticated session.
 *
 * The middleware ALSO gates `/dashboard/*` for unauthenticated
 * users, so this server-side check is belt-and-braces: if someone
 * somehow bypasses the middleware (config drift, edge case), the
 * layout still refuses to render. `redirect()` throws so children
 * never execute.
 */
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user === null) {
    redirect('/sign-in?redirect=/dashboard');
  }

  return (
    <main className="min-h-screen bg-slate-base text-ink">
      <header className="border-b border-ink/10 bg-slate-base/60 backdrop-blur">
        <nav className="mx-auto flex h-[64px] max-w-[1200px] items-center justify-between px-6 sm:px-10">
          <Link href="/dashboard" className="brand">
            <span className="mark">
              <i />
            </span>
            <span className="wm">Answerfox</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[12.5px] text-ink-muted sm:inline">
              {user.email}
            </span>
            <SignOutButton />
          </div>
        </nav>
      </header>
      <div className="mx-auto max-w-[1200px] px-6 py-10 sm:px-10">{children}</div>
    </main>
  );
}
