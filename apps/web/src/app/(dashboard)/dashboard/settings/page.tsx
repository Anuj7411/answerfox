import { AccountSettingsView } from '@/components/dashboard/account-settings-view';
import { listMonthlyAiFixUsage } from '@/lib/db/queries/ai-fixes';
import { getProfileWithStats } from '@/lib/db/queries/profile';
import { getWeeklyDigestOptIn } from '@/lib/db/queries/weekly-digest';
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

  const [profile, aiFixQuota, weeklyDigestOptIn] = await Promise.all([
    getProfileWithStats(user.id),
    listMonthlyAiFixUsage(user.id),
    getWeeklyDigestOptIn(user.id),
  ]);
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
      weeklyDigestOptIn={weeklyDigestOptIn}
      aiFixQuota={{
        used: aiFixQuota.used,
        quota: aiFixQuota.quota,
        remaining: aiFixQuota.remaining,
        resetAt: aiFixQuota.resetAt.toISOString(),
      }}
    />
  );
}
