import { AccountSettingsView } from '@/components/dashboard/account-settings-view';
import { getProfileWithStats } from '@/lib/db/queries/profile';
import { resolveGithubLogin } from '@/lib/github/resolve-github-login';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard/settings');

  const profile = await getProfileWithStats(user.id);
  if (profile === null) {
    redirect('/dashboard');
  }

  const githubLogin = resolveGithubLogin(user);
  const planLabel = 'Free';
  const paidSiteCount = 0;

  return (
    <AccountSettingsView
      profile={{
        name: profile.name,
        email: profile.email,
        createdAt: profile.createdAt.toISOString(),
        siteCount: profile.siteCount,
      }}
      githubLogin={githubLogin}
      planLabel={planLabel}
      paidSiteCount={paidSiteCount}
    />
  );
}
