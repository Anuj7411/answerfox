'use client';

import {
  deleteSite,
  renameSite,
} from '@/app/(dashboard)/dashboard/sites/[siteId]/management-actions';
import { useState, useTransition } from 'react';

interface SiteManagementCardProps {
  readonly siteId: string;
  readonly currentName: string;
}

/**
 * Site management card — rename + delete. Rename is a simple in-place
 * input with save-on-change. Delete is gated behind a typed-name
 * double-confirm: the user must type the site name verbatim before
 * the destructive button enables. Server enforces ownership too.
 */
export function SiteManagementCard({ siteId, currentName }: SiteManagementCardProps) {
  const nameInputId = `site-name-${siteId}`;
  const confirmInputId = `site-delete-confirm-${siteId}`;
  const [name, setName] = useState(currentName);
  const [renamePending, startRename] = useTransition();
  const [renameError, setRenameError] = useState<string | null>(null);
  const [renameSavedAt, setRenameSavedAt] = useState<Date | null>(null);

  const [confirmText, setConfirmText] = useState('');
  const [deletePending, startDelete] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const renameDirty = name.trim() !== currentName.trim();
  const confirmOk = confirmText.trim() === currentName.trim() && currentName.length > 0;

  function handleRename() {
    setRenameError(null);
    startRename(async () => {
      const res = await renameSite(siteId, name);
      if (!res.ok) {
        setRenameError(res.error);
        return;
      }
      setRenameSavedAt(new Date());
    });
  }

  function handleDelete() {
    setDeleteError(null);
    startDelete(async () => {
      const res = await deleteSite(siteId);
      // deleteSite redirects on success, so if we got a value back it failed.
      if (res !== undefined && !res.ok) {
        setDeleteError(res.error);
      }
    });
  }

  return (
    <section className="rounded-2xl border border-ink/10 bg-slate-base/50 p-6">
      <h2 className="text-lg font-semibold">Site settings</h2>
      <p className="mt-2 text-sm text-ink-muted">
        Rename the site or delete it along with every audit, finding, and recorded visit.
      </p>

      <div className="mt-5">
        <label
          htmlFor={nameInputId}
          className="block font-mono text-[11px] uppercase tracking-wider text-ink-dim"
        >
          Name
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id={nameInputId}
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={renamePending}
            maxLength={120}
            className="min-w-0 flex-1 rounded-md border border-ink/15 bg-slate-base px-3 py-2 font-mono text-[13px] text-ink"
          />
          <button
            type="button"
            onClick={handleRename}
            disabled={renamePending || !renameDirty || name.trim().length === 0}
            className="btn btn-quiet disabled:cursor-not-allowed disabled:opacity-50"
          >
            {renamePending ? 'Saving…' : renameDirty ? 'Save name' : 'Saved'}
          </button>
        </div>
        <div className="mt-2 text-[12.5px] text-ink-muted">
          {renameError !== null && <span className="text-red-700">{renameError}</span>}
          {renameError === null && renameSavedAt !== null && !renameDirty && (
            <span>Saved {formatSavedAgo(renameSavedAt)}.</span>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-red-300/50 bg-red-50/40 p-4">
        <p className="text-sm font-semibold text-red-900">Delete this site</p>
        <p className="mt-1 text-[12.5px] text-red-900/80">
          Deletes the site, every audit and finding, recorded analytics visits, and AI fix history.
          This cannot be undone.
        </p>
        <label
          htmlFor={confirmInputId}
          className="mt-3 block font-mono text-[11px] uppercase tracking-wider text-red-900/70"
        >
          Type <span className="font-semibold">{currentName}</span> to confirm
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            id={confirmInputId}
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.currentTarget.value)}
            disabled={deletePending}
            placeholder={currentName}
            className="min-w-0 flex-1 rounded-md border border-red-300/70 bg-slate-base px-3 py-2 font-mono text-[13px] text-ink"
          />
          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePending || !confirmOk}
            className="inline-flex items-center justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 font-mono text-[13px] font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletePending ? 'Deleting…' : 'Delete forever'}
          </button>
        </div>
        {deleteError !== null && <p className="mt-2 text-[12.5px] text-red-700">{deleteError}</p>}
      </div>
    </section>
  );
}

function formatSavedAgo(d: Date): string {
  const seconds = Math.max(1, Math.round((Date.now() - d.getTime()) / 1000));
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  return `${minutes}m ago`;
}
