import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listTrashedCareerEntries} from '@/lib/repositories/career';
import {listTrashedAchievements} from '@/lib/repositories/achievements';
import {
  restoreCareerEntryFromTrashAction,
  permanentlyDeleteCareerEntryAction,
  restoreAchievementFromTrashAction,
  permanentlyDeleteAchievementAction
} from '@/lib/actions/trash';

export const dynamic = 'force-dynamic';

function PermanentDelete({action}: {action: () => Promise<void>}) {
  return (
    <details className="inline-block">
      <summary className="min-h-9 inline-flex cursor-pointer list-none items-center rounded-lg border border-red-600/40 px-3 py-1.5 text-xs text-red-600 transition-colors hover:bg-red-600/10">
        Hapus permanen
      </summary>
      <form action={action} className="mt-2 flex items-center gap-2 rounded-lg border border-red-600/40 bg-red-600/5 p-3">
        <span className="text-xs text-fg-muted">Tindakan ini tidak bisa dibatalkan. Yakin?</span>
        <button
          type="submit"
          className="min-h-9 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
        >
          Ya, hapus permanen
        </button>
      </form>
    </details>
  );
}

export default async function AdminTrashPage() {
  const {env} = await getCloudflareContext({async: true});
  const [careerEntries, achievements] = await Promise.all([
    listTrashedCareerEntries(env.DB),
    listTrashedAchievements(env.DB)
  ]);

  return (
    <section>
      <h1 className="font-display text-xl text-fg">Sampah</h1>

      <h2 className="mt-6 font-display text-sm font-semibold text-fg-muted">Karier &amp; Pendidikan</h2>
      {careerEntries.length === 0 ? (
        <p className="mt-2 text-sm text-fg-muted">Kosong.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {careerEntries.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-fg">{entry.roleId}</p>
                  <p className="text-sm text-fg-muted">{entry.kind} — dihapus {entry.deletedAt}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={restoreCareerEntryFromTrashAction.bind(null, entry.id)}>
                    <button
                      type="submit"
                      className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-fg transition-colors hover:bg-surface-2"
                    >
                      Pulihkan
                    </button>
                  </form>
                  <PermanentDelete action={permanentlyDeleteCareerEntryAction.bind(null, entry.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 font-display text-sm font-semibold text-fg-muted">Pencapaian</h2>
      {achievements.length === 0 ? (
        <p className="mt-2 text-sm text-fg-muted">Kosong.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {achievements.map((entry) => (
            <li key={entry.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-base text-fg">{entry.titleId}</p>
                  <p className="text-sm text-fg-muted">dihapus {entry.deletedAt}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <form action={restoreAchievementFromTrashAction.bind(null, entry.id)}>
                    <button
                      type="submit"
                      className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-xs text-fg transition-colors hover:bg-surface-2"
                    >
                      Pulihkan
                    </button>
                  </form>
                  <PermanentDelete action={permanentlyDeleteAchievementAction.bind(null, entry.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
