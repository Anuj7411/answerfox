interface ArMiniChipProps {
  readonly agentReadinessScore: number;
}

const TOTAL_AR_CHECKS = 6;

/**
 * Compact "x/6 AR" chip for site list cards. Colored by completion
 * so the dashboard at-a-glance answers "which of my sites are still
 * agent-blind?" without opening each.
 */
export function ArMiniChip({ agentReadinessScore }: ArMiniChipProps) {
  const style =
    agentReadinessScore === 0
      ? 'bg-red-100 text-red-900 ring-red-200'
      : agentReadinessScore < 3
        ? 'bg-orange-100 text-orange-900 ring-orange-200'
        : agentReadinessScore < 6
          ? 'bg-amber-100 text-amber-900 ring-amber-200'
          : 'bg-emerald-100 text-emerald-900 ring-emerald-200';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-[12px] ring-1 ring-inset ${style}`}
    >
      <span className="font-semibold">
        {agentReadinessScore}/{TOTAL_AR_CHECKS}
      </span>
      <span className="opacity-70">AR</span>
    </span>
  );
}
