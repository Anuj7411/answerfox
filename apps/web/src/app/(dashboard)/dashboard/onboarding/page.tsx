import { OnboardingFlow } from '@/components/dashboard/onboarding/onboarding-flow';
import { BODY, PC } from '@/components/dashboard/site-overview/porcelain';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/**
 * Onboarding wizard: install the GitHub App, pick a repo, run the first
 * audit, land on results. The heavy lifting (listing the installation's
 * repos, then create+link+audit) runs through the existing
 * `listConnectableReposAction` / `onboardRepoAction`; this page only
 * gates on auth and hands the flow the install URL.
 */
export default async function OnboardingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard/onboarding');

  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG ?? 'answerfox';
  const installUrl = `https://github.com/apps/${appSlug}/installations/new`;

  return (
    <div
      style={{
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 28,
      }}
    >
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: '-.02em',
            color: PC.ink,
          }}
        >
          Get your first site watched
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
          Install the GitHub App, pick a repo, and Answerfox runs your first audit.
        </p>
      </div>
      <OnboardingFlow installUrl={installUrl} />
    </div>
  );
}
