import { BODY, DISPLAY, MONO, PC, bandTone } from '@/components/dashboard/site-overview/porcelain';
import { MarketingFooter, MarketingNav } from '@/components/marketing/marketing-chrome';
import { getPublicLeaderboard } from '@/lib/db/queries/leaderboard';
import type { Metadata } from 'next';

// Reads the DB (public sites + latest audit), so it must render on demand.
// The build environment has no DB access, and static prerender would run
// the query at build time (see lib/db/client.ts). Dashboard pages use the
// same guard.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Agent-readiness leaderboard · Answerfox',
  description:
    'Public sites ranked by how well AI agents can read and act on them, scored by the same 53-check audit. Opt in from your site settings.',
};

export default async function LeaderboardPage() {
  const entries = await getPublicLeaderboard(100);

  return (
    <div style={{ minHeight: '100vh', background: PC.bg }}>
      <MarketingNav current="leaderboard" />

      <main style={{ maxWidth: 820, margin: '0 auto', padding: '64px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: PC.blaze,
            }}
          >
            Public board
          </span>
          <h1
            style={{
              margin: '12px 0 0',
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            Agent-readiness leaderboard
          </h1>
          <p
            style={{
              margin: '12px auto 0',
              maxWidth: 560,
              fontSize: 15,
              lineHeight: 1.6,
              color: PC.muted,
            }}
          >
            How well can AI agents read and act on these sites? Ranked by the same 53-check audit.
            Site owners opt in from their settings — only domain, score, and band are shown.
          </p>
        </div>

        {entries.length === 0 ? (
          <EmptyState />
        ) : (
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {entries.map((e) => {
              const tone = bandTone(e.band);
              return (
                <div
                  key={`${e.rank}-${e.domain}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 20px',
                    borderBottom: `1px solid ${PC.line}`,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 14,
                      color: e.rank <= 3 ? PC.blaze : PC.dim,
                      fontWeight: e.rank <= 3 ? 600 : 400,
                      width: 32,
                      flex: '0 0 auto',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {e.rank}
                  </span>
                  <span
                    style={{
                      fontFamily: BODY,
                      fontSize: 15,
                      fontWeight: 500,
                      color: PC.ink,
                      flex: '1 1 auto',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {e.domain}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      letterSpacing: '.04em',
                      textTransform: 'uppercase',
                      color: tone.color,
                      background: tone.bg,
                      padding: '4px 10px',
                      borderRadius: 999,
                      flex: '0 0 auto',
                    }}
                  >
                    {e.band}
                  </span>
                  <span
                    style={{
                      fontFamily: DISPLAY,
                      fontWeight: 700,
                      fontSize: 18,
                      color: PC.ink,
                      width: 56,
                      textAlign: 'right',
                      flex: '0 0 auto',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {e.score}
                    <span style={{ fontSize: 11, color: PC.dim, fontWeight: 400 }}> /100</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', margin: '40px 0 64px' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: PC.muted }}>
            Want your site here? Run a free audit, then opt in from Site Settings.
          </p>
          <a
            href="/scan"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 42,
              padding: '0 20px',
              background: PC.ink,
              borderRadius: 9,
              fontFamily: BODY,
              fontSize: 14,
              fontWeight: 500,
              color: '#FAFAF8',
              textDecoration: 'none',
            }}
          >
            Run a free audit
          </a>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 14,
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0, fontFamily: BODY, fontWeight: 600, fontSize: 16, color: PC.ink }}>
        No sites on the board yet
      </p>
      <p style={{ margin: '8px auto 0', maxWidth: 420, fontSize: 14, color: PC.muted }}>
        Be the first. Audit a site you own, verify it, then flip on the leaderboard from Site
        Settings.
      </p>
    </div>
  );
}
