'use client';

import {useState} from 'react';
import type {GuestbookAdminRow} from '@/lib/repositories/guestbook';
import {
  toggleGuestbookApprovalAction,
  softDeleteGuestbookAction
} from '@/lib/actions/guestbook';

export function GuestbookAdminList({entries}: {entries: GuestbookAdminRow[]}) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'hidden'>('all');

  const filteredEntries = entries.filter((e) => {
    if (filter === 'approved') return e.isApproved;
    if (filter === 'hidden') return !e.isApproved;
    return true;
  });

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl text-fg">Buku Tamu</h1>
          <p className="mt-1 text-sm text-fg-muted">
            Kelola pesan publik yang dikirim oleh pengunjung situs.
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border bg-bg p-1 text-xs">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              filter === 'all' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            Semua ({entries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('approved')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              filter === 'approved' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            Disetujui ({entries.filter((e) => e.isApproved).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('hidden')}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              filter === 'hidden' ? 'bg-surface text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
            }`}
          >
            Disembunyikan ({entries.filter((e) => !e.isApproved).length})
          </button>
        </div>
      </div>

      {filteredEntries.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">Tidak ada pesan yang sesuai.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {filteredEntries.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold text-fg">
                      {entry.name}
                    </span>
                    {entry.website ? (
                      <a
                        href={entry.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="text-xs text-accent hover:underline"
                      >
                        {entry.website}
                      </a>
                    ) : null}
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        entry.isApproved
                          ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                          : 'border border-amber-500/40 bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {entry.isApproved ? 'Disetujui' : 'Disembunyikan'}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm text-fg-muted">
                    {entry.message}
                  </p>
                  <p className="mt-2 text-xs text-fg-muted/70">{entry.createdAt}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <form action={toggleGuestbookApprovalAction.bind(null, entry.id, entry.isApproved)}>
                    <button
                      type="submit"
                      className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-fg transition-colors hover:bg-surface-2"
                    >
                      {entry.isApproved ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </form>
                  <form action={softDeleteGuestbookAction.bind(null, entry.id)}>
                    <button
                      type="submit"
                      className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-surface-2"
                    >
                      Hapus
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
