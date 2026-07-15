import { XrayView } from '@/components/dashboard/xray/xray-view';
import { getSiteForUser } from '@/lib/db/queries/sites';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import { notFound } from 'next/navigation';

interface PageProps {
  readonly params: Promise<{ readonly siteId: string }>;
}

/**
 * Functional X-Ray page. Renders the client `XrayView`, which runs the
 * real single-page X-Ray (`runXrayAction`) and reports coverage, word
 * counts, and missing-content evidence. Cloudflare Browser Rendering
 * env is required to render; without it the action returns `unavailable`
 * and the view says so honestly.
 */
export default async function XrayPage({ params }: PageProps) {
  const { siteId } = await params;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) return null;

  const site = await getSiteForUser(siteId, user.id);
  if (site === null) notFound();

  return <XrayView siteId={site.id} siteUrl={site.url} />;
}
