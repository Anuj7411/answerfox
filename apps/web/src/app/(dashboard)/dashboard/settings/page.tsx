import { DisplayNameForm } from '@/components/dashboard/display-name-form';
import { getProfileWithStats } from '@/lib/db/queries/profile';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const profile = await getProfileWithStats(user.id);
  if (profile === null) {
    // Profile row is created lazily by the auth trigger on first
    // sign-in. If it's missing here something is genuinely off — send
    // them home so the trigger gets another chance to fire.
    redirect('/dashboard');
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-[12px] text-ink-muted">
          <Link href="/dashboard" className="hover:underline">
            ← Dashboard
          </Link>
        </p>
        <h1 className="t-hero mt-2 text-3xl">Account settings</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-muted">
          Joined {profile.createdAt.toISOString().slice(0, 10)} · plan{' '}
          <span className="font-semibold text-ink">Free</span>
        </p>
      </div>

      <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">Email</dt>
            <dd className="mt-1 font-mono text-[13px] text-ink">{profile.email}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">
              Signed in with
            </dt>
            <dd className="mt-1 font-mono text-[13px] text-ink">GitHub</dd>
          </div>
        </dl>

        <div className="mt-6">
          <DisplayNameForm currentName={profile.name} fallbackEmail={profile.email} />
        </div>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-slate-base/40 p-6">
        <h2 className="text-lg font-semibold">Usage</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Lifetime totals across every site on this account.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <UsageStat label="Sites" value={profile.siteCount} />
          <UsageStat label="Audits" value={profile.auditCount} />
          <UsageStat label="Visits recorded" value={profile.visitCount} />
        </dl>
      </section>

      <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
        <h2 className="text-lg font-semibold">Plan</h2>
        <p className="mt-2 text-sm text-ink-muted">
          You are on <span className="font-semibold text-ink">Free</span>. Includes manual audits,
          AI fix generation (local-dev stub), Daily/Weekly schedule, and score-drop alerts.
        </p>
        <div className="mt-4">
          <Link href="/pricing" className="btn btn-quiet">
            See pricing
          </Link>
        </div>
      </section>
    </div>
  );
}

function UsageStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-slate-base px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-dim">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-ink">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
