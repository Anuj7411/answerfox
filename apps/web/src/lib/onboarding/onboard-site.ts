import 'server-only';
import { createAuditWithFindings } from '@/lib/db/mutations/audits';
import { createSiteForUser, linkSiteToRepo } from '@/lib/db/mutations/sites';
import { findSiteByRepo } from '@/lib/db/queries/find-site-by-repo';
import type { Site } from '@/lib/db/schema/sites';
import { audit as runAudit } from '@answerfox/audit';

/**
 * Onboarding orchestration: install -> pick a repo -> site created,
 * linked, and audited (§6 week-7 exit test: "install -> audit in
 * 60s"). No UI here — this is the decided-contract flow the dashboard
 * calls once the design for the repo picker exists.
 *
 * Idempotent: re-running for an already-linked repo returns the
 * existing site rather than creating a duplicate (a repo can only
 * back one site — entitlement, Proof-of-Fix, and Drift Guard all
 * resolve "the" site for a repo via a single-row lookup).
 *
 * Deliberately does NOT enqueue any fix-PRs yet. Which checks are
 * safe to auto-fix on first onboarding without a human reviewing the
 * finding first is a real product decision (§10.5: framework-level
 * issues must stay diagnostics, never PRs) — not something to guess
 * at inside a wiring task. The dashboard's existing per-finding
 * "generate fix" action already lets a user trigger PRs deliberately;
 * an auto-PR-on-onboarding allowlist is future, explicit work.
 */

export interface OnboardSiteInput {
  readonly userId: string;
  readonly installationId: number;
  readonly repoFullName: string;
  readonly siteUrl: string;
  readonly siteName: string;
}

export interface OnboardSiteResult {
  readonly site: Site;
  readonly auditScore: number;
  readonly alreadyLinked: boolean;
}

export async function onboardSiteFromRepo(
  input: OnboardSiteInput,
  auditFn: typeof runAudit = runAudit,
): Promise<OnboardSiteResult> {
  const existing = await findSiteByRepo(input.repoFullName);
  if (existing !== null) {
    return { site: existing, auditScore: -1, alreadyLinked: true };
  }

  const created = await createSiteForUser({
    userId: input.userId,
    url: input.siteUrl,
    name: input.siteName,
  });
  const linked = await linkSiteToRepo({
    userId: input.userId,
    siteId: created.id,
    repoFullName: input.repoFullName,
    installationId: input.installationId,
  });
  if (!linked) {
    throw new Error(
      `Failed to link site ${created.id} to ${input.repoFullName} (ownership mismatch).`,
    );
  }

  const report = await auditFn(input.siteUrl);
  const auditRow = await createAuditWithFindings({ siteId: created.id, report });

  // Re-fetch rather than trust the pre-link `created` object: the
  // returned site must reflect the link that just succeeded, not a
  // stale snapshot from before the update.
  const site = await findSiteByRepo(input.repoFullName);
  if (site === null) {
    throw new Error(`Site ${created.id} vanished immediately after linking.`);
  }

  return { site, auditScore: auditRow.score, alreadyLinked: false };
}
