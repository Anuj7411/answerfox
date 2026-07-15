import { SiteSettingsView } from '@/components/dashboard/site-settings/site-settings-view';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

/**
 * Functional Site Settings page (Porcelain), ported from
 * `Site-Settings.dc.html`. Every control here is wired to a real,
 * pure-DB server action — rename, audit schedule, score-drop alert,
 * ingest-token rotation, ownership verification, and delete. Controls
 * in the design that have no backend yet (env, per-PR config, drift
 * triggers, retention) are intentionally left out rather than faked;
 * the linked-repo and ownership panels render honest read-only state.
 */
export default async function SiteSettingsPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  return (
    <SiteSettingsView
      siteId={site.id}
      name={site.name}
      url={site.url}
      auditSchedule={site.auditSchedule}
      nextScheduledAuditAt={site.nextScheduledAuditAt?.toISOString() ?? null}
      alertThreshold={site.alertThreshold}
      hasIngestToken={site.ingestToken !== null}
      repoFullName={site.repoFullName}
      installationId={site.installationId}
      verificationStatus={site.verificationStatusValue}
      verificationMethod={site.verificationMethodValue}
      verificationToken={site.verificationToken}
      verifiedAt={site.verifiedAt?.toISOString() ?? null}
    />
  );
}
