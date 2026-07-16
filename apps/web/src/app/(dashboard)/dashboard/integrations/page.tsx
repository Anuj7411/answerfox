import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import {
  type InstallationRow,
  getActiveInstallationForLogin,
  getInstallationByInstallationId,
  listActiveRepositoriesForInstallation,
} from '@/lib/db/queries/github-installations';
import { listSitesForUser } from '@/lib/db/queries/sites';
import { resolveGithubLogin } from '@/lib/github/resolve-github-login';
import { createServerSupabaseClient } from '@/lib/supabase/server-client';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

/** The App's real, fixed permissions — declared once, constant per install. */
const APP_PERMISSIONS = 'Contents: read & write · Pull requests: read & write';
const FOOT_LINE = '#F0F0EC';
const FOOT_BG = '#FCFCFA';

interface RepoRow {
  readonly fullName: string;
  readonly site: { readonly id: string; readonly name: string } | null;
}

interface InstallationCardData extends InstallationRow {
  readonly repos: readonly RepoRow[];
}

export default async function IntegrationsPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user === null) redirect('/sign-in?redirect=/dashboard/integrations');

  const login = resolveGithubLogin(user);
  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG ?? 'answerfox';
  const installUrl = `https://github.com/apps/${appSlug}/installations/new`;

  const sites = await listSitesForUser(user.id);
  const siteByRepo = new Map(
    sites
      .filter((s) => s.repoFullName !== null)
      .map((s) => [s.repoFullName as string, { id: s.id, name: s.name }]),
  );

  // Which installations are this user's: the personal-account install their
  // GitHub login resolves to, plus any installation their linked sites sit on
  // (covers org installs the login query does not resolve yet).
  const installationIds = new Set<number>();
  const primary = login !== null ? await getActiveInstallationForLogin(login) : null;
  if (primary !== null) installationIds.add(primary.installationId);
  for (const s of sites) {
    if (s.installationId !== null) installationIds.add(s.installationId);
  }

  const installations: InstallationCardData[] = (
    await Promise.all(
      [...installationIds].map(async (id): Promise<InstallationCardData | null> => {
        const row = await getInstallationByInstallationId(id);
        if (row === null) return null;
        const cached = await listActiveRepositoriesForInstallation(id);
        const names = new Set<string>(cached.map((r) => r.fullName));
        for (const s of sites) {
          if (s.installationId === id && s.repoFullName !== null) names.add(s.repoFullName);
        }
        const repos: RepoRow[] = [...names]
          .sort((a, b) => a.localeCompare(b))
          .map((fullName) => ({ fullName, site: siteByRepo.get(fullName) ?? null }));
        return { ...row, repos };
      }),
    )
  ).filter((x): x is InstallationCardData => x !== null);

  return (
    <div
      style={{
        maxWidth: 1000,
        width: '100%',
        margin: '0 auto',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      {/* PAGE HEADER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 640 }}>
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
            Integrations
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: PC.muted }}>
            The GitHub App is how Answerfox reads your repos and opens fix-PRs.
          </p>
        </div>
        <a href={installUrl} style={secondaryBtn}>
          <PlusIcon />
          Install on another account
        </a>
      </div>

      {/* INSTALLATION CARDS or empty state */}
      {installations.length === 0 ? (
        <NoInstallationCard hasGithub={login !== null} installUrl={installUrl} />
      ) : (
        installations.map((inst) => <InstallationCard key={inst.installationId} inst={inst} />)
      )}

      {/* ADD-ANOTHER */}
      {installations.length > 0 && (
        <div
          style={{
            background: FOOT_BG,
            border: `1px dashed ${PC.faint}`,
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              flex: '0 0 auto',
              width: 38,
              height: 38,
              borderRadius: 10,
              background: PC.card,
              border: `1px solid ${PC.line}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusIcon stroke={PC.muted} size={18} />
          </span>
          <div
            style={{
              flex: '1 1 260px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 14, color: PC.ink }}>
              Connect another GitHub org or account
            </span>
            <span style={{ fontSize: 13, color: PC.muted }}>
              Answerfox can watch repos across multiple orgs.
            </span>
          </div>
          <a href={installUrl} style={{ ...secondaryBtn, flex: '0 0 auto' }}>
            <GithubMark />
            Install
          </a>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INSTALLATION CARD
   ============================================================ */

function InstallationCard({ inst }: { inst: InstallationCardData }) {
  const isOrg = inst.accountType.toLowerCase() === 'organization';
  const manageUrl = `https://github.com/settings/installations/${inst.installationId}`;

  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '16px 20px',
          borderBottom: `1px solid ${PC.line}`,
          flexWrap: 'wrap',
        }}
      >
        <span
          style={{
            flex: '0 0 auto',
            width: 34,
            height: 34,
            borderRadius: 9,
            background: PC.ink,
            color: '#FAFAF8',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: BODY,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {(inst.accountLogin[0] ?? '?').toUpperCase()}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: '1 1 auto',
            minWidth: 0,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 16, color: PC.ink }}>
            {inst.accountLogin}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10.5,
              letterSpacing: '.06em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            {isOrg ? 'org' : 'user'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontFamily: MONO,
              fontSize: 11,
              color: PC.green,
              background: PC.greenWash,
              borderRadius: 999,
              padding: '2px 10px',
            }}
          >
            <span
              style={{ width: 5, height: 5, borderRadius: '50%', background: PC.greenBright }}
            />
            connected
          </span>
        </span>
        <span style={{ flex: '0 0 auto', fontFamily: MONO, fontSize: 12, color: PC.dim }}>
          installed {formatDate(inst.createdAt)}
        </span>
      </div>

      {/* body */}
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* repos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 13, color: PC.ink }}>
              Repositories granted
            </span>
            <span style={{ fontFamily: MONO, fontSize: 12, color: PC.muted }}>
              {inst.repositorySelection === 'all'
                ? 'all repositories'
                : `${inst.repos.length} ${inst.repos.length === 1 ? 'repository' : 'repositories'}`}
            </span>
          </div>

          {inst.repos.length === 0 ? (
            <div
              style={{
                border: `1px solid ${PC.line}`,
                borderRadius: 10,
                padding: '16px 14px',
                fontSize: 13,
                color: PC.muted,
              }}
            >
              No repositories cached yet. They appear here as GitHub sends installation events, or
              as you link repos to sites.
            </div>
          ) : (
            <div style={{ border: `1px solid ${PC.line}`, borderRadius: 10, overflow: 'hidden' }}>
              {inst.repos.map((repo, i) => (
                <div
                  key={repo.fullName}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 20px 1fr',
                    gap: 14,
                    alignItems: 'center',
                    padding: '11px 14px',
                    borderTop: i === 0 ? 'none' : `1px solid ${FOOT_LINE}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <RepoIcon />
                    <span
                      style={{
                        fontFamily: MONO,
                        fontSize: 12.5,
                        color: PC.ink,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {repo.fullName}
                    </span>
                  </div>
                  <span style={{ textAlign: 'center' }}>
                    <ArrowIcon />
                  </span>
                  {repo.site !== null ? (
                    <Link
                      href={`/dashboard/sites/${repo.site.id}`}
                      style={{
                        fontSize: 13,
                        color: PC.ink,
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textDecoration: 'none',
                      }}
                    >
                      {repo.site.name}
                    </Link>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: PC.dim, fontStyle: 'italic' }}>
                        not linked
                      </span>
                      <Link
                        href="/dashboard/sites/new"
                        style={{
                          fontSize: 12.5,
                          color: PC.blazeDeep,
                          fontWeight: 500,
                          textDecoration: 'none',
                        }}
                      >
                        Link a site
                      </Link>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* permissions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            Permissions
          </span>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: PC.muted }}>
            {APP_PERMISSIONS}
          </span>
        </div>
      </div>

      {/* footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '12px 20px',
          borderTop: `1px solid ${PC.line}`,
          background: FOOT_BG,
          flexWrap: 'wrap',
        }}
      >
        <a href={manageUrl} style={{ ...secondaryBtn, height: 34, fontSize: 12.5 }}>
          Manage on GitHub
          <ExternalLinkIcon />
        </a>
        <a
          href={manageUrl}
          style={{ fontFamily: BODY, fontSize: 12.5, color: PC.dim, textDecoration: 'none' }}
        >
          Configure repositories
        </a>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */

function NoInstallationCard({
  hasGithub,
  installUrl,
}: {
  hasGithub: boolean;
  installUrl: string;
}) {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: PC.hover,
          border: `1px solid ${PC.line}`,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GithubMark size={22} fill={PC.ink} />
      </span>
      <span style={{ fontFamily: BODY, fontWeight: 600, fontSize: 16, color: PC.ink }}>
        No GitHub App installation yet
      </span>
      <span style={{ fontSize: 13.5, color: PC.muted, maxWidth: 420 }}>
        {hasGithub
          ? 'Install the Answerfox GitHub App to let it read your repos and open fix-PRs. Once installed, your repositories show up here.'
          : 'Sign in with GitHub and install the Answerfox App to connect your repositories and open fix-PRs.'}
      </span>
      <a href={installUrl} style={{ ...primaryBtn, marginTop: 4 }}>
        <GithubMark fill="#FAFAF8" />
        Install the GitHub App
      </a>
    </div>
  );
}

/* ============================================================
   SHARED BITS
   ============================================================ */

const secondaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  padding: '0 13px',
  height: 38,
  background: PC.card,
  border: `1px solid ${PC.line}`,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  color: PC.ink,
  textDecoration: 'none',
} as const;

const primaryBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 16px',
  height: 40,
  background: PC.ink,
  borderRadius: 8,
  fontFamily: BODY,
  fontSize: 13,
  fontWeight: 500,
  color: '#FAFAF8',
  textDecoration: 'none',
} as const;

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PlusIcon({ stroke = PC.muted, size = 15 }: { stroke?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Add"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function RepoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flex: '0 0 auto' }}
      role="img"
      aria-label="Repository"
    >
      <path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#C4C3BC"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="links to"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke={PC.muted}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="External link"
    >
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  );
}

function GithubMark({ size = 14, fill = PC.ink }: { size?: number; fill?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="none"
      role="img"
      aria-label="GitHub"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}
