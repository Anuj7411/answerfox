'use client';

import { updateAuditSchedule } from '@/app/(dashboard)/dashboard/sites/[siteId]/schedule-actions';
import { useState, useTransition } from 'react';

type ScheduleValue = 'off' | 'daily' | 'weekly';

interface AuditScheduleCardProps {
  readonly siteId: string;
  readonly current: ScheduleValue;
  readonly nextAt: Date | null;
}

const OPTIONS: ReadonlyArray<{
  readonly value: ScheduleValue;
  readonly label: string;
  readonly sub: string;
}> = [
  { value: 'off', label: 'Off', sub: 'You re-audit manually.' },
  { value: 'daily', label: 'Daily', sub: 'Runs every 24 hours.' },
  { value: 'weekly', label: 'Weekly', sub: 'Runs every 7 days.' },
];

export function AuditScheduleCard({ siteId, current, nextAt }: AuditScheduleCardProps) {
  const [selected, setSelected] = useState<ScheduleValue>(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const dirty = selected !== current;

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await updateAuditSchedule(siteId, selected);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSavedAt(new Date());
    });
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Audit schedule</h2>
        {nextAt !== null && current !== 'off' && (
          <span className="font-mono text-[11.5px] text-ink-dim">
            Next run: {formatNextRun(nextAt)}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-ink-muted">
        Run audits on a cadence and watch your score over time. The scheduler picks up changes
        immediately.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              disabled={pending}
              className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors ${
                active
                  ? 'border-ember/60 bg-ember/10'
                  : 'border-ink/10 bg-slate-base hover:border-ink/30'
              }`}
              aria-pressed={active}
            >
              <span className="text-sm font-semibold">{opt.label}</span>
              <span className="text-[12.5px] text-ink-muted">{opt.sub}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[12.5px] text-ink-muted">
          {error !== null && <span className="text-red-700">{error}</span>}
          {error === null && savedAt !== null && !dirty && (
            <span>Saved {formatSavedAgo(savedAt)}.</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty}
          className="btn btn-solid disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? 'Saving…' : dirty ? 'Save schedule' : 'Saved'}
        </button>
      </div>
    </section>
  );
}

function formatNextRun(next: Date): string {
  const diff = next.getTime() - Date.now();
  if (diff <= 0) return 'within the hour';
  const hours = Math.round(diff / 3_600_000);
  if (hours < 1) return 'within the hour';
  if (hours < 36) return `in ${hours}h`;
  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

function formatSavedAgo(savedAt: Date): string {
  const seconds = Math.max(1, Math.round((Date.now() - savedAt.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}
