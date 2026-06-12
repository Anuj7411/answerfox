import { ScoreBandChip } from '@/components/dashboard/score-band-chip';
import type { ScoreBand } from '@answerfox/audit';

interface AgentReadinessHeroProps {
  readonly agentReadinessScore: number;
  readonly score: number;
  readonly band: ScoreBand;
}

const TOTAL_AR_CHECKS = 6;

/**
 * Two-panel hero on the site detail page. Agent Readiness on the left
 * (bigger, brand orange, leads with the raw 0-6 count), the legacy
 * 0-100 score on the right (smaller, monochrome).
 *
 * The split is the wedge made visible: Answerfox sells Agent
 * Readiness. The 0-100 score is provided for orientation, not as the
 * headline metric. Sites that ace classic SEO but skip the manifests
 * land in average band — and the layout makes them feel it.
 */
export function AgentReadinessHero({ agentReadinessScore, score, band }: AgentReadinessHeroProps) {
  const missing = TOTAL_AR_CHECKS - agentReadinessScore;
  const ringColor =
    agentReadinessScore === 0
      ? 'ring-red-300 bg-red-50'
      : agentReadinessScore < 3
        ? 'ring-orange-300 bg-orange-50'
        : agentReadinessScore < 6
          ? 'ring-amber-300 bg-amber-50'
          : 'ring-emerald-300 bg-emerald-50';

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <div
        className={`lg:col-span-3 rounded-2xl p-8 ring-1 ring-inset ${ringColor} transition-colors`}
      >
        <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">
          Agent Readiness
        </p>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="font-mono text-7xl font-semibold tabular-nums leading-none">
            {agentReadinessScore}
          </span>
          <span className="font-mono text-2xl text-ink-muted">/ {TOTAL_AR_CHECKS}</span>
        </div>
        <p className="mt-4 max-w-[44ch] font-body text-[15px] leading-relaxed">
          {missing === TOTAL_AR_CHECKS ? (
            <>
              No agent manifests detected. AI agents cannot discover this site's MCP server, API
              catalog, or permission policy without them.
            </>
          ) : missing > 0 ? (
            <>
              {missing} of {TOTAL_AR_CHECKS} agent manifests missing. Each one your site ships
              closes a door agents currently can't open.
            </>
          ) : (
            <>
              All 6 agent manifests present. AI agents can discover, authenticate, and act on this
              site without hardcoded knowledge.
            </>
          )}
        </p>
      </div>

      <div className="lg:col-span-2 rounded-2xl border border-ink/10 bg-slate-base/50 p-8">
        <p className="font-mono text-[12px] uppercase tracking-wide text-ink-muted">Legacy score</p>
        <div className="mt-4">
          <ScoreBandChip score={score} band={band} size="md" />
        </div>
        <p className="mt-4 font-body text-[14px] text-ink-muted">
          Classic SEO + AEO + GEO. Useful for orientation, but agent traffic is the trend.
        </p>
      </div>
    </section>
  );
}
