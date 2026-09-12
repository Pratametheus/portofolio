import Link from 'next/link';
import {getCloudflareContext} from '@opennextjs/cloudflare';
import {listAdminAchievements} from '@/lib/repositories/achievements';
import {softDeleteAchievementAction, undoAchievementEditAction} from '@/lib/actions/achievements';

export const dynamic = 'force-dynamic';

export default async function AdminAchievementsPage() {
  const {env} = await getCloudflareContext({async: true});
  const entries = await listAdminAchievements(env.DB);

  return (
    <section>
      <h2>Pencapaian</h2>
      <Link href="/admin/achievements/new">+ Tambah</Link>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id} style={{marginTop: '0.75rem'}}>
            <strong>{entry.titleId}</strong> ({entry.type} · {entry.category})
            {' · '}
            <Link href={`/admin/achievements/${entry.id}`}>Edit</Link>
            {' · '}
            {entry.previousSnapshot ? (
              <form action={undoAchievementEditAction.bind(null, entry.id)} style={{display: 'inline'}}>
                <button type="submit">Urungkan perubahan dari {entry.snapshotAt}</button>
              </form>
            ) : null}
            {' · '}
            <form action={softDeleteAchievementAction.bind(null, entry.id)} style={{display: 'inline'}}>
              <button type="submit">Hapus</button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
