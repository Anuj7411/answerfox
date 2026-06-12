'use client';

import { type RunAuditFormState, runAuditAction } from '@/app/(dashboard)/dashboard/sites/actions';
import { useActionState } from 'react';

const initialState: RunAuditFormState = {};

interface AuditNowButtonProps {
  readonly siteId: string;
  readonly variant?: 'compact' | 'full';
}

/**
 * Single-button form that runs an audit for the given site. Uses
 * React 19's useActionState so the button shows a pending state
 * while the audit runs (2-8s wall time on a real URL).
 *
 * `compact` variant is for inline use on the sites list. `full` is
 * for the empty-state CTA on the detail page.
 */
export function AuditNowButton({ siteId, variant = 'compact' }: AuditNowButtonProps) {
  const [state, formAction, isPending] = useActionState(runAuditAction, initialState);
  const error = state.errors?.general;

  const buttonClass = variant === 'compact' ? 'btn btn-ghost text-sm' : 'btn btn-solid';

  return (
    <form action={formAction} className={variant === 'compact' ? 'inline-block' : 'space-y-3'}>
      <input type="hidden" name="siteId" value={siteId} />
      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? 'Auditing...' : 'Audit now'}
      </button>
      {error !== undefined && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </form>
  );
}
