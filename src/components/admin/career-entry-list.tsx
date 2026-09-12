import Link from 'next/link';
import type {CareerEntryRow, CareerKind} from '@/lib/repositories/career';
import {softDeleteCareerEntryAction, undoCareerEntryEditAction} from '@/lib/actions/career-entries';

export function CareerEntryList({
  kind,
  title,
  entries
}: {
  kind: CareerKind;
  title: string;
  entries: CareerEntryRow[];
}) {
  const basePath = kind === 'career' ? '/admin/career' : '/admin/education';

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl text-fg">{title}</h1>
        <Link
          href={`${basePath}/new`}
          className="min-h-9 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-on-accent transition-colors hover:opacity-90"
        >
          + Tambah
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm text-fg-muted">Belum ada entri.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {entries.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-fg">{entry.roleId}</p>
                  <p className="text-sm text-fg-muted">{entry.roleEn} — {entry.organizationId}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`${basePath}/${entry.id}`}
                    className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-fg transition-colors hover:bg-surface-2"
                  >
                    Edit
                  </Link>
                  {entry.previousSnapshot ? (
                    <form action={undoCareerEntryEditAction.bind(null, kind, entry.id)}>
                      <button
                        type="submit"
                        className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-2"
                      >
                        Urungkan ({entry.snapshotAt})
                      </button>
                    </form>
                  ) : null}
                  <form action={softDeleteCareerEntryAction.bind(null, kind, entry.id)}>
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
