import { BODY, MONO, PC } from '@/components/dashboard/site-overview/porcelain';
import { marketingInstallUrl } from '@/components/marketing/marketing-chrome';
import type { AgentAnswerReport, QuestionResult } from '@/lib/agent-answer/types';
import Link from 'next/link';

/**
 * Presentational scan result in the Porcelain "Public Audit" language,
 * shared by the live scanner form and the shareable /scan/:id page so
 * both render identically. No hooks — server-safe on the shared page and
 * usable inside the client form alike.
 *
 * Wired to the real AgentAnswerReport (answerability score + per-question
 * verdicts + gaps). The design's crawler/browser X-Ray and raw-HTML
 * drawer are intentionally omitted: a public scan does not capture that
 * per-page HTML, so faking it would misrepresent the data.
 */
export function ScanResult({ report }: { readonly report: AgentAnswerReport }) {
  const total = report.results.length;
  const answered = report.results.filter((r) => r.verdict === 'answerable').length;
  const partial = report.results.filter((r) => r.verdict === 'partial').length;
  const unanswered = report.results.filter((r) => r.verdict === 'unanswerable').length;
  const band = scoreBand(report.answerabilityScore);
  const R = 58;
  const C = 2 * Math.PI * R;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* SCORE BAND */}
      <div
        className="afx-score"
        style={{
          background: PC.card,
          border: `1px solid ${PC.line}`,
          borderRadius: 14,
          padding: '26px 28px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 28,
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', width: 140, height: 140, flex: '0 0 auto' }}>
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{ transform: 'rotate(-90deg)' }}
            aria-hidden="true"
          >
            <circle cx="70" cy="70" r={R} fill="none" stroke="#F0F0EC" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke={band.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - clamp(report.answerabilityScore) / 100)}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            <span
              style={{
                fontFamily: BODY,
                fontWeight: 600,
                fontSize: 38,
                letterSpacing: '-.02em',
                color: PC.ink,
              }}
            >
              {report.answerabilityScore}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: '.06em',
                textTransform: 'uppercase',
                color: band.color,
                marginTop: 4,
              }}
            >
              {band.label}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            Verdict
          </span>
          <p
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 500,
              fontSize: 19,
              lineHeight: 1.4,
              letterSpacing: '-.01em',
              color: PC.ink,
            }}
          >
            {verdictText(answered, total, band.color)}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              marginTop: 4,
            }}
          >
            {unanswered > 0 && <SevCount color={PC.red} label={`${unanswered} unanswerable`} />}
            {partial > 0 && <SevCount color={PC.amber} label={`${partial} partial`} />}
            {unanswered === 0 && partial === 0 && <SevCount color={PC.green} label="no gaps" />}
          </div>
        </div>
      </div>

      {/* TILES — mapped to real question verdicts */}
      <div
        className="afx-tiles"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}
      >
        <Tile label="Questions" value={total} valueColor={PC.ink} sub="asked of the docs" />
        <Tile label="Answered" value={answered} valueColor={PC.green} sub="fully answerable" />
        <Tile label="Partial" value={partial} valueColor={PC.amber} sub="half-covered" />
        <Tile label="Unanswered" value={unanswered} valueColor={PC.red} sub="agent gives up" />
      </div>

      {/* BIGGEST FINDINGS — from real gaps */}
      <section style={{ padding: '32px 0 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: '-.02em',
              color: PC.ink,
            }}
          >
            Biggest gaps
          </h2>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              color: PC.dim,
            }}
          >
            read-only
          </span>
        </div>

        {report.gaps.length === 0 ? (
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 12,
              padding: '22px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <span
              style={{
                flex: '0 0 auto',
                width: 32,
                height: 32,
                borderRadius: 9,
                background: PC.greenWash,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke={PC.green}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <span style={{ fontSize: 14.5, color: PC.ink }}>
              An AI agent could answer every question we asked from what it can read. Strong.
            </span>
          </div>
        ) : (
          <div
            style={{
              background: PC.card,
              border: `1px solid ${PC.line}`,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {report.gaps.map((gap, i) => (
              <Finding key={gap.question} gap={gap} first={i === 0} />
            ))}
          </div>
        )}
      </section>

      {/* CTA BAND */}
      <section style={{ padding: '48px 0 0' }}>
        <div
          style={{
            background: PC.ink,
            borderRadius: 16,
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 18,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: -40,
              left: -40,
              width: 220,
              height: 220,
              background: 'radial-gradient(circle,rgba(243,69,4,.22),transparent 70%)',
              pointerEvents: 'none',
            }}
          />
          <h2
            style={{
              margin: 0,
              fontFamily: BODY,
              fontWeight: 600,
              fontSize: 30,
              letterSpacing: '-.03em',
              color: '#FAFAF8',
              maxWidth: 640,
              lineHeight: 1.15,
            }}
          >
            This is your site's first impression on every AI. Fix it.
          </h2>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: 4,
            }}
          >
            <a href={marketingInstallUrl()} style={ctaPrimary}>
              <GithubMark />
              Install the GitHub App
            </a>
            <Link href="/scan" style={ctaGhost}>
              Audit your own site
            </Link>
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11.5,
              color: 'rgba(250,250,248,.5)',
              marginTop: 6,
            }}
          >
            Answerfox writes each fix, opens the PR, and proves the score moved.
          </span>
        </div>
      </section>
    </div>
  );
}

/* ── bits ── */

function scoreBand(score: number): { readonly label: string; readonly color: string } {
  if (score >= 80) return { label: 'excellent', color: PC.green };
  if (score >= 65) return { label: 'strong', color: PC.green };
  if (score >= 50) return { label: 'average', color: PC.amber };
  return { label: 'needs work', color: PC.red };
}

function verdictText(answered: number, total: number, accent: string): React.ReactNode {
  if (total === 0) return 'No developer questions could be evaluated for this site.';
  if (answered === total) {
    return 'An AI coding agent could answer every developer question from only what a crawler receives.';
  }
  return (
    <>
      An AI coding agent could fully answer{' '}
      <span style={{ color: accent }}>
        {answered} of {total}
      </span>{' '}
      developer questions from only what a crawler receives — so answer engines quote a partial
      version of your docs.
    </>
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function SevCount({ color, label }: { color: string; label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: MONO,
        fontSize: 12,
        color: PC.muted,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      {label}
    </span>
  );
}

function Tile({
  label,
  value,
  valueColor,
  sub,
}: {
  label: string;
  value: number;
  valueColor: string;
  sub: string;
}) {
  return (
    <div
      style={{
        background: PC.card,
        border: `1px solid ${PC.line}`,
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      <span
        style={{
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: PC.dim,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: BODY,
          fontWeight: 600,
          fontSize: 26,
          color: valueColor,
          letterSpacing: '-.01em',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span style={{ fontFamily: MONO, fontSize: 11.5, color: PC.muted }}>{sub}</span>
    </div>
  );
}

function Finding({ gap, first }: { gap: QuestionResult; first: boolean }) {
  const critical = gap.verdict === 'unanswerable';
  const sevColor = critical ? PC.red : PC.amber;
  const sevBg = critical ? PC.redWash : PC.amberWash;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 16,
        alignItems: 'center',
        padding: '16px 20px',
        borderTop: first ? 'none' : `1px solid ${'#F0F0EC'}`,
      }}
    >
      <span
        style={{
          flex: '0 0 auto',
          width: 32,
          height: 32,
          borderRadius: 9,
          background: sevBg,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {critical ? (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={sevColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        ) : (
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke={sevColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        )}
      </span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 500, color: PC.ink, letterSpacing: '-.005em' }}>
          {gap.question}
        </span>
        {gap.missing.length > 0 && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12.5,
              color: critical ? PC.blazeDeep : PC.muted,
              lineHeight: 1.5,
            }}
          >
            Missing: {gap.missing}
          </span>
        )}
      </div>
      <span
        style={{
          flex: '0 0 auto',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: MONO,
          fontSize: 10.5,
          letterSpacing: '.04em',
          textTransform: 'uppercase',
          color: sevColor,
          background: sevBg,
          borderRadius: 5,
          padding: '3px 9px',
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sevColor }} />
        {gap.verdict}
      </span>
    </div>
  );
}

const ctaPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 18px',
  height: 46,
  background: PC.blaze,
  borderRadius: 9,
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 500,
  color: '#FAFAF8',
  whiteSpace: 'nowrap' as const,
  textDecoration: 'none',
} as const;

const ctaGhost = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '0 18px',
  height: 46,
  background: 'transparent',
  border: '1px solid rgba(250,250,248,.28)',
  borderRadius: 9,
  fontFamily: BODY,
  fontSize: 14,
  fontWeight: 500,
  color: '#FAFAF8',
  whiteSpace: 'nowrap' as const,
  textDecoration: 'none',
} as const;

function GithubMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#FAFAF8" stroke="none" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.34.85.01 1.7.12 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z" />
    </svg>
  );
}
