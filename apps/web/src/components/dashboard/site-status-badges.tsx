interface SiteStatusBadgesProps {
  readonly auditSchedule: 'off' | 'daily' | 'weekly';
  readonly alertThreshold: number | null;
  readonly hasIngestToken: boolean;
  readonly trafficCount: number;
  readonly windowDays: number;
}

const PILL_BASE =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10.5px] tracking-wider uppercase';

/**
 * Compact row of status pills that surfaces a site's continuous-audit
 * configuration on the sites list page. Reads at a glance whether
 * each feature is wired so the user can spot a site that's slipped
 * out of monitoring.
 *
 * Off-states are intentionally desaturated (slate, not red) — "off"
 * is a valid configuration, not a warning.
 */
export function SiteStatusBadges({
  auditSchedule,
  alertThreshold,
  hasIngestToken,
  trafficCount,
  windowDays,
}: SiteStatusBadgesProps) {
  const scheduleOn = auditSchedule !== 'off';
  const scheduleClass = scheduleOn
    ? 'border-ember/40 bg-ember/10 text-ink'
    : 'border-ink/15 bg-transparent text-ink-dim';
  const scheduleText = auditSchedule === 'off' ? 'Schedule off' : `Audits ${auditSchedule}`;

  const alertOn = alertThreshold !== null;
  const alertClass = alertOn
    ? 'border-ember/40 bg-ember/10 text-ink'
    : 'border-ink/15 bg-transparent text-ink-dim';
  const alertText = alertOn ? `Alert ≤ ${alertThreshold}` : 'Alerts off';

  const integratedClass = hasIngestToken
    ? 'border-ember/40 bg-ember/10 text-ink'
    : 'border-ink/15 bg-transparent text-ink-dim';
  const integratedText = hasIngestToken
    ? `${trafficCount} hits / ${windowDays}d`
    : 'Not integrated';

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={`${PILL_BASE} ${scheduleClass}`}>{scheduleText}</span>
      <span className={`${PILL_BASE} ${alertClass}`}>{alertText}</span>
      <span className={`${PILL_BASE} ${integratedClass}`}>{integratedText}</span>
    </div>
  );
}
