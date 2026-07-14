'use client';

import { type RunAuditFormState, runAuditAction } from '@/app/(dashboard)/dashboard/sites/actions';
import { updateAuditSchedule } from '@/app/(dashboard)/dashboard/sites/[siteId]/schedule-actions';
import { useActionState, useState, useTransition } from 'react';
import { BODY, MONO, PC } from './porcelain';

type ScheduleValue = 'off' | 'daily' | 'weekly';
const SCHEDULES: readonly ScheduleValue[] = ['off', 'daily', 'weekly'];
const initialAudit: RunAuditFormState = {};

/**
 * The right side of the site header: a segmented schedule control
 * (off / daily / weekly, saved on click) and the primary "Audit now"
 * button. Both are wired to the real server actions — the segmented
 * control persists immediately, the audit runs and revalidates the page.
 */
export function ScheduleAuditControls({
  siteId,
  currentSchedule,
}: {
  readonly siteId: string;
  readonly currentSchedule: ScheduleValue;
}) {
  const [schedule, setSchedule] = useState<ScheduleValue>(currentSchedule);
  const [savedSchedule, setSavedSchedule] = useState<ScheduleValue>(currentSchedule);
  const [schedulePending, startSchedule] = useTransition();
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [auditState, auditAction, auditPending] = useActionState(runAuditAction, initialAudit);

  function pick(value: ScheduleValue) {
    if (value === schedule || schedulePending) return;
    const previous = savedSchedule;
    setSchedule(value);
    setScheduleError(null);
    startSchedule(async () => {
      const res = await updateAuditSchedule(siteId, value);
      if (res.ok) {
        setSavedSchedule(value);
      } else {
        setSchedule(previous);
        setScheduleError(res.error);
      }
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 auto' }}>
        <div
          role="group"
          aria-label="Audit schedule"
          style={{
            display: 'inline-flex',
            background: PC.sidebar,
            border: `1px solid ${PC.line}`,
            borderRadius: 6,
            padding: 2,
          }}
        >
          {SCHEDULES.map((value) => {
            const active = schedule === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => pick(value)}
                disabled={schedulePending}
                aria-pressed={active}
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  padding: '6px 12px',
                  border: active ? `1px solid ${PC.line}` : '1px solid transparent',
                  background: active ? PC.card : 'transparent',
                  color: active ? PC.ink : PC.dim,
                  borderRadius: 4,
                  cursor: schedulePending ? 'wait' : 'pointer',
                }}
              >
                {value}
              </button>
            );
          })}
        </div>

        <form action={auditAction}>
          <input type="hidden" name="siteId" value={siteId} />
          <button
            type="submit"
            disabled={auditPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              background: PC.blaze,
              border: 'none',
              borderRadius: 6,
              fontFamily: BODY,
              fontSize: 13,
              fontWeight: 600,
              color: PC.ink,
              cursor: auditPending ? 'wait' : 'pointer',
              opacity: auditPending ? 0.7 : 1,
            }}
          >
            ↻ {auditPending ? 'Auditing…' : 'Audit now'}
          </button>
        </form>
      </div>

      {(scheduleError ?? auditState.errors?.general) !== undefined &&
      (scheduleError ?? auditState.errors?.general) !== null ? (
        <span style={{ fontFamily: MONO, fontSize: 11, color: PC.red }}>
          {scheduleError ?? auditState.errors?.general}
        </span>
      ) : null}
    </div>
  );
}
